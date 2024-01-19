import express from 'express'
import axios from 'axios'
import OpenAI from "openai"
import MistralClient from '@mistralai/mistralai'
import bodyParser from "body-parser"
import cors from "cors";
import { getSubtitles } from "youtube-captions-scraper"

const openAi = new OpenAI();
const ytApiKey = process.env.YT_API_KEY;
const ytApiUrl = "https://www.googleapis.com/youtube/v3";

const mistralApiKey = process.env.MISTRAL_API_KEY;
const mistralAi = new MistralClient(mistralApiKey);

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
    const {search, language} = req.body

    const resultArray = [];

    const response = await axios.get(`${ytApiUrl}/search`, {
      params: {
        key: ytApiKey,
        part: 'snippet',
        q: `${search} review`,
        type: 'video',
        order: 'relevance',
        maxResults: 5,
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

    // Summarize using AI API
    /**
     * OpenAI Version
     * 
    const summarizedResults = await openAi.chat.completions.create({
         messages: [{ role: "user", content: `As a buying assistant help me to summerize product reviews from Youtube : ${resultArray.join('\n')}.Summery MUST be in french with 4 parts : product presentation, concurrence, pros / cons and bying advice` }],
        model: "gpt-3.5-turbo-1106",
     });
    */

     /**
     * MistralAI Version
     * 
     * */
     const summarizedResults = await mistralAi.chat({
      model : 'mistral-tiny',
      messages: [
        { role: "system", 
        content: `As a buying assistant help me to summerize product reviews from Youtube. Summery MUST be in ${language} with 4 parts : product presentation, concurrence, pros / cons and bying advice` 
        },
        {
          role: "user",
          content : `Here are the product reviews : ${resultArray.join('\n')}.`
        }
    ],
     });

    res.status(200).send({ summarizedText: summarizedResults.choices[0].message.content});
  } catch (err) {
    console.error(`Error while fetching search data for : ${err}`);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

export default searchRouter;