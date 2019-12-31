const User = require('../models/user');
const {errorHandler} = require('../helpers/dbErrorHandle');
const jwt = require('jsonwebtoken'); //To generate the Sigin
const expressJwt = require('express-jwt')// To authorization Check




exports.signup = (req, res) => {
    
    const user = new User(req.body);
    user.save((err,user) =>{
        if(err){
            return res.status(400).json({
                err: errorHandler(err)
            });
        }
        user.salt = undefined
        user.hashed_password = undefined
        res.json({
            user
        })
    })
}

exports.signin = (req, res) => {
    //To find the user based Email

    const { email, password} = req.body
    User.findOne({email},(err,user)=>{
        if(err||!user){
            return res.status(400).json({
                error: ' User with that email doesnt exist. Please SignUp!'
            })
        }
            //If user is found make sure email and password match

            //Create authenticate in user model

        if(!user.authenticate(password)){
            return res.status(401).json({
                error:'Email and password Dont match'
            })
        }    

            // Generate a Signed token with user id and secret

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
            //  Persist the token as 'T' in cookien with expiry date
        res.cookie('t',token,{expire:new Date() + 9999})

            // Return response with user and token to front End Client
        const{_id, name, role} = user 
        return res.json({token, user:{_id, email, name, role} }) 
    });

};