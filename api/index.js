
const cors = require("cors")

require('dotenv').config();

const express = require("express");
const app = express();
const port = process.env.APP_PORT || 5002;
const APIRouter = express.Router();

app.use(cors())
app.use("/api", APIRouter);

APIRouter.get("/version", function (req, res) {
  const { version } = require("./package.json");
  return res.json({ version });
}); // create route to get the package.json version

app.listen(port, () => console.log(`API is running on port ${port}`));