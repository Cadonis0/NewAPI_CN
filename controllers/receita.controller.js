const receitaDao = require("../models/receitaDao")
const { BlobServiceClient } = require('@azure/storage-blob');


const path = require('path');

const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_STORAGE_CONTAINER
);

async function ensureContainer() {
    if (!(await containerClient.exists())) {
        await containerClient.create({ access: 'container' });
        console.log(`Container criado: ${process.env.AZURE_STORAGE_CONTAINER}`);
    }
}
ensureContainer().catch(console.error);



class receita {

    constructor(receitaDao){
        this.receitaDao = receitaDao
    }

    async showReceitasPublicas(req,res){
        try{
            const querySpec = {
                query: "SELECT * FROM Receitas r WHERE r.Publico=@publicado",
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
                query: "SELECT * FROM Receitas r WHERE r.IdUtilizador=@utilizador",
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

    async addReceita(req, res) {
        try{
            const item = req.body;

            if (req.file) {
                // cria nome único
                const blobName = `${Date.now()}${path.extname(req.file.originalname).toLowerCase()}`;
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                await blockBlobClient.upload(req.file.buffer, req.file.size, {
                    blobHTTPHeaders: { blobContentType: req.file.mimetype }
                });

                // URL pública
                item.imagemUrl = blockBlobClient.url;
            }


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