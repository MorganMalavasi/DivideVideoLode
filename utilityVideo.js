const extractFrames = require('ffmpeg-extract-frames');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { getVideoDurationInSeconds } = require('get-video-duration');
const utils = require('./utils.js');

ffmpeg.setFfmpegPath(ffmpegPath);

async function extractFrame (path) {
    let offset = [];
    let finalList = []
    try {
        let secondVideo = await getVideoDurationInSeconds(path);
        // I create the interval to get 100 frames
        secondVideoInterval = secondVideo/100;
    
        for (let i=0; i<secondVideo; i+=secondVideoInterval){
            if (i!==0 && i<secondVideo){
                offset.push(i*1000);
            }
        }
        var dir = './lezione1_ronchettipdf/video_screens';

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
    } catch (err) {
        console.log('error in take frames Video');
        console.log(err);
    } finally {
        utils.print(offset);
        console.log('printing elements');
        
        for (let i=0; i<offset.length-1; i++){
            await extractFrames({
                input: path,
                output: './lezione1_ronchettipdf/video_screens/frame-%i.png',
                offsets: [offset[i]]
            });
    
            fs.rename('./lezione1_ronchettipdf/video_screens/frame-1.png', './lezione1_ronchettipdf/video_screens/frame' + i + '.png', function(err) {
                if (err) 
                    console.log('ERROR: ' + err);
                else
                    finalList.push('./lezione1_ronchettipdf/video_screens/frame' + (i) + '.png');
            });
        }

        return finalList;
    }
}


module.exports = {extractFrame}
