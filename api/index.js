import "dotenv/config"
import express from "express";
const app = express();
const port = process.env.APP_PORT || 5002;

import searchRouter from "./routes/searchRouter.js"
import version from "./package.json" with {type: "json"}


const APIRouter = express.Router();
APIRouter.use("/search", searchRouter);

APIRouter.get("/version", function (req, res) {
  return res.json( {version} );
});

app.use("/api", APIRouter);

app.listen(port, () => console.log(`API is running on port ${port}`));
