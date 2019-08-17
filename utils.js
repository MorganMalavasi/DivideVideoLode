const tesseract = require('tesseract.js');
const stringSimilarity = require('string-similarity');

function printElement (elements){
    for (i in elements)
        console.log(elements[i]);
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

function compareStringTotalArray (str, totStr){
    // return object of the element that best matches the string 
    // frame TO pdf 
    return stringSimilarity.findBestMatch(str, totStr);;
}

function matchStrings (stringsFrame, stringsPdf, offset){
    return new Promise((resolve, reject) => {
        let times = [];
        let before = -1;
        for (let i=0; i<stringsFrame.length; i++){
            let match = compareStringTotalArray(stringsFrame[i], stringsPdf);
            if (match.bestMatchIndex!==before && match.bestMatch.rating>0.4){
                times.push(i + 'time:' + offset[i] + ' - slide:' + (match.bestMatchIndex + 1) + ' - match:' + match.bestMatch.rating);         
                before = match.bestMatchIndex;
            }
            
            if (i === stringsFrame.length-1)
                resolve(times);
        }
    })
}

module.exports = {printElement, getSingleTexts, getTexts, matchStrings}