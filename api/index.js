require('dotenv').config();
const axios  = require("axios");
const cors = require("cors");

var getSubtitles = require('youtube-captions-scraper').getSubtitles;

const ytApiKey = process.env.YT_API_KEY;
const ytApiUrl = "https://www.googleapis.com/youtube/v3";

const express = require("express");
const app = express();
const port = process.env.APP_PORT || 5002;

const APIRouter = express.Router();

app.use(cors())
app.use("/api", APIRouter);

APIRouter.get("/search", (req, res, next)=> {

// res.writeHead(301, { "Location": authorizationUrl });

const searchQuery = req.query.search_query

axios.get(`${ytApiUrl}/search`, {
  params : {
    key : ytApiKey,
    part: 'snippet',
    q: `iphone 13 pro review`,
    type : 'video',
    order : 'viewcount',
    maxResults: 5,
    videoCaption: 'closedCaption'
  }
})
.then(response => {
  const videoIdArray = response.data.items.map(item => item.id.videoId)
  videoIdArray.forEach(videoId => {

getSubtitles({
  videoID: videoId, // youtube video id
  lang: 'en' // default: `en`
}).then(function(captions) {
  let result = ''
  captions.forEach(caption =>{
    result += caption.text
  })
  console.log(result);
});

  })
})
.catch(err => {
  console.error(`Error while fetching search data for 'tesla review' : ${err}`)
})
})

APIRouter.get("/version", function (req, res) {
  const { version } = require("./package.json");
  return res.json({ version });
}); // create route to get the package.json version

app.listen(port, () => console.log(`API is running on port ${port}`));