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
        res.cookie('t',token,{expire:new Date() + 9999})//<--- we have to clean this cookie for Signout

            // Return response with user and token to front End Client
                const{_id, name, role} = user 
                return res.json({token, user:{_id, email, name, role} }) 
    });

};

    //Sign Out

        exports.signout = (req, res) => {
            res.clearCookie('t')
            res.json({
                message:' We are outside alfred!! signout Success'
            })
        }


    //Require Sign In below
    
    exports.requireSignin = expressJwt ({
        secret: process.env.JWT_SECRET,
        userProperty: 'auth'
    });
        

    // Create the middlewares for none can check the status from someone else
    // only if if Admin wiht a diferent Role, but hte user can check his own profile.\
    

    exports.isAuth = (req, res, next) =>{
        let user = req.profile && req.auth && req.profile._id == req.auth._id
            if(!user){
                return res.status(403).json({
                    error:'Access Denied'
                })
            }
            next()
    }
