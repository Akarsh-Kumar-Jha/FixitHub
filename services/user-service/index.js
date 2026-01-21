const express = require("express");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth Service running" });
});

app.listen(5002, () => {
  console.log("Auth Service on port 5001");
});