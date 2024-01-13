require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.APP_PORT || 5002;

const searchRoutes = require("./routes/searchRouter.js");


const APIRouter = express.Router();
APIRouter.use("/search", searchRoutes);

APIRouter.get("/version", function (req, res) {
  const { version } = require("./package.json");
  return res.json({ version });
});

app.use("/api", APIRouter);

app.listen(port, () => console.log(`API is running on port ${port}`));
