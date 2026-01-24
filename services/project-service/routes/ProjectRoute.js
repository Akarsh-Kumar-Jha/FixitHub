const express = require('express');
const { createProject, getProjects } = require('../controllers/ProjectController');
const router = express.Router();

router.post('/create-project',createProject);
router.get('/get-projects',getProjects);

module.exports = router;