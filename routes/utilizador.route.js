const express = require('express');
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('../config')
const UtilizadorDao = require('../models/utilizadorDao')
const Utilizador = require('../controllers/utilizador.controller')
const {auth} = require('../middleware/authentication')

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

router.route('/notficacoes')
    .get(auth,(req,res) => utilizador.getNotficacoes(req,res))
    .delete(auth,(req,res) => utilizador.eliminarNotificacoes(req,res))

router.route('/')
    .get((req,res) => utilizador.getUtilizadores(req,res))
    .post((req,res) => utilizador.createUtilizador(req,res))

router.route('/:id')
    .get((req,res) => utilizador.getUtilizadoId(req,res))
    .put((req,res) => utilizador.updateUtilizador(req,res))
    .delete((req,res) => utilizador.deleteUtilizador(req,res))

module.exports = router