const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.authenticateUser = (req,res,next) => {
    try {
        console.log('Token Value In Auth Middleware',req.cookies.token);
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({success:false,message:"Not authenticated"});
        }
        const userPayload = jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user = userPayload;
        next();
    } catch (error) {
        console.log('error in authMiddleware',error);
        return res.status(401).json({success:false,message:"Invalid or expired token"});
    }
}