const tesseract = require('tesseract.js');
const stringSimilarity = require('string-similarity');
const utils = require('./utils.js');

function printElement (elements){
    for (i in elements)
        console.log(elements[i]);
}

function getTextAndTimes (inf) {
    return new Promise((resolve, reject) => {
        let allTextVideo = [];
        let allTimes = [];
        for (let i=0; i<inf.length; i++){
            allTextVideo.push(inf[i].text_);
            allTimes.push(inf[i].time_);
            if (i==inf.length-1)
                resolve([allTextVideo, allTimes]);
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

function compareStringTotalArray (str, totStr){
    // return object of the element that best matches the string 
    // frame TO pdf 
    return stringSimilarity.findBestMatch(str, totStr);;
}

async function matchStrings (stringsFrame, stringsPdf, offset){
    
    let stringsPdfFirst;
    let times = [];
    try {
        stringsPdfFirst = await getFirstElements(stringsPdf);
    } catch (err) {
        console.log(err);
    } finally {
        let before = -1;
        
        console.log(stringsPdf);

        for (let i=0; i<stringsFrame.length; i++){
            
            let match = compareStringTotalArray(stringsFrame[i], stringsPdfFirst);
            if (match.bestMatchIndex!==before && match.bestMatch.rating>0.4){
                let valuesSlides = await returnSizeList(stringsPdf, match.bestMatchIndex); 
                times.push(i + 'time:' + offset[i] + ' - slides: ' + valuesSlides + ' - match:' + match.bestMatch.rating);         
                before = match.bestMatchIndex;
            }
            
            if (i === stringsFrame.length-1)
                return times;
        }
    }
}

function getFirstElements (elements){
    return new Promise((resolve, reject) =>{
        let newElements = [];
        for (let i=0; i<elements.length; i++){
            let elm = elements[i];
            
            newElements.push(elm[0]);

            if (i==elements.length-1)
                resolve(newElements);
        }
    });
}

function returnSizeList (elements, index){
    return new Promise((resolve, reject) => {

        let str = '';
        let start = index+1;

        for (let i=0; i<elements[index].length; i++){

            let r = start.toString() + ' - ';
            let res = str.concat(r);
            str = res;
            start++;

            if (i == ((elements[index].length)-1))
                resolve(str);
        }
    });
}

module.exports = {printElement, getSingleTexts, getTexts, matchStrings, getTextAndTimes}