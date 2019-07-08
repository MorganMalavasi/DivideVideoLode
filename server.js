const express = require('express');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const utilityPdf = require('./utilityPdf.js');
const utilityVideo = require('./utilityVideo.js');
const utils = require('./utils.js');
const clean = require('./compare.js');
const app = express();
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.get('/', (req,res) => {
    (async() => {
        
        // delete items in the directories from last recognize
        await clean.deleteItems();

        // video part 
        let elementsVideo = await utilityVideo.extractFrame(__dirname + '/lesson/lezione1.mp4');
        console.log('Start taking video s text');
        let allTextVideo = await utils.getTexts(elementsVideo[0]);
        
        // pdf part 
        let data = await utilityPdf.getDataPdf('/lesson/lezione1.pdf');  
        // get array with ocr of all pages 
        await utilityPdf.printPages('/lesson/lezione1.pdf', data.numpages);
        let paths = await utilityPdf.createPath(data.numpages);
        console.log('Start taking photo s text');
        let allTextPdf = await utils.getTexts(paths);
        // Creating an algorithm to match the differents slide 
        // and frames 

        let times = await utils.matchStrings(allTextVideo, allTextPdf, elementsVideo[1]);
        utils.printElement(times);

    })();

    res.send().status(200);
});

var port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Listening on port ' + port);
});