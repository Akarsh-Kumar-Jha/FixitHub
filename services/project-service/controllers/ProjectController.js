const pool = require("../config/db");

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
      return res
        .status(500)
        .json({
          success: false,
          message: "Something went wrong in createProject controller IN DB",
          error,
        });
    }
  } catch (error) {
    console.log("Error Occuered in createProject Controller", error);
    return res
      .status(500)
      .json({
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
            [userId]
    );
    return res.status(200).json({
        success:true,
        message:"Projects fetched successfully",
        data:results.rows
    });
  } catch (error) {
    console.error(
      "error occuered while getting projects in postgres db",
      error,
    );
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong in getProjects controller IN DB",
        error,
      });
  }
};
