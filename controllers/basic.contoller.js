require('dotenv').config();
const mongoose = require('mongoose');
const productSchema = mongoose.model('products');
const userSchema = mongoose.model('userSchema');
const salesOrders = mongoose.model('salesOrders');
const Joi = require('joi');
const jwt = require('jsonwebtoken');


/**
 * @function isEmpty
 * @param strIn any
 * @description function will validate whether given param is undefined / empty / Null
 * @returns Boolean
 * */ 
const isEmpty = (strIn) =>
{
    if (strIn === undefined)
    {
        return true;
    }
    else if(strIn == null)
    {
        return true;
    }
    else if(strIn == "")
    {
        return true;
    }
    else
    {
        return false;
    }
}

/**
 * @function createProduct
 * @method POST
 * @param req payload object defined inside as "def"
 * @description function will insert data in products collection.
 * @returns Success boolean with message
 * */ 
module.exports.createProduct = (req,res)=>{
        let def = Joi.object().keys({
            name:Joi.string().min(3).required(),
            price:Joi.number().min(0).required(),
            quantity:Joi.number().min(0).required()
        })
        try {
            let {error,value} = def.validate(req.body);
            if(error){
                res.status(400).send({success:false,message:error.details[0].message});
            }
            if(value){
                productSchema.create(value,function(err,added){
                    if(err){
                        res.status(500).send({success:false,message:err})
                    }else{
                        res.status(201).send({success:true,message:'Item added.',response:added});
                    }
                })
            }
        } catch (error) {
            res.status(500).send({success:false,message:error})
        }
}

/**
 * @function signIn
 * @method POST
 * @param req payload object defined inside as "def"
 * @description function will check user existance in db, by compareing email and password.
 * @returns Success boolean, message, object with JWT.
 * */ 
module.exports.signIn = (req,res)=>{
    try {
        let def = Joi.object().keys({
            email:Joi.string().email().required(),
            password:Joi.string().required()
        });
        let {error,value} = def.validate(req.body);
        if(error){
            res.status(500).send({success:false,message:error.details[0].message});
        }
        if(isEmpty(value.email) == false && isEmpty(value.password) == false){
            userSchema.findOne({'email':value.email}).exec((err,user)=>{
                if(err){
                    res.status(500).send({success:false,message:'Internal server error.'});
                }else if(user.password == value.password){
                    console.log(user)
                    var token = jwt.sign({ email: user.email,id: user._id }, process.env.secret, { expiresIn: "1h" });
                    res.status(200).send({
                        success:true,
                        message:'LoggedIn',
                        response:{
                            'token':token,
                            'fname':user.fname,
                            'lname':user.lname,
                            'email':user.email
                        }
                    });
                }else{
                    res.status(401).send({success:false,message:'Wrong password.'});
                }
            })
        }else{
            res.status(401).send({success:false,message:'Invalid email or password.'});
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({success:false,message:error})
    }
}
// adding user. no validations added.
module.exports.addUser = (req,res)=>{
    try {
        userSchema.create(req.body,function(err,added){
            if(err){
                console.log(err);
            }else{
                res.status(201).json(added);
            }
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).send({success:false,message:'Internal server error.'})
    }
}

/**
 * @function addSalesOrder
 * @method POST
 * @param req payload object defined inside as "def"
 * @description function will create document in "salesOrders" collection.
 * @returns Success boolean, message.
 * */
module.exports.addSalesOrder = (req,res) =>{
    try {
        let def = Joi.object().keys({
            item:Joi.string().alphanum().required(),
            quantity:Joi.number().min(0).required()
        });

        let {error,value} = def.validate(req.body);
        if(error){
            console.log(error);
            res.status(500).send({success:false,message:error.details[0].message});
        }else{
            productSchema.findOne({_id:value.item}).exec((err,product)=>{
                if(err){
                    console.log(err);
                    res.status(500).send({success:false,message:'Internal server error.'});                    
                }else if(!product){
                    res.status(404).send({success:false,message:'Item not found.'});                    
                }else{
                    if(product.quantity >= value.quantity){
                        let total = product.price * parseInt(value.quantity);
                        salesOrders.create({
                            item:value.item,
                            quantity:parseInt(value.quantity),
                            price:total
                        },function(err,added){
                            if(err){
                                console.log(err);
                                res.status(500).send({success:false,message:'Internal server error.'});                    
                            }else{
                                res.status(201).send({success:true,message:'Sales order created.'})
                            }
                        })

                    }else{
                        res.status(200).send({success:false,message:'Stock not available.'})
                    }
                }
            })
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).send({success:false,message:'Internal server error.'})
    }
}

/**
 * @function getSalesOrder
 * @method GET
 * @param none
 * @description function will fetch products and related SO.
 * @returns Success boolean, Array[Objects].
 * */
module.exports.getSalesOrder = (req,res)=>{
    try {
        let main_pipeline = [
            {
                $lookup:{
                    from:'salesOrders',
                    let : {id:'$_id'},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $eq:['$item','$$id']
                                }
                            }
                        },
                        {
                            $project:{
                                count:'$quantity'
                            }
                        }
                    ],
                    as:'so'
                }
            },
            {
                $unwind:{path:'$so',preserveNullAndEmptyArrays:true}
            }
        ];
        productSchema
        .aggregate(main_pipeline)
        .exec((err,orders)=>{
            if(err){
                console.log(err);
                res.status(500).send({success:false,message:'Internal server error.'})
            }else{
                res.status(200).send({success:true,response:orders})
            }
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).send({success:false,message:'Internal server error.'})
    }
}

module.exports.getAllProducts = (req,res)=>{
    try {
        productSchema.find().select('name').exec((err,allItems)=>{
            if(err){
                console.log(err);
                res.status(500).send({success:false,message:'Internal server error.'});
            }else{
                res.status(200).send({success:true,response:allItems});
            }
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).send({success:false,message:'Internal server error.'})
    }
}