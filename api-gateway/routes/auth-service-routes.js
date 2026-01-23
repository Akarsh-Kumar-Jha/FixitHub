const express = require('express');
const router = express.Router();
const axios = require("axios");
const { authenticateUser } = require('../middlewares/authMiddleware');
require('dotenv').config();


router.post('/register',async(req,res) => {
  const url = 'http://auth_service:5001/auth/register';
  const data = req.body;
  if(!data.email || !data.password || !data.name || !data){
    return res.status(400).json({
      success:false,
      message:"All fields are required",
    });
  }
try {
  const response = await axios.post(url,data);
 return res.json({
  success:true,
  message:"User registered successfully In ApiGateway✅",
  data:response.data
 });
} catch (error) {
  console.log(error,'------');
  res.status(500).json({
    success:false,
    message:"Something went wrong In ApiGateway register call",
    error:error
  });
}
});

router.post('/login',async(req,res) => {
  const url = 'http://auth_service:5001/auth/login';
  const data = req.body;
  if(!data.email || !data.password || !data){
    return res.status(400).json({
      success:false,
      message:"All fields are required",
    });
  }

  try {
  const response = await axios.post(url,data);
  console.log('Response of login In Api Gateway==',response.data.token);
 return res.cookie('token',response.data.token,{httpOnly:true,expires:new Date(Date.now() + 24*60*60*1000)}).json({
  success:true,
  message:"User logged In successfully In ApiGateway✅",
  data:response.data
 });
} catch (error) {
  console.log(error,'------');
  res.status(500).json({
    success:false,
    message:"Something went wrong In ApiGateway Login call",
    error:error
  });
}
 
});

router.post('/logout',(req,res) => {
  res.clearCookie('token');
  res.json({
    success:true,
    message:"User logged Out successfully In ApiGateway✅",
  });
});

router.get('/private',authenticateUser,(req,res) => {
  res.json({
    success:true,
    message:"Private route accessed successfully In ApiGateway✅",
    data:req.user
  });
});


module.exports = router;