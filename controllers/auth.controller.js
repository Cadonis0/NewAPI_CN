const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const login = async (req, res) => {
    try{
    //TODO como ir buscar dados
        const item

        const correctPassowrd = await bcrypt.compare(req.body.Password,item.Password)

        if(!correctPassowrd){
            return res.status(404).json({mensagem:"Email ou password errado"})
        }

        const token = jwt.sign({id:item.id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_LIFETIME})

        res.status(200).json({token})
    }catch(err){
        console.log(err)
        return res.status(500).json({mensagem:"Erro ao fazer login"})
    }
}

module.exports = {
    login
}