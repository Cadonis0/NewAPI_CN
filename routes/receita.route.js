const express = require('express');
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('../config')
const ReceitaDao = require('../models/receitaDao')
const Receita = require('../controllers/receita.controller')

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const cosmosClient = new CosmosClient({
    endpoint: config.host,
    key: config.authKey
  })
  

const receitaDao = new ReceitaDao(cosmosClient, config.databaseId, config.containerRecitasId)
const receita = new Receita(receitaDao)

receitaDao
  .init(err => {
    console.error(err)
  })
  .catch(err => {
    console.error(err)
    console.error('Shuting down because of db error')
    process.exit(1)
  })

const router = express.Router();

router.route('/publicas')
    .get((req,res) => receita.showReceitasPublicas(req,res))

router.route('/like/:id')
    .post((req,res) => receita.likeRecita(req,res))

router.route('/')
    .get((req,res) => receita.showRecitasUtilizador(req,res))
    .post(upload.single('imagem'),
        (req,res) => receita.addReceita(req,res))

//TODO editar image
router.route('/:id')
    .get((req,res) => receita.getRecitaId(req,res))
    .put((req,res) => receita.editRecita(req,res))
    .delete((req,res) => receita.eliminarReceita(req,res))

module.exports = router