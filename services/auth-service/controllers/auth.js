const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

exports.createUser = async(req,res) => {
    try {
        const {name,email,password} = req.body;
        if(!email || !password || !name){
            return res.status(400).json(
                {
                    success:false,
                    message:"All fields are required",
                }
            )
        };
        const userFind = await User.findOne({email});
        if(userFind){
            return res.status(400).json(
                {
                    success:false,
                    message:"User already exists",
                }
            )
        };

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            name,
            email,
            password:hashedPassword
        });


        console.log('Naya User Ban Gya In Auth-service abb In User-Service.........');
try {
    const userResponse = await axios.post('http://user_service:5002/users/create-user',{
        id:newUser._id,
        username:newUser.username,
        email
    });
        return res.status(201).json(
            {
                success:true,
                message:"User created successfully✅",
                user:newUser,
                user_service_res:userResponse.data
            }
        );
} catch (error) {
    return res.status(500).json(
        {
            success:false,
            message:"Something went wrong In User-Service",
            error:error
        }
    )
}
        
    } catch (error) {
        console.log('err occuered in auth controller',error);
        return res.status(500).json(
            {
            success:false,
            message:"Internal Server Error",
            error:error
            }
        );
    }
}

exports.login = async(req,res) => {
    try {
        
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json(
                {
                    success:false,
                    message:"All fields are required",
                }
            )
        };

        const userFind = await User.findByEmail(email);
        if(!userFind){
            return res.status(400).json(
                {
                    success:false,
                    message:"User not found",
                }
            )
        };

        const isMatch = await bcrypt.compare(password,userFind.password);
        if(!isMatch){
            return res.status(400).json(
                {
                    success:false,
                    message:"Invalid credentials",
                }
            )
        };
        const payload = {
            id:userFind._id,
            email:userFind.email
        };
        const jwtToken = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"1d"
        });

        return res.status(200).json(
            {
                success:true,
                message:"User logged in successfully✅",
                user:userFind,
                token:jwtToken
            }
        );
    } catch (error) {
        console.log('err occuered in auth login controller',error);
        return res.status(500).json(
            {
            success:false,
            message:"Internal Server Error",
            error
            }
        );
    }
}