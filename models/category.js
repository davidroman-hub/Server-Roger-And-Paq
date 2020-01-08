const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        trime: true,
        required: true,
        maxLenght:32
        },
    },

    {timestamps:true}
);

module.exports = mongoose.model("Category", categorySchema)