const express = require('express');
const { createUser, login } = require('../controllers/auth');
const router = express.Router();

router.post('/register',(req,res,next)=> {
console.log("Registering user In Auth Service...");
next();
},createUser);

router.post('/login',(req,res,next)=> {
console.log("Logging In user In Auth Service...");
next();
},login);

module.exports = router;