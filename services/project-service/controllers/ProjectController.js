const pool = require("../config/db");
const axios = require("axios");

exports.createProject = async (req, res) => {
  try {
    const { project_name, project_desc } = req.body;
    if (!project_name || !project_desc) {
      return res.status(400).json({
        success: false,
        message: "project_name both project_desc required",
      });
    }
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not Authenticated",
      });
    }

    try {
      await pool.query("BEGIN");
      const projectDbRes = await pool.query(
        `INSERT INTO projects (project_name,project_desc,owner_id)
                VALUES ($1,$2,$3)
                RETURNING *
                `,
        [project_name, project_desc, userId],
      );

      const newProject = projectDbRes.rows[0];

      // abb owner ko project members main add krna hai
      const projectMemberDbRes = await pool.query(
        `
                INSERT INTO project_members (project_id,user_id,role)
                VALUES ($1,$2,$3)
                RETURNING *
                `,
        [newProject.id, userId, "OWNER"],
      );

      await pool.query("COMMIT");
      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: newProject,
        membersData: projectMemberDbRes.rows[0],
      });
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error(
        "error occuered while creating project in postgres db",
        error,
      );
      return res.status(500).json({
        success: false,
        message: "Something went wrong in createProject controller IN DB",
        error,
      });
    }
  } catch (error) {
    console.log("Error Occuered in createProject Controller", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in createProject controller",
      error,
    });
  }
};

exports.getProjects = async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User not Authenticated",
    });
  }
  try {
    const results = await pool.query(
      `
             SELECT pm.user_id as user_id,
             p.project_name as project_name,
             p.project_desc as project_description,
             p.owner_id as owner_id,
             p.created_at as created_at
             FROM project_members pm
             INNER JOIN projects p 
             ON pm.project_id = p.id
             WHERE pm.user_id = $1
            `,
      [userId],
    );
    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: results.rows,
    });
  } catch (error) {
    console.error(
      "error occuered while getting projects in postgres db",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Something went wrong in getProjects controller IN DB",
      error,
    });
  }
};

// POST /projects/:projectId/invite
exports.inviteUser = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { invited_user_id } = req.body;
    if (!invited_user_id) {
      return res.status(400).json({
        success: false,
        message: "User Id is required for invation",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project Id is required for invation",
      });
    }
    const projectData = await pool.query(
      `
            SELECT p.project_name as project_name,p.owner_id as owner_id
            FROM projects p
            WHERE p.id = $1

            `,
      [projectId],
    );

    if (!projectData.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Project Not Found",
      });
    }
    console.log(
      "projectData.rows[0] response in projectController",
      projectData.rows[0],
    );
    const ownerIdFromProjectData = projectData.rows[0].owner_id;
    console.log(`Checking ownerIdFromProjectData = ${ownerIdFromProjectData} with ${typeof(ownerIdFromProjectData)} type and req.headers["x-user-id"] = ${req.headers["x-user-id"]} with ${typeof(req.headers["x-user-id"])} type`);
    if (ownerIdFromProjectData !== req.headers["x-user-id"]) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to invite user in this project",
      });
    }

    try {
      console.log("Calling user service getme api..........");
      const url = "http://user_service:5002/users/getme";
      const userFind = await axios.get(url, {
        headers: { "x-user-id": invited_user_id },
      });
      console.log("userFind Function Response ----=====------", userFind);
      if (userFind.status !== 200) {
        return res.status(404).json({
          success: false,
          message: "Requested User you are inviting Not Found",
        });
      }
      console.log("Invited User Exits In Our MongDB✅");

      console.log(
        "Now Checking that this user is already invited in this project or not ..........",
      );
      const userAlreadyInvited = await pool.query(
        `
SELECT project_id,user_id FROM project_members
WHERE user_id = $1 AND project_id = $2
`,
        [invited_user_id, projectId],
      );

      if (userAlreadyInvited.rows[0]) {
        return res.status(400).json({
          success: false,
          message: "User is already a member of this project",
        });
      }

      console.log("User is Not Invited in this project yet✅");

      console.log(
        "Now Checking That user is in the pending state of invite in this project or not ..........",
      );

      const userPendingInvite = await pool.query(
        `
              SELECT * FROM project_invites
              WHERE project_id = $1 AND invited_user_id = $2 AND status = 'PENDING'
              `,
        [projectId, invited_user_id],
      );

      if (userPendingInvite.rows[0]) {
        return res.status(400).json({
          success: false,
          message: "This user is already invited in this project",
        });
      }

      console.log("User is Not Invited in this project yet✅");
      console.log("Now Inviting User In This Project ..........");
      console.log("Creating Invite In Project Invites Table ..........");
      const finalRes = await pool.query(
        `
              INSERT INTO project_invites (project_id,invited_user_id,invited_by,status)
              VALUES ($1,$2,$3,'PENDING')
              RETURNING *
              `,
        [projectId, invited_user_id, req.headers["x-user-id"]],
      );

      console.log("Invite Created In Project Invites Table✅");
      return res.status(201).json({
        success: true,
        message: "User Invited successfully In ApiGateway✅",
        data: finalRes.rows,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server error in project Controller(Create Invite)",
        error: error,
      });
    }
  } catch (error) {
    console.error(
      "Error Occuered While Inviting User In Project Controller",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Something went wrong in inviteUser controller",
      error,
    });
  }
};


exports.getAllInvites = async(req,res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log(`In GetALLInvites Controller userId = ${userId}`);
    if(!userId){
      return res.status(400).json({
        success:false,
        message:"User not Authenticated",
      });
    };

    const allInvites = await pool.query(
      `
      SELECT pi.project_id as project_id,p.project_name as project_name,p.owner_id as owner_id,pi.status as project_status,p.created_at as project_created_at
      FROM project_invites pi
      INNER JOIN projects p
      ON pi.project_id = p.id
      WHERE pi.invited_user_id = $1
      `,
      [userId]
    );

    if(!allInvites.rows[0]){
      return res.status(404).json({
        success:false,
        message:"No Invites Found",
        data:[]
      });
    };


    return res.status(200).json({
      success:true,
      message:"Invites Found✅",
      data:allInvites.rows
    });
  } catch (error) {
    console.error('error in getAllInvites',error);
    return res.status(500).json({
      success:false,
      message:"Something went wrong in getAllInvites controller",
      error
    });
  }
}

exports.getAllSentInvites = async(req,res) => {
  try {
    const userId = req.headers["x-user-id"];
    if(!userId){
      return res.status(400).json({
        success:false,
        message:"User not Authenticated",
      });
    };

    const allSentInvites = await pool.query(
      `
      SELECT pi.id as invite_id ,pi.project_id,p.project_name as project_name,p.project_desc as project_description,pi.invited_user_id,pi.status as invite_status,pi.created_at as invite_created_at
      FROM project_invites pi
      INNER JOIN projects p
      ON pi.project_id = p.id
      WHERE pi.invited_by = $1
      ORDER BY pi.created_at DESC
      `,
      [userId]
    );

    console.log('allSentInvites In getAllSentInvites Controller',allSentInvites.rows);

    if(!allSentInvites.rowCount){
      return res.status(404).json({
        success:false,
        message:"No Invites Found",
        data:[]
      });
    };

    if(allSentInvites.rowCount){
      return res.status(200).json({
        success:true,
        message:"Invites Found✅",
        data:allSentInvites.rows
      });

    }
    
  } catch (error) {
    console.error('error occuered in getAllSentInvites controller',error);
    return res.status(500).json({
      success:false,
      message:"Something went wrong in getAllSentInvites controller",
      error
    });
  }
}

exports.getProjectMembers = async(req,res) => {
  try {

    const {projectId} = req.params;
    if(!projectId){
      return res.status(400).json({
        success:false,
        message:"Project Id is required",
      });
    };

    // const userId = req.headers["x-user-id"];

    // if(!userId){
    //   return res.status(400).json({
    //     success:false,
    //     message:"User not Authenticated",
    //   });
    // };

    const projectMembers = await pool.query(
      `
      SELECT pm.user_id as user_id,pm.role as user_role,p.project_name as project_name,p.project_desc as project_description,p.owner_id as owner_id
      FROM project_members pm
      INNER JOIN projects p
      ON pm.project_id = p.id
      WHERE pm.project_id = $1
      `,
      [projectId]
    );

    console.log('Project Members In projectMembers Controller',projectMembers.rows);

    if(projectMembers.rowCount == 0){
      return res.status(400).json({
        success:false,
        message:"No Members Found",
        data:[]
      });
    }

    return res.status(200).json({
      success:true,
      message:"Members Found✅",
      data:projectMembers.rows
    });
    
  } catch (error) {
    console.error('error occuered in getProjectMembers controller',error);
    return res.status(500).json({
      success:false,
      message:"Something went wrong in getProjectMembers controller",
      error
    });
  }
}


exports.acceptInvite = async(req,res) => {
  try {
    //POST /invites/:inviteId/accept
    const {inviteId} = req.params;
    const userId = req.headers["x-user-id"];

    if(!inviteId){
      return res.status(400).json({
        success:false,
        message:"Invite Id is required",
      });
    };
console.log('In AcceptInvite Controller userId',userId);
    if(!userId){
      return res.status(400).json({
        success:false,
        message:"User not Authenticated",
      });
    }

    const inviteData = await pool.query(
      `
      SELECT * FROM project_invites
      WHERE id = $1
      `,
      [inviteId]
    );

    console.log('In AcceptInvite Controller inviteData According to inviteId',inviteData.rows);


    if(!inviteData.rows[0]){
      return res.status(404).json({
        success:false,
        message:"Invite Not Found",
      });
    };


    if(inviteData.rows[0].status !== "PENDING"){
      return res.status(400).json({
        success:false,
        message:"Invite Already Accepted or Rejected",
      });
     };

     if(inviteData.rows[0].invited_user_id !== userId){
      return res.status(400).json({
        success:false,
        message:"You are not invited to this project",
      });
     };

     await pool.query('BEGIN');

    const projectMember = await pool.query(
      `
      INSERT INTO project_members (project_id,user_id,role)
      VALUES ($1,$2,'MEMBER')
      RETURNING *
      `,
      [inviteData.rows[0].project_id,userId]
     );

     const updatedInvite = await pool.query(
      `
      UPDATE project_invites
      SET status = 'ACCEPTED'
      WHERE id = $1
      `,
      [inviteId]
     );

     await pool.query('COMMIT');

     return res.status(200).json({
      success:true,
      message:"Invite Accepted✅",
      updatedInvite:updatedInvite.rows[0],
      updatedMembers:projectMember.rows
     });
    
  } catch (error) {
    console.error('error occuered in acceptInvite controller',error);
    pool.query('ROLLBACK');
    return res.status(500).json({
      success:false,
      message:"Something went wrong in acceptInvite controller",
      error
    })
  }
}

exports.rejectInvite = async(req,res) => {
  try {
    const {inviteId} = req.params;
    const userId = req.headers["x-user-id"];

    if(!inviteId){
      return res.status(400).json({
        success:false,
        message:"Invite Id is required",
      });
    };

    if(!userId){
      return res.status(400).json({
        success:false,
        message:"User not Authenticated",
      });
    };

    const InviteData = await pool.query(
      `
      SELECT * FROM project_invites
      WHERE id = $1      
      `,
      [inviteId]
    );

    if(InviteData.rowCount == 0){
      return res.status(404).json({
        success:false,
        message:"Invite Not Found",
      });
    };

    if(InviteData.rows[0].invited_user_id !== userId){
      return res.status(400).json({
        success:false,
        message:"You are not invited to this project",
      });
    };

    if(InviteData.rows[0].status !== "PENDING"){
      return res.status(400).json({
        success:false,
        message:"Invite Already Accepted or Rejected",
      });
    };


    const updatedInviteData = await pool.query(
      `
      UPDATE project_invites
      SET status = 'REJECTED'
      WHERE id = $1
      `,
      [inviteId]
    );

    return res.status(200).json({
      success:true,
      message:"Invite Rejected✅",
      updatedInvite:updatedInviteData.rows[0]
    });
    
  } catch (error) {
    console.error('error occuered in rejectInvite controller',error);
    return res.status(500).json({
      success:false,
      message:"Something went wrong in rejectInvite controller",
      error
    });
  }
}
