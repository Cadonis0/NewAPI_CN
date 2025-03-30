const jwt = require('jsonwebtoken')

const auth = async (req,res,next) => {
    
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(403).send({mensagem: "Invalid token"})
    }

    const token = authHeader.split(' ')[1];

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user ={userId: payload.id};
        console.log(req.user)

        next()
    }catch (err){
        return res.status(403).send({mensagem: "Invalid token"})
    }
}

module.exports = {
    auth
}