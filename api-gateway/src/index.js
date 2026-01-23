const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authServiceRoutes = require('../routes/auth-service-routes');
const userServiceRoutes = require('../routes/user-service-routes');
const app = express();

require("dotenv").config();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

function logger(req,res,next){
  const date = new Date();
  const time = date.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  console.log(`Api Gateway Triggered with method:${req.method} and url is:${req.originalUrl} at ${time}`);
  next();
}
app.use(logger);

app.get("/health", (req, res) => {
  res.json({ status: "API Gateway running" });
});

app.use('/auth',authServiceRoutes);
app.use('/users',userServiceRoutes);

app.listen(4000, () => {
  console.log("API Gateway on port 4000");
});