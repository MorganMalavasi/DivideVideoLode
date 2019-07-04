const pdf = require('pdf-parse');
const fs = require('fs'); 
const PDFImage = require("pdf-image").PDFImage;
const tesseract = require('tesseract.js');

    
async function getDataPdf(path){
    let databuffer = fs.readFileSync(__dirname + path);
    let number = await pdf(databuffer);
    return number;
}     

async function printPages(path, nPages){
    return new Promise((resolve, reject) => {
        let pdfImage = new PDFImage(__dirname + path, {graphicsMagick: true});

        for (let i=0; i<nPages; i++){
            pdfImage.convertPage(i).then(function (imagePath) {
                if (i === nPages-1)
                    resolve();
            });
        } 
    });
}

function createPath (n) {
    let paths = [];
    return new Promise((resolve,reject) => {
        for (let i=0; i<n; i++){
            paths.push(__dirname + '/lezione1_ronchettipdf/lezione1-'+ i +'.png');
            if (i===n-1)
                resolve(paths);
        }
    });
}

function getSingleTexts (path) {
    return new Promise((resolve, reject) => {
        const { TesseractWorker } = tesseract;
        
        const worker = new TesseractWorker();
        worker
        .recognize(path)
        .progress((p) => {
            console.log('progress', p);
        })
        .then(({ text }) => {
            worker.terminate();
            resolve(text);
        });
    });
}

async function getTexts (paths) {
    let allText = [];
    for (i in paths){
        let txt = await getSingleTexts(paths[i]);
        allText.push(txt);
    }
    return allText;
}

function print (elements){
    for (i in elements)
        console.log(i + ' ' + elements[i]);
}


module.exports = {getDataPdf, printPages, createPath, getTexts, getSingleTexts, print};