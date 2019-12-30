const express = require('express');
const router = express.Router()

// router.get('/', (req,res) => {
//     res.send('hello from  routes')
// } )
const {signup} = require('../controllers/user')
router.post('/signup',signup)

module.exports = router