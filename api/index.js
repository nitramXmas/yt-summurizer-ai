require('dotenv').config();
const axios  = require("axios");
const cors = require("cors");
const ytApiKey = process.env.YT_API_KEY;
const ytApiUrl = "https://www.googleapis.com/youtube/v3";

const express = require("express");
const app = express();
const port = process.env.APP_PORT || 5002;

const APIRouter = express.Router();

app.use(cors())
app.use("/api", APIRouter);

APIRouter.get("/search", (req, res, next)=> {

const searchQuery = req.query.search_query

axios.get(`${ytApiUrl}/search`, {
  params : {
    key : ytApiKey,
    part: 'snippet',
    q: `tesla review`,
    type : 'video',
    order : 'viewcount',
    maxResults: 3,
    videoCaption: 'closedCaption'
  }
})
.then(response => {
  const videoIdArray = response.data.items.map(item => item.id.videoId)
  videoIdArray.forEach(videoId => {
    axios.get(`${ytApiUrl}/captions`, {
      params :{
        key : ytApiKey,
        part : 'snippet',
        videoId : videoId,
      }
    })
    .then(captionResponse => {
      const captions = captionResponse.data.items;
      const captionEnIdArray = captions.filter(caption=>(caption.snippet.language === 'en')).map(captionEn=>captionEn.id)
      const captionEnId = captionEnIdArray[0]
      //console.log(`En caption of video ${videoId} : ${captionEnId}`)
        axios.get(`${ytApiUrl}/captions/${captionEnId}`)
        .then(captionContentResponse => console.log(captionContentResponse))
        .catch(err => {
        console.error(`Error while fetching caption content for video ${videoId} caption ${captionEnId} : ${err}`)
        })

    })
    .catch(err => {
      console.error(`Error while fetching caption IDs for video ${videoId} : ${err}`)
    })
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