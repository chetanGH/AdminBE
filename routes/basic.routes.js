const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/basic.contoller');
const mongoose = require('mongoose');
const userSchema = mongoose.model('userSchema');
const  { authMiddleware } = require('../middlewares/auth.middleware')


router.route('/login').post(ctrl.signIn);

router.use(authMiddleware);

router.get('/profile',authMiddleware,(req,res)=>{
    let decode = req.decode;
    userSchema.findOne({'email':decode.email}).exec((err,verified)=>{
        if(err){
            console.log(err);
            res.status(500).send({success:false,message:'Internal server error.'})
        }else if(!verified){
            res.status(403).send({success:false,message:'UnAuthorized access.'});
        }else{
            res.status(200).send({success:true,response:verified});
        }
    });
});

router.route('/addProduct').post(ctrl.createProduct);// adding product
router.route('/addUser').post(ctrl.addUser);
router.route('/createSalesOrder').post(ctrl.addSalesOrder);
router.route('/getSalesOrder').get(ctrl.getSalesOrder);//getSalesOrder
router.route('/getAllProducts').get(ctrl.getAllProducts);//getAllProducts
module.exports = router;