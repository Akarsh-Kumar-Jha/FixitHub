const express = require('express');
const router = express.Router();
const axios = require("axios");
const { authenticateUser } = require('../middlewares/authMiddleware');
require('dotenv').config();


router.get('/getme',authenticateUser,async(req,res) => {
  try {
      const axiosRes = await axios.get('http://user_service:5002/users/getme',{
          headers:{'x-user-id':req.user.id}
      });
      res.json({
          success:true,
          message:"User found successfully In ApiGateway✅",
          data:axiosRes.data
      });
  } catch (error) {
        console.error('error in getme in apigateway',error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong In ApiGateway getme call",
            error
        });
  }
});

router.get('/search',authenticateUser,async(req,res) => {
  try {
      const axiosRes = await axios.get('http://user_service:5002/users/search?username='+req.query.username);
      res.json({
          success:true,
          message:"User found successfully In ApiGateway✅",
          data:axiosRes.data
      });
  } catch (error) {
        console.error('error in search in apigateway',error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong In ApiGateway search call",
            error
        });
  }
});





module.exports = router;