// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient


// For simplicity we'll set a constant partition key
const partitionKey = undefined
class receitaDao {
  /**
   * Manages reading, adding, and updating Tasks in Azure Cosmos DB
   * @param {CosmosClient} cosmosClient
   * @param {string} databaseId
   * @param {string} containerId
   */
  constructor(cosmosClient, databaseId, containerId) {
    this.client = cosmosClient
    this.databaseId = databaseId
    this.collectionId = containerId

    this.database = null
    this.container = null
  }

  async init() {
    console.log('Setting up the database...')
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId
    })
    this.database = dbResponse.database
    console.log('Setting up the database...done!')
    console.log('Setting up the container...')
    const coResponse = await this.database.containers.createIfNotExists({
      id: this.collectionId
    })
    this.container = coResponse.container
    console.log('Setting up the container...done!')
  }

  async find(querySpec) {
    console.log('Querying for items from the database')
    if (!this.container) {
      throw new Error('Collection is not initialized.')
    }
    const { resources } = await this.container.items.query(querySpec).fetchAll()
    return resources
  }

  async addItem(item) {
    console.log('Adding an item to the database')
    console.log(item)

    //item.date = Date.now()
    //item.completed = false
    const { resource: doc } = await this.container.items.create(item)
    return doc
  }

  async updateItem(itemId, item) {
    console.log('Update an item in the database')

    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(item)
    return replaced
  }

  async likeItem(itemId) {
    console.log('Update an item in the database')
    const doc = await this.getItem(itemId)
    doc.Gostos = doc.Gostos + 1

    const { resource: replaced } = await this.container
      .item(itemId, partitionKey)
      .replace(doc)
    return replaced
  }

  async deleteItem(itemId) {
    const response = await this.container.item(itemId, partitionKey).delete()
    return response
  }

  async getItem(itemId) {
    console.log('Getting an item from the database')
    const { resource } = await this.container.item(itemId, partitionKey).read()
    return resource
  }
}

module.exports = receitaDao