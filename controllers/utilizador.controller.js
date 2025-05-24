const utilizadorDao = require("../models/utilizadorDao")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

class utilizador {

    constructor(utilizadorDao){
        this.utilizadorDao = utilizadorDao
    }

    async getUtilizadores(req, res){
        try{
            const querySpec = {
                query: "SELECT * FROM Utilizadore u"
            }

            const items = await this.utilizadorDao.find(querySpec)
            res.status(200).json(items)
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a receber utilizadores"})
        }
    }

    async getUtilizadoId(req, res) {
        try{
            const id = req.params.id

            const item = await this.utilizadorDao.getItem(id)
            res.status(200).json(items)
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a receber utilizador"})
        }
    }

    async createUtilizador(req, res) {
        try{
            const item = req.body

            const salt = await bcrypt.genSalt(12)
            item.Password = await bcrypt.hash(item.Password, salt)

            await this.utilizadorDao.addItem(item)
            res.status(200).json({mensagem:"Utilizador criado com sucesso"})
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a criar utilizador"})
        }
    }

    async updateUtilizador(req,res) {
        try{
            const id = req.params.id
            const item = req.body

            await this.utilizadorDao.updateItem(id,item)
            res.status(200).json({mensagem:"Utilizador editado com sucesso"})
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a editar o utilizador"})
        }
    }

    async deleteUtilizador(req,res) {
        try{
            const id = req.params.id
            
            await this.utilizadorDao.deleteItem(id)
            res.status(200).json({mensagem:"Utilizador eliminado com sucesso"})
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a eliminar o utilizador"})
        }
    }

    async getNotficacoes(req,res) {
        try{
            const id = req.user.userId
            const item = await this.utilizadorDao.getItem(id)

            const notficacoesNaoLidas = (item.Notificações || []).filter(n => n.lida === false)

            res.status(200).json(notficacoesNaoLidas)
        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:""})
        }
    }

    async eliminarNotificacoes(req,res) {
        try {
        
            const item = await this.utilizadorDao.getItem(req.user.userId)

            if (!item) {
              console.log("Utilizador não encontrado");
              return { status: 404, message: "Utilizador não encontrado" };
            }

            item.Notificaçoes = [];

            // Atualizar todas as notificações
            /*if (Array.isArray(item.Notificaçoes)) {
                item.Notificaçoes = item.Notificaçoes.map(n => ({
                ...n,
                lida: true
              }));
            }*/
        
            // Substituir o documento no Cosmos DB
            await this.utilizadorDao.updateItem(req.user.userId,item)
        
            res.status(200).json({mensagem:"Notificações marcadas como lidas com sucesso"})
          } catch (error) {
            console.error( error);
            res.status(500).json({mensagem:"Erro ao marcar notificaçoes"}) 
          }
    }

    async loginUtilizador(req,res) {
        try{

            const querySpec = {
                query: "SELECT * FROM Utilizadores u WHERE u.Email = @email",
                parameters: [
                    {
                        name: "@email",
                        value: req.body.Email
                    }
                ]
            }
            const item = await this.utilizadorDao.find(querySpec)


            const correctPassowrd = await bcrypt.compare(req.body.Password,item[0].Password)

            if(!correctPassowrd){
                return res.status(404).json({mensagem:"Email ou password errado"})
            }

            const token = jwt.sign({id:item[0].id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_LIFETIME})

            res.status(200).json({token})

        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a fazer login"})
        }
    }

}

module.exports = utilizador