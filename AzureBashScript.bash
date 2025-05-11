resourceGroupName="TrabalhoCN"
location="francecentral"

# Cosmos DB
cosmosAccount="cosmos-trabalho-cn"
cosmosDatabase="CozinhaConosco"
cosmosContainer="receitas"
cosmosPartitionKey="/id"

# Rede privada
vnetName="vnet-trabalho-cn"
subnetName="subnet-cosmos"
privateEndpointName="pe-cosmos-trabalho-cn"

# Storage para imagens
storageAccount="trabalhocnreceitas"
storageContainer="receitas-images"

# ─── 1. RESOURCE GROUP ───────────────────────────────────────────────────────
az group create \
  --name  "$resourceGroupName" \
  --location "$location"

# ─── 2. VNET + SUBNET ────────────────────────────────────────────────────────
az network vnet create \
  --resource-group $resourceGroupName \
  --name $vnetName \
  --address-prefix 10.1.0.0/16 \
  --subnet-name $subnetName \
  --subnet-prefix 10.1.1.0/24

# ─── 3. STORAGE ACCOUNT + CONTAINER ─────────────────────────────────────────
az storage account create \
  --resource-group  $resourceGroupName \
  --name            $storageAccount \
  --sku             Standard_LRS \
  --kind            StorageV2 \
  --location        $location

storageConnStr=$(az storage account show-connection-string \
  --resource-group  $resourceGroupName \
  --name            $storageAccount \
  --query           connectionString \
  --output          tsv)

az storage container create \
  --name            $storageContainer \
  --account-name    $storageAccount \
  --connection-string "$storageConnStr" \
  --public-access   container

# ─── 4. COSMOS DB (SQL API, Serverless) ─────────────────────────────────────
az cosmosdb create \
  --name                      $cosmosAccount \
  --resource-group            $resourceGroupName \
  --locations regionName="$location" failoverPriority=0 isZoneRedundant=False \
  --default-consistency-level Session \
  --capabilities EnableServerless \
  --kind GlobalDocumentDB \
  --public-network-access Disabled

az cosmosdb sql database create \
  --account-name   $cosmosAccount \
  --resource-group $resourceGroupName \
  --name           $cosmosDatabase

az cosmosdb sql container create \
  --account-name       $cosmosAccount \
  --resource-group     $resourceGroupName \
  --database-name      $cosmosDatabase \
  --name               $cosmosContainer \
  --partition-key-path $cosmosPartitionKey \
  --throughput         400

cosmosResourceId=$(az cosmosdb show \
  --name           $cosmosAccount \
  --resource-group $resourceGroupName \
  --query          id \
  --output         tsv)

az network private-endpoint create \
  --name                $privateEndpointName \
  --resource-group      $resourceGroupName \
  --vnet-name           $vnetName \
  --subnet              $subnetName \
  --private-connection-resource-id $cosmosResourceId \
  --group-id            Sql \
  --connection-name     "${privateEndpointName}-conn"

cat <<EOF

.env:

AZURE_STORAGE_CONNECTION_STRING="${storageConnStr}"
AZURE_STORAGE_CONTAINER="${storageContainer}"

COSMOS_URI="$(az cosmosdb show \
  --name $cosmosAccount \
  --resource-group $resourceGroupName \
  --query documentEndpoint \
  --output tsv)"
COSMOS_KEY="$(az cosmosdb keys list \
  --name $cosmosAccount \
  --resource-group $resourceGroupName \
  --query primaryMasterKey \
  --output tsv)"
COSMOS_DATABASE_ID="${cosmosDatabase}"
COSMOS_CONTAINER_ID="${cosmosContainer}"

EOF


echo "Setup concluído com sucesso!"




