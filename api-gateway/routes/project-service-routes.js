const express = require('express');
const { authenticateUser } = require('../middlewares/authMiddleware');
const axios = require('axios');
const router = express.Router();

router.post('/create-project',authenticateUser,async(req,res) => {
    try {
        //{
//   "project_name": "FixitHub",
//   "project_desc": "Issue tracking system" }
        const {project_name,project_desc} = req.body;
        if(!project_name || !project_desc){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        };
        const axiosRes = await axios.post('http://project_service:5003/projects/create-project',{
            project_name,
            project_desc,
        },
    {
         headers:{'x-user-id':req.user.id}
    });
       return res.json({
            success:true,
            message:"Project created successfully In ApiGateway✅",
            data:axiosRes.data
        });
        
    } catch (error) {
        console.error('Error In Api Gateway while calling project service(Create Project)',error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong In ApiGateway Create Project call",
            error
        });
    }
});


router.get('/get-projects',authenticateUser,async(req,res) => {
    try {
        
        const axiosRes = await axios.get('http://project_service:5003/projects/get-projects',{
            headers:{'x-user-id':req.user.id}
        });

        return res.status(200).json({
            success:true,
            message:"Projects fetched successfully In ApiGateway✅",
            data:axiosRes.data
        });
    } catch (error) {
           console.error('Error In Api Gateway while calling project service(Get Projects)',error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong In ApiGateway Get Projects call",
            error
        });
    }
})


module.exports = router;