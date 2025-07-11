const express = require('express');
const recitasRoute = require('./routes/receita.route')
const utilizadorRoute = require('./routes/utilizador.route')
const authRoute = require('./routes/auth.route')
const cors = require('cors')
const { BlobServiceClient } = require('@azure/storage-blob');




require('dotenv').config();
const app = express();


async function createContainer(blobServiceClient, containerName){

    const containerClient = await blobServiceClient.createContainer(containerName);

    return containerClient;
}


app.use(cors())
app.use(express.json())

app.listen(process.env.PORT||4000)

app.use('/api/v1/auth',authRoute)
app.use('/api/v1/receitas',recitasRoute)
app.use('/api/v1/utilizadores',utilizadorRoute)


module.exports = app;
