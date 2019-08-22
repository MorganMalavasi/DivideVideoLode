const extractFrames = require('ffmpeg-extract-frames');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const utils = require('./utils.js');
const { getVideoDurationInSeconds } = require('get-video-duration');
const tree = require('./tree.js');

ffmpeg.setFfmpegPath(ffmpegPath);

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

async function extractFrameBinary (path) {
    let offset = [];            // contains seconds foreach frame
    let finalPaths = [];        // contains path foreach frame
    let texts = [];             // contains all the texts

    let informations = [];
    

    try {
        let secondVideo = await getVideoDurationInSeconds(path);    // duration video in milliseconds 
        var dir = './lesson/video_screens';

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }


        /*
            Explanation 
            I operate a binary search and i take the frame in the middle (withdraw its text).
            Once done it, i broke the video in other two segments like in a binary search 
            and i repeat the operation. If the element is the same took before then I 
            stop, else i continue dividing the video 
        */

        let i = 0; // conta frame 
        // let bst = new tree.Bst();
        await binarySearch(secondVideo, path, i, informations);
        
        
    } catch (err) {
        console.log('error in take frames Video');
        console.log(err);
    } finally {
        return informations;
    }
}

async function binarySearch (time, path, i, informations) {
    /*
        Poichè non sappiamo il numero di frame che andremo a ricavare non possiamo usare un array
        Una volta che avremo finito di ricavare i nostri elementi andremo allora 
        a leggerli all'interno di un albero attraverso una visita speciale 
    */
    let out = '/lesson/video_screens/frame-' + i + '.png';
    let timeDivided = time / 2;
    try {
        await extractFrames({
            input: path,
            output: './lesson/video_screens/frame-%i.png',
            offsets: [timeDivided * 1000]
        });

        fs.rename('./lesson/video_screens/frame-1.png', './lesson/video_screens/frame-' + i + '.png', function(err) {
            if (err) 
                console.log('ERROR renaming file: frame-' + i + '.png' + ':' + err);
        });

    } catch (err) {
        console.log('Error in taking video frame');
    } finally {
        let text = await utils.getSingleTexts(__dirname + out);
        informations.push({text_: text, outpath_: out, time_: timeDivided});
    }
}

module.exports = {extractFrame, extractFrameBinary}
