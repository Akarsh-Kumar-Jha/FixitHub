const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('connected to the postgres database✅');
});
pool.on('error', (err) => {
  console.error('error connecting to the database', err);
});

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

app.listen(5003, () => {
  console.log("Project Service on port 5003");
});