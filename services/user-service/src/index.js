const express = require("express");
const dbConnect = require("../config/connectdb");
const userRoutes = require('../routes/userRoutes');

const app = express();
dbConnect();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "User Service running" });
});

app.use('/users',userRoutes);

app.listen(5002, () => {
  console.log("User Service on port 5002");
});