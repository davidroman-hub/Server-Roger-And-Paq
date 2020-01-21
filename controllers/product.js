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


////////////////////////////////////////////////////////////////////////////////////////////


/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */




exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
}; 

/**
 * For visualizing the photos in the web-browser we need to use :
 * http://localhost:8000/api/product/photo/5e25d6f4159d2428ec504517 
 *                                          this is the id remember
 */


 exports.photo = (req, res) => { 
     if(req.product.photo.data){
         res.set('Content-Type', req.product.contentType)
         return res.send(req.product.photo.data)
     }
     next()
 }
 


 