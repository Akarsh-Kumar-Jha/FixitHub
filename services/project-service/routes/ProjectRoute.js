const express = require('express');
const { createProject, getProjects, inviteUser } = require('../controllers/ProjectController');
const router = express.Router();

router.post('/create-project',createProject);
router.get('/get-projects',getProjects);
router.post('/invite/:projectId',inviteUser);

module.exports = router;