const express = require("express");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Project Service running" });
});

app.listen(5003, () => {
  console.log("Project Service on port 5001");
});