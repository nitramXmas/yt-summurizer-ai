const express = require("express");
const axios = require("axios");
const cors = require("cors");
const OpenAI = require("openai")
const bodyParser = require("body-parser");
const getSubtitles = require('youtube-captions-scraper').getSubtitles;

const openai = new OpenAI();
const ytApiKey = process.env.YT_API_KEY;
const ytApiUrl = "https://www.googleapis.com/youtube/v3";

const searchRouter = express.Router();

searchRouter.use(cors());
searchRouter.use(bodyParser.json());
searchRouter.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

searchRouter.post("/", async (req, res, next) => {
  try {
    const searchQuery = req.body.search;
    const resultArray = [];

    const response = await axios.get(`${ytApiUrl}/search`, {
      params: {
        key: ytApiKey,
        part: 'snippet',
        q: `${searchQuery} review`,
        type: 'video',
        order: 'relevance',
        maxResults: 2,
        videoCaption: 'closedCaption'
      }
    });

    const videoIdArray = response.data.items.map(item => item.id.videoId);

    const captionsPromises = videoIdArray.map(videoId =>
      getSubtitles({
        videoID: videoId,
        lang: '*'
      })
    );

    const captionsResults = await Promise.all(captionsPromises);

    captionsResults.forEach(captions => {
      let concatenatedText = captions
        .map(caption => caption.text)
        .join(' ');

      concatenatedText = concatenatedText
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\n/g, ' ')
        .replace(/♪[^♪]*♪/g, '')
        .replace(/[^\w\s\d]/g, '');

      resultArray.push(concatenatedText.trim());
    });

    // Summarize using OpenAI API
    const summarizedResults = await openai.chat.completions.create({
        messages: [{ role: "system", content: `You are a helpful buying assistant that help me to summerize all thoses reviews from youtube : ${resultArray.join('\n')}. The summery MUST be in french with a first part describing the product. A second part comparing to the concurence if the videos speakes about. A third part with bullets pros and cons and a finall part as a bying advice` }],
        model: "gpt-3.5-turbo-1106",


    });
    res.status(200).send({ summarizedText: summarizedResults.choices[0].message.content});
  } catch (err) {
    console.error(`Error while fetching search data for : ${err}`);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = searchRouter;