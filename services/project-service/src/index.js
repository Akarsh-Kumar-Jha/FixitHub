const express = require("express");
const projectRouter = require('../routes/ProjectRoute');
const pool = require("../config/db");

const app = express();
app.use(express.json());
require('dotenv').config();

app.get("/health", (req, res) => {
  res.json({ status: "Project Service running" });
});

app.get('/test',async(req,res) => {
try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Project Service Testing Done✅",
      data:result.rows
    });
} catch (error) {
  console.error('error in postgres in project-service',error);
}
});

app.use('/projects',projectRouter);
app.listen(5003, () => {
  console.log("Project Service on port 5003");
});