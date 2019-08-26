const extractFrames = require('ffmpeg-extract-frames');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const utils = require('./utils.js');
const { getVideoDurationInSeconds } = require('get-video-duration');
const stringSimilarity = require('string-similarity');

ffmpeg.setFfmpegPath(ffmpegPath);
var elem = 0;
const SIMILARITY_GRADE_LONG = 0.6;
const SIMILARITY_GRADE_SHORT = 0.3;
const TIME_EXCEEDED = 10;
const SIMILARITY_GRADE_BACK = 0.6;

/*
    ALGORITMO BASE 
    Il video viene diviso in un numero di parti settabile (in questo caso 100)
    viene preso un frame per ognuna delle 100 parti del video 

    vantaggi : si conoscono il numero di frame che si andranno ad analizzare 
    svantaggio : impreciso, se il video è piccolo non ha senso prelevare tutti i 100 frame 
    e viceversa se il video è molto lungo 100 frames sono troppo pochi 
*/
async function extractFrame (path) {
    let offset = [];
    let finalInf = [];
    try {
        let secondVideo = await getVideoDurationInSeconds(path);
        // I create the interval to get 100 frames
        secondVideoInterval = secondVideo/100;
    
        for (let i=0; i<secondVideo; i+=secondVideoInterval){
            if (i!==0 && i<secondVideo){
                offset.push(i*1000);
            }
        }
        var dir = './lesson/video_screens';

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
    } catch (err) {
        console.log('error in take frames Video');
        console.log(err);
    } finally {
        console.log('creating frames for the video...');
        
        for (let i=0; i<offset.length-1; i++){
            await extractFrames({
                input: path,
                output: './lesson/video_screens/frame-%i.png',
                offsets: [offset[i]]
            });
    
            fs.rename('./lesson/video_screens/frame-1.png', './lesson/video_screens/frame-x' + i + '.png', function(err) {
                if (err) 
                    console.log('ERROR renaiming: ' + err);
            });
            let text = await utils.getSingleTexts(__dirname + '/lesson/video_screens/frame-x' + i + '.png');
            finalInf.push({text_: text, outpath_: __dirname + '/lesson/video_screens/frame-x' + i + '.png', time: offset[i]});
        }

        // return paths and also times 
        // [0] -> paths 
        // [1] -> times in seconds
        return finalInf;
    }
}





/*
    ALGORITMO BINARY SEARCH 
    Viene prelevato il frame centrale del video e si ripete l'algoritmo ricorsivamente 
    sulla parte di sinistra del video e su quella a desta.

    La funzione ritorna quando il testo prelevato da un frame è uguale a quello dei suoi "bordi"
    Una spiegazione dettagliata può essere trovata sul relativo file di spiegazione 
*/


async function extractFrameBinary (path) {
    let informationsVideo = null;
    try {
        let secondsVideo = await getVideoDurationInSeconds(path);    // duration video in milliseconds 
        var dir = './lesson/video_screens';

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        informationsVideo = await binarySearchCaller(secondsVideo, path);
        
        
    } catch (err) {
        console.log('error in getting duration of the video or binary search');
        console.log(err);
    } finally {
        return informationsVideo;
    }
}


// caller for the recursion function 
async function binarySearchCaller (secondsVideo, path){
    
    let startTime = 0;
    let endTime = secondsVideo;
    let timeInt = Math.round(secondsVideo);
    let startText = null;
    let endText = null;
    let out = null;
    let informations = new Array(timeInt+1);

    await inizializeArray(informations, timeInt+1);
    
    try {
        out = '/lesson/video_screens/frame-x' + elem + '.png';
        await extractFrames({
            input: path,
            output: './lesson/video_screens/frame-%i.png',
            offsets: [1000]
        });

        fs.rename('./lesson/video_screens/frame-1.png', './lesson/video_screens/frame-x' + elem + '.png', function(err) {
            if (err) 
                console.log('ERROR renaming file: frame-' + elem + '.png' + ':' + err);
            elem++;
        });
        startText = await utils.getSingleTexts(__dirname + out);
        informations[0] = ({text_: startText, outpath_: __dirname + out, time_: startTime});

        out = '/lesson/video_screens/frame-x' + elem + '.png';
        await extractFrames({
            input: path,
            output: './lesson/video_screens/frame-%i.png',
            offsets: [(endTime-1)*1000]
        });

        fs.rename('./lesson/video_screens/frame-1.png', './lesson/video_screens/frame-x' + elem + '.png', function(err) {
            if (err) 
                console.log('ERROR renaming file: frame-' + elem + '.png' + ':' + err);
            elem++;
        });
        endText = await utils.getSingleTexts(__dirname + out);
        informations[timeInt] = ({text_: endText, outpath_:__dirname + out, time_: endTime});
        
    } catch (err) {
        console.log('ERROR during the first two frames');
    } finally {
        await binarySearch(startTime, endTime, path, informations, startText, endText);
        return clearArray(informations, timeInt+1);
    }

}



// recursion part 
async function binarySearch (startTime, endTime, path, informations, startText, endText) {
    /*
        Poichè non sappiamo il numero di frame che andremo a ricavare non possiamo usare un array
        Una volta che avremo finito di ricavare i nostri elementi andremo allora 
        a leggerli all'interno di un albero attraverso una visita speciale 
    */
    let out = '/lesson/video_screens/frame-x' + elem + '.png';
    let time = (endTime + startTime) / 2;
    let similarityLeft = null;
    let similarityRight = null;
    let text = null;
    let SIMILARITY_GRADE = null;
    try {
        await extractFrames({
            input: path,
            output: './lesson/video_screens/frame-%i.png',
            offsets: [time * 1000]
        });

        fs.rename('./lesson/video_screens/frame-1.png', './lesson/video_screens/frame-x' + elem + '.png', function(err) {
            if (err) 
                console.log('ERROR renaming file: frame-' + elem + '.png' + ':' + err);
            elem++;
        });
        text = await utils.getSingleTexts(__dirname + out);

        informations[Math.round(time)] = {text_: text, outpath_:__dirname + out, time_: time};
        similarityLeft = stringSimilarity.compareTwoStrings(text, startText);        
        similarityRight = stringSimilarity.compareTwoStrings(text, endText);

        if ((endTime-startTime) > 60)
            SIMILARITY_GRADE = SIMILARITY_GRADE_LONG;
        else 
            SIMILARITY_GRADE = SIMILARITY_GRADE_SHORT;
        
        console.log(similarityLeft + '   ' + similarityRight + '    time -> ' + time + ' difference -> ' + (endTime-startTime));
        console.log('testo = ' + text);
        console.log('testosinistra = ' + startText);
        console.log('testodestra = ' + endText);

    } catch (err) {
        console.log('Error in taking video frame');
    } finally {
        if ((similarityLeft > SIMILARITY_GRADE && similarityRight >  SIMILARITY_GRADE) || ((endTime - startTime)<TIME_EXCEEDED)){
            return;
        } else if (similarityLeft > SIMILARITY_GRADE && similarityRight < SIMILARITY_GRADE) {
            await binarySearch(time, endTime, path, informations, text, endText);
            return;
        } else if (similarityLeft < SIMILARITY_GRADE && similarityRight > SIMILARITY_GRADE) {
            await binarySearch(startTime, time, path, informations, startText, text);
            return;
        } else {
            await binarySearch(startTime, time, path, informations, startText, text);
            await binarySearch(time, endTime, path, informations, text, endText);
            return;
        }
    }
}

function inizializeArray (arr, size) {
    return new Promise ((resolve, reject) => {
        for (let i=0; i<size; i++){
            arr[i] = null;
            if (i == size-1)
                resolve();
        }
    });
}

function clearArray (arr,size) {
    return new Promise ((resolve, reject) => {
        let finalObj = [];
        for (let i=0; i<size; i++){
            if (arr[i] != null)
                finalObj.push(arr[i]);
            if (i == size-1)
                resolve(finalObj);
        }
    });
}




/*
    Algoritmo 3 -> FIND, CHANGE, GO BACK 

    L'algoritmo comincia dal primo frame e ricava il testo, fatto ciò si sposta al prossimo frame 
    10 secondi dopo, se questo è il medesimo allora si sposta a quello dopo ancora 20 secondi distante (poi 40 
    poi 80 e via cosi). L'algoritmo è esponenziale. Nel momento che si trova un frame con un testo diverso allora si torna indietro 
    al frame precedente e si ricomincia da capo. Questo ci permette di avere una precisione molto alta nel capire a quale frame ci troviamo 
    Inoltre i casi di errore attraverso questa tecnica sono molto rari. 
*/

async function scrollBackEsponential (path) {

    let secondVideo = await getVideoDurationInSeconds(path);
    let i = 0;
    let spaceTime = 10;
    let lastText = null;
    let times = [];
    
    try {
        let out = '/lesson/video_screens/frame-x' + i + '.png';
        await extractFrames({
            input: path,
            output: './lesson/video_screens/frame-%i.png',
            offsets: [1000]
        });
        fs.rename('./lesson/video_screens/frame-1.png', './lesson/video_screens/frame-x' + i + '.png', function(err) {
            if (err) 
                console.log('ERROR renaming file: frame-' + i + '.png' + ':' + err);
            i++;
        });
        lastText = await utils.getSingleTexts(__dirname + out);
    } catch (err){
        console.log('Error!');
    } finally {
        let lastWhereIam = 0;
        let whereIam = spaceTime;
        let esponent = 0;
        let text = null;
        let back = false;
        let counter = 0;

        while (whereIam < Math.round(secondVideo)){
            await extractFrames({
                input: path,
                output: './lesson/video_screens/frame-%i.png',
                offsets: [whereIam * 1000]
            });
            console.log(counter++);
            text = await utils.getSingleTexts('./lesson/video_screens/frame-1.png');
            console.log('ultimo testo -> ' + lastText);
            console.log('testo nuovo -> ' + text);
            console.log('tempo -> ' + whereIam);
            
            if (stringSimilarity.compareTwoStrings(text, lastText)>SIMILARITY_GRADE_BACK){
                fs.unlink('./lesson/video_screens/frame-1.png', (err) => {
                    if (err)
                        console.log('Error deleting element ' + 'frame-1.png');
                });
                lastText = text;
                lastWhereIam = whereIam;
                whereIam += spaceTime * Math.pow(2,esponent); 
                esponent++;
                back = false;
            } else if (back && stringSimilarity.compareTwoStrings(text, lastText)<=SIMILARITY_GRADE_BACK ){
                fs.rename('./lesson/video_screens/frame-1.png', './lesson/video_screens/frame-x' + i + '.png', function(err) {
                    if (err) 
                        console.log('ERROR renaming file: frame-' + i + '.png' + ':' + err);
                    times.push({text_: text, outpath_: __dirname + '/lesson/video_screens/frame-x' + i + '.png', time_: lastWhereIam});
                }); 
                lastWhereIam = whereIam;
                whereIam += spaceTime;
                lastText = text;
                esponent = 0;
                back = false;
                i++;
            } else {
                fs.unlink('./lesson/video_screens/frame-1.png', (err) => {
                    if (err) {
                        console.log('Error deleting element ' + 'frame-1.png');
                    } else {
                        console.log('Element deleted correctly');
                    }
                });
                whereIam = lastWhereIam + spaceTime;
                esponent = 0;
                back = true;
            }
        }
    }
    return times;
}


module.exports = {extractFrame, extractFrameBinary, scrollBackEsponential}
