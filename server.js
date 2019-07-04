const express = require('express');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const utilityPdf = require('./utilityPdf.js');
const app = express();
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.get('/', (req,res) => {
    (async() => {
        
        let data = await utilityPdf.getDataPdf('/lezione1_ronchettipdf/lezione1.pdf');
        
        // get array with ocr of all pages 
        await utilityPdf.printPages('/lezione1_ronchettipdf/lezione1.pdf', data.numpages);
        let paths = await utilityPdf.createPath(data.numpages);
        let allText = await utilityPdf.getTexts(paths);
        utilityPdf.print(allText);

        

    })();

    
    res.send().status(200);
});

var port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Listening on port ' + port);
});