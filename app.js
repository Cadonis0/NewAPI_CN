const express = require('express');
const recitasRoute = require('./routes/receita.route')
const utilizadorRoute = require('./routes/utilizador.route')
const {auth} = require('./middleware/authentication')

require('dotenv').config();


const app = express();
app.use(express.json())

app.use('/api/v1/recitas',recitasRoute)
app.use('/api/v1/utilizadores',utilizadorRoute)


//app.get('/api/v1/recitas/publicas',(req,res) => receita.showReceitasPublicas(req,res))
//app.post('/api/v1/receitas',(req,res) => receita.addReceita(req,res))



module.exports = app;
