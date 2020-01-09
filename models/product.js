const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const productSchema = new mongoose.Schema(

    {
        name:{
            type:String,
            trim:true,
            required:true,
            maxlength:32
        },

        description:{
            type:String,
            required:true,
            maxlength:2000
        },

        price:{
            type:Number,
            trim:true,
            required:true,
            maxlength:32
        },
        category:{
            type:ObjectId,// that why i brought the object id ,
            // when i create the category it will be here.
            ref:'Category',//this is the name of the category name
            required:true
        },
        quantity:{
            type:Number
        },
        sold:{
            type:Number,
            default:0
        },
        photo:{
            data:Buffer,
            contentType:String
        },
        Shipping:{
            required:false,
            type:Boolean
        }
    },
        {timestamps:true}
);

module.exports = mongoose.model('Product', productSchema);

