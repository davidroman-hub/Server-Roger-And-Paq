const express = require('express');
const router = express.Router()

// router.get('/', (req,res) => {
//     res.send('hello from  routes')
// } )
const { 
    
    signup,
    signin,
    signout,
    requireSignin 

} = require('../controllers/user')
const { userSignupValidator } = require('../validator')

router.post('/signup',userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

router.get('/hello', requireSignin, (req,res) =>{
    res.send('hello there')
})


module.exports = router