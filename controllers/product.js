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

/// Sell / Arrival ///

/* we want to  return the product  

  by sell  /products?sortBy=sold&order=desc&limit=4  /// method for see how many we sold
  by arrival /products?sortBy=createAt&order=desc&limit=4 //

 if the parants are not send, then all the products are returned

 Remember, if we only want to know the products list you can only use the route : http://localhost:8000/api/products

*/

exports.list = (req, res) => { 
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find()
        .select("-photo")
        .populate('category')
        .sort([[sortBy, order]])
        .limit((limit))
        .exec((err, products) =>{
            if(err){
                return res.status(400).json({
                    error: " Product not found "
                })
            }
            res.send(products)
    })

} 



////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * the next method it will for find the products based with req product category
 * other products that has the same category, will be returned
 * 
 */

 exports.listRelated = (req, res) => {
     let limit = req.query.limit ? parseInt(req.query.limit): 6 ;
//we need to create a method to find the related categories  from the product so,
//if we gonna use a product to find the related products we can't  use the same product.(not including it self)
    Product.find({
    _id:{$ne: req.product},
    category:req.product.category })

    .limit(limit)
    .populate('category', '_id name')
    .exec((err, products) => {
        if(err){
            return res.status(400).json({
                error:"Products not found"
            })
        }
        res.json(products)
    })

 }


/// list Products /// 

exports.listCategories = (req, res) => {
    Product.distinct("category", {}, (err, categories) =>{
        if(err){
            return res.status(400).json({
                error: " Category not found"
            })
        }
        res.json(categories)
    })
}