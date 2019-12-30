const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

//app
const app = express()

//data base

mongoose.connect(process.env.DATABASE,{

    useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology:true

})
.then(()=>console.log('Db Connected'))

//import routes
const userRoutes = require('./Routes/user')


//routes 
app.get('/', (req,res)=>{

    res.send('hello from node ;)')

});

app.use('/api', userRoutes)




//server

const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
})
