const pdf = require('pdf-parse');
const fs = require('fs'); 
const PDFImage = require("pdf-image").PDFImage;
const stringSimilarity = require('string-similarity');
const utils = require('./utils.js');

    
// get number of pages in pdf 
async function getDataPdf(path){
    let databuffer = fs.readFileSync(__dirname + path);
    let number = await pdf(databuffer);
    return number;
}     

// create elements in the directory
async function printPages(path, nPages){
    return new Promise((resolve, reject) => {
        let pdfImage = new PDFImage(__dirname + path, {graphicsMagick: true});
        console.log('Creating images for the pdf');
        for (let i=0; i<nPages; i++){
            pdfImage.convertPage(i).then(function (imagePath) {
                if (i === nPages-1)
                    resolve();
            });
        } 
    });
}

// get all the path of the images 
function createPath (n) {
    let paths = [];
    return new Promise((resolve,reject) => {
        for (let i=0; i<n; i++){
            paths.push(__dirname + '/lesson/lezione1-'+ i +'.png');
            if (i===n-1)
                resolve(paths);
        }
    });
}

function deleteRepetition (allTextPdf) {
    return new Promise((resolve, reject) => {
        let elements = [];
        for (let i=0; i<allTextPdf.length; i++){
            if (!(i==allTextPdf.length-1)){
                let similarity = stringSimilarity.compareTwoStrings(allTextPdf[i], allTextPdf[i+1]);
                console.log(similarity);
                if (similarity < 0.8)
                    elements.push(allTextPdf[i]);
                else 
                    elements.push('slide eliminated');
            } else {
                elements.push(allTextPdf[i]);
                resolve(elements);
            }
        }
    });
}


module.exports = {getDataPdf, printPages, createPath, deleteRepetition};