const express = require("express");
const ConnectDb = require("../config/dbConnect");
const userRoutes = require('../routes/userRoutes');

const app = express();
ConnectDb();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth Service running" });
});
app.get('/',(req,res) => res.send("Auth Service✅........"));

app.use('/auth',userRoutes);

app.listen(5001, () => {
  console.log("Auth Service on port 5001");
});