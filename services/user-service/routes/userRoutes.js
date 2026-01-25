const express = require('express');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');
const router = express.Router();

router.post('/create-user',async(req,res) => {
    console.log("Registering user In User Service...");
try {
        const {id,username,email} = req.body;
    
        if(!id || !username || !email){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        };
        const userExists = await User.findById(id);
        if(userExists){
            return res.status(400).json({
                success:false,
                message:"User already exists",
            });
        };
        const idd = new mongoose.Types.ObjectId(id);
        const newUser = await User.create({
            _id:idd,
            username,
            email
        });
        return res.status(200).json({
            success:true,
            message:"User registered successfully",
            data:newUser
        });
} catch (error) {
    console.error('Error registering user In User-Service:', error);
    return res.status(500).json({
        success:false,
        message:"Something went wrong In User-Service register call",
        error
    });
}
});


router.get('/getme',async(req,res) => {
    try {
        console.log('Getting user In User Service.........');
        const userId = req.headers['x-user-id'];
        if(!userId){
            return res.status(400).json({
                success:false,
                message:"User not Authenticated",
            });
        };

        const userFind = await User.findById(userId);
        if(!userFind){
            return res.status(400).json({
                success:false,
                message:"User not found",
            });
        };

        return res.status(200).json({
            success:true,
            message:"User found successfully",
            data:userFind
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error In User Service",
            error
        });
    }
});

// GET /users/search?username=
router.get('/search',async(req,res) => {
  try {
      const {username} = req.query;
  
      if(!username){
          return res.status(400).json({
              success:false,
              message:"Username query is required",
          });
      };
  
      const userFindByUserName = await User.findOne({username});
      if(!userFindByUserName){
          return res.status(400).json({
              success:false,
              message:"Requested User not found",
          });
      };
      return res.status(200).json({
          success:true,
          message:"Requested User Found✅",
          user:userFindByUserName
      });
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"Internal Server Error In User Service",
        error
    });
  }
});


module.exports = router;