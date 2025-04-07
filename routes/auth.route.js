const express = require('express');
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('../config')
const UtilizadorDao = require('../models/utilizadorDao')
const Utilizador = require('../controllers/utilizador.controller')

const cosmosClient = new CosmosClient({
    endpoint: config.host,
    key: config.authKey
  })
  

const utilizadorDao = new UtilizadorDao(cosmosClient, config.databaseId, config.containerUtilizadoresId)
const utilizador = new Utilizador(utilizadorDao)

utilizadorDao
  .init(err => {
    console.error(err)
  })
  .catch(err => {
    console.error(err)
    console.error('Shuting down because of db error')
    process.exit(1)
  })

const router = express.Router();

router.route("/login")
    .post((req,res) => utilizador.loginUtilizador(req,res))

router.route("/register")
    .post((req,res) => utilizador.createUtilizador(req,res))

module.exports = router