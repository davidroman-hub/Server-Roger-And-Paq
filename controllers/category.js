const Category = require('../models/category');
const { errorHandler } = require('../helpers/dbErrorHandle');


////////////// Category Id Method //////////////


exports.categoryById = (req, res, next, id) =>{
    Category.findById(id).exec((err,category)=>{
        if(err || !category){
            return res.status(400).json({
                error:'Category Doesnt not exist'
            });
        }
        req.category = category
        next();
    })
};


//////////// Create Method /////////////////

exports.create = (req,res) => {
    const category = new Category(req.body)
    category.save((err, data)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({data})
    });
};


//////////// Read method ////////////////

exports.read = (req, res)=> {
    return res.json(req.category)
}

////////////    Update Method      ///////////////

// exports.update = (req, res) => { 
//     const category = req.category
//     category.name = req.body.name
//     category.save((err, data) => {
//         if(err){
//             return res.status(400).json({
//                 error:errorHandler (err)
//             });
//         }
//         res.json(data);
//     });
// };
exports.update = (req, res)=> {
    const category = req.category
    category.name = req.body.name
    category.save((err, data)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            });
        }
        res.json(data);
    });
};
/////////// Remove Method /////////////// 

exports.remove = (req, res) => {
    const category = req.category;
    category.remove((err, data)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            });
        }
        res.json({
            message:'Category delated'
        });
    });
};

/////////// List of all the Categories Method /////////

exports.list = (req, res) => {
    Category.find().exec((err, data)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            });
        }

        res.json(data);
    });
};
