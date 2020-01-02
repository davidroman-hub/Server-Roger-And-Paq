const express = require('express');
const router = express.Router()

// router.get('/', (req,res) => {
//     res.send('hello from  routes')
// } )
const { signup, signin,signout } = require('../controllers/user')
const { userSignupValidator } = require('../validator')

router.post('/signup',userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout)

module.exports = router