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

    //TODO como fazer com password
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

    //TODO fazer ler/eliminar notificaçoes

    async loginUtilizador(req,res) {
        try{

            const querySpec = {
                query: "SELECT u.Password, u.id FROM Utilizadore u WHERE u.Email = @email",
                parameters: [
                    {
                        name: "@email",
                        value: req.body.Email
                    }
                ]
            }
            const item = await this.utilizadorDao.find(querySpec)

            const correctPassowrd = await bcrypt.compare(req.body.Password,item.Password)

            if(!correctPassowrd){
                return res.status(404).json({mensagem:"Email ou password errado"})
            }
    
            const token = jwt.sign({id:item.id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_LIFETIME})
    
            res.status(200).json({token})

        }catch(err){
            console.log(err)
            res.status(500).json({mensagem:"Erro a fazer login"})
        }
    }

}

module.exports = utilizador