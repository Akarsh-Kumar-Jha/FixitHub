const express = require("express");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth Service running" });
});

// app.post('/auth/signup',async(req,res) => {
//   const {} = req.body;
// });

app.listen(5001, () => {
  console.log("Auth Service on port 5001");
});