const extractFrames = require('ffmpeg-extract-frames');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const utils = require('./utils.js');
const { getVideoDurationInSeconds } = require('get-video-duration');
const stringSimilarity = require('string-similarity');
const tree = require('./tree.js');

ffmpeg.setFfmpegPath(ffmpegPath);
var elem = 0;

async function extractFrame (path) {
    let offset = [];
    let finalPaths = [];
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
    
            fs.rename('./lesson/video_screens/frame-1.png', './lesson/video_screens/frame' + i + '.png', function(err) {
                if (err) 
                    console.log('ERROR: ' + err);
                else
                    finalPaths.push(__dirname + '/lesson/video_screens/frame' + (i) + '.png');
            });
        }

        // return paths and also times 
        // [0] -> paths 
        // [1] -> times in seconds
        return [finalPaths,offset];
    }
}







/*
    EXPLANATION OF THE ALGORITHM 


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
    let startText = null;
    let endText = null;
    let out = null;
    let informations = [];
    
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
        informations.push({text_: startText, outpath_: __dirname + out, time_: startTime});

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
        informations.push({text_: endText, outpath_:__dirname + out, time_: endTime});
        
    } catch (err) {
        console.log('ERROR during the first two frames');
    } finally {
        // await binarySearch(start, end, path, informations);
        return informations;
    }

}



// recursion part 
async function binarySearch (startTime, endTime, path, informations) {
    /*
        Poichè non sappiamo il numero di frame che andremo a ricavare non possiamo usare un array
        Una volta che avremo finito di ricavare i nostri elementi andremo allora 
        a leggerli all'interno di un albero attraverso una visita speciale 
    */
    let out = '/lesson/video_screens/frame-x' + elem + '.png';
    let time = (endTime + startTime) / 2;
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

    } catch (err) {
        console.log('Error in taking video frame');
    } finally {
        let text = await utils.getSingleTexts(__dirname + out);
        informations.push({text_: text, outpath_: out, time_: time});

        let similarity = stringSimilarity.compareTwoStrings(lastText, text);
        
    }
}

module.exports = {extractFrame, extractFrameBinary}
