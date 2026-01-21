const express = require("express");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "User Service running" });
});

app.listen(5002, () => {
  console.log("User Service on port 5001");
});