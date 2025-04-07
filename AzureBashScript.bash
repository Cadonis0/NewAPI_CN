resourceGroupName="TrabalhoCN"
nameCosmosDbAccount="base-dados-trabalho-cn"
nameBaseDados="CozinhaConosco"
location="france"
privateEndpointName="private-endpoint-trabalho-cn"

az group create --name $resourceGroupName --location $location


az network vnet create \
    --resource-group $resourceGroupName \
    --name $nameVnet \
    --address-prefix 10.0.0.0/16 \
    --subnet-name $subnetName \
    --subnet-prefix 10.0.0.0/24

az cosmosdb create \
    --name $nameCosmosDbAccount \
    --resource-group $resourceGroupName \
    --default-consistency-level Session \
    --capability EnableServerless \
    --kind GlobalDocumentDB \
    --public-network-access Disabled \

az cosmosdb sql database create \
    --account-name $nameCosmosDbAccount \
    --resource-group $resourceGroupName \
    --name $nameBaseDados \

cosmosResourceId=$(az cosmosdb show --name $cosmosAccount --resource-group $resourceGroup --query "id" -o tsv)

az network private-endpoint create \
  --name $privateEndpointName \
  --resource-group $resourceGroup \
  --vnet-name $vnetName \
  --subnet $subnetName \
  --private-connection-resource-id $cosmosResourceId \
  --group-id Sql \
  --connection-name "${privateEndpointName}-conn"



