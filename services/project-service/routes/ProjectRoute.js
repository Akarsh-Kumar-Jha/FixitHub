const express = require('express');
const { createProject, getProjects, inviteUser, getAllInvites, getAllSentInvites, acceptInvite, getProjectMembers, rejectInvite } = require('../controllers/ProjectController');
const router = express.Router();

router.post('/create-project',createProject);
router.get('/get-projects',getProjects);
router.post('/invite/:projectId',inviteUser);
router.get('/getallinvites',getAllInvites);
router.get('/getallsentinvites',getAllSentInvites);
router.post('/invites/accept/:inviteId',acceptInvite);
router.post('/invites/reject/:inviteId',rejectInvite);
router.get('/getmembers/:projectId',getProjectMembers);

module.exports = router;