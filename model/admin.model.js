const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    fname:String,
    lname:String,
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true
    },
    password:String
})
userSchema.set('timestamps',true);


const products = new mongoose.Schema({
    name:String,
    price:{
        type:Number,
        default:0
    },
    quantity:{
        type:Number,
        default:0
    }
})
products.set('timestapms',true);

const salesOrders = new mongoose.Schema({
    item:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products'
    },
    quantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        default:0
    }
})
salesOrders.set('timestamps',true);

mongoose.model('userSchema',userSchema,'users');
mongoose.model('products',products,'products');
mongoose.model('salesOrders',salesOrders,'salesOrders');

module.exports = {
    salesOrders:salesOrders,
    products:products,
    userSchema:userSchema
}