const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require('../models/product');
const { errorHandler } = require('../helpers/dbErrorHandle')

exports.productById = (req, res, next , id) => {
    
    Product.findById(id).exec((err, product)=>{
        if(err || !product){
            return res.status(400).json({
                error:'Product not found'
            })
        }

        req.product = product;
        next()
    });
};
exports.read = (req, res) => {
    req.product.photo = undefined
    return res.json(req.product);
 } 


exports.create = (req,res) =>{

    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req,(err,fields,files) => {
        
        if(err){
            return res.status(400).json({
                error:'image Could not be uploaded'
            });
        }
//Check all the fields are required

        const {name,description,price,category, shipping, quantity} = fields
        if(!name || !description || !price || !category|| !shipping || !quantity){
            return res.status(400).json({
                error:'All the fileds are required'
            })
        }

        
        let product = new Product(fields)

        //1kb == 1000
        //1mb == 1 000 000 
        
        if(files.photo){
//this is for auth the phot less than 1 mb 
        if(files.photo.size > 1000000) {
            return res.status(400).json({
                error:'the image should be less than 1 mb'
            })
        }    

            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err,result)=>{
            if(err){
                return res.status(400).json({
                    error:errorHandler(error)
                })
            }
            res.json(result)
        });
    });
};

exports.remove = (req, res) => {
    let product = req.product
        product.remove((err, deletedProduct)=>{
            if(err){
                return res.status(400).json({
                    error:errorHandler(err)
                });
            }
            res.json({
                //deletedProduct,
                "message":"Product deleted successfully"
            })
        })
};

exports.update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files)=>{
        if(err){
            return res.status(400).json({
                error:' image could not be uploaded'
            });
        }
// check for all the fields have to be required

const {name,description, price,category, shipping,quantity} = fields
        if(!name || !description || !price || !category|| !shipping|| !quantity){
            return res.status(400).json({
                error:" all the fields are required"
            })
        }
        let product = req.product;
        product= _.extend(product, fields);

        //the same 1kb == 1000
        //1mb = 1 000 000

        if(files.photo){

            if(files.photo.size >1000000){
                return res.status.json({
                    error:" the image should be less than 1 mb size"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

            product.save((err, result)=>{
                if(err){
                    return res.status(400).json({
                        error:errorHandler(error)
                    })
                }
                res.json(result)
            });
    });
};