const express = require('express');
const mongoose = require('mongoose');
const botController = require('./src/bot/bot.controller');
const cronService = require('./src/cron/cron.service');
const botService = require('./src/bot/bot.service');
require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGO_URL)
    .then(()=> {console.log('Connected to: ', process.env.MONGO_URL);})
    .catch((e)=> {console.log(e);});

    
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    
    app.listen(process.env.PORT, () => {
      console.log('Started on port: ', process.env.PORT);
    });

