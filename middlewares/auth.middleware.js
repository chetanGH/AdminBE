require('dotenv').config();
const jwt = require('jsonwebtoken');

const session_check = (req,res,next)=>{
    let token = req.headers['authorization'];
    if(!token){
        res.status(400).send({success:false, message:'No token specified.',sessionexp:true});
    }else{
        jwt.verify(token, process.env.secret , (err, decode) => {
            if (err) {
                res.json({ success: false, message: "Invalid Token:" + err, sessionexp: true });
            } else {
                req.decode = decode;
                next();
            }
        })
    }
}

module.exports.authMiddleware = session_check;