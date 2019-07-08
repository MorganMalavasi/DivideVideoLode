const extractFrames = require('ffmpeg-extract-frames');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { getVideoDurationInSeconds } = require('get-video-duration');

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

module.exports = {extractFrame}
