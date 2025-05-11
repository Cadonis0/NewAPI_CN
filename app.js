const express = require('express');
const recitasRoute = require('./routes/receita.route')
const utilizadorRoute = require('./routes/utilizador.route')
const authRoute = require('./routes/auth.route')
const cors = require('cors')

const {auth} = require('./middleware/authentication')

require('dotenv').config();


const app = express();
app.use(cors())
app.use(express.json())

app.listen(5000)

app.use('/api/v1/auth',authRoute)
app.use('/api/v1/receitas',recitasRoute)
app.use('/api/v1/utilizadores',utilizadorRoute)


module.exports = app;
