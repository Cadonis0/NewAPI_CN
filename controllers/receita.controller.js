const receitaDao = require("../models/receitaDao")
const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'imagens';

class receita {

    constructor(receitaDao){
        this.receitaDao = receitaDao
    }

    async showReceitasPublicas(req,res){
        try{
            const querySpec = {
                query: "SELECT * FROM receitas r WHERE r.Publico=@publicado",
                parameters: [
                    {
                        name: "@publicado",
                        value: true
                    }
                ]
            }

            const items = await this.receitaDao.find(querySpec);
            res.status(200).json(items)
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a receber receitas publicas"})
        }
    }


    async showRecitasUtilizador(req, res){
        try{
            const querySpec = {
                query: "SELECT * FROM recitas r WHERE IdUtilizador=@utilizador",
                parameters: [
                    {
                        name: "@utilizador",
                        value: req.user.userId
                    }
                ]
            }

            const items = await this.receitaDao.find(querySpec)
            res.status(200).json(items)
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a receber receitas do utilizador"})
        }
    }


    async getRecitaId(req,res){
        try{
            const id = req.params.id

            const item = await this.receitaDao.getItem(id)
            res.status(200).json(item)
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a receber receita"})
        }
    }

    //TODO fazer parte da image
    async addReceita(req, res) {
        try{

            /*
            const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            
            const blobName = Date.now() + "-" + req.file.originalname;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            
            await blockBlobClient.uploadData(req.file.buffer, {
                blobHTTPHeaders: { blobContentType: req.file.mimetype },
              });
            
            console.log(blockBlobClient.url)
            */

            const item = req.body;
            item.IdUtilizador = req.user.userId

            const saved = await this.receitaDao.addItem(item);
            res.status(201).json(saved)
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a adicionar receita"})
        }
    }

    async likeRecita(req, res) {
        try{
            const idReceita = req.params.id
            const idUtilizador = req.user.userId
            const linkFunction = process.env.LINKFUNCTION

            await this.receitaDao.likeItem(idReceita)

            //TODO fazer pedido ao function
            
            const resp = await fetch(linkFunction,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    UtilizadorGostou:idUtilizador,
                    IdReceita:idReceita,
                    lida:false
                })
            })
            const resposta = resp.json()
            //if()

            res.status(200).json({mensagem:"Gostado com sucesso"})
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a dar gosto na receita"})
        }
    }

    async editRecita(req, res){
        try{
            const id = req.params.id
            const item = req.body

            await this.receitaDao.updateItem(id,item)
            res.status(200).json({mensagem:"Editado com sucesso"})
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a editar receita"})
        }
    }

    async eliminarReceita(req, res){
        try{
            const id = req.params.id

            await this.receitaDao.deleteItem(id)
            res.status(200).json({mensagem:"Eliminado com sucesso"})
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro ao eliminar recita"})
        }
    }
    

}

module.exports = receita