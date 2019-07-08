const fs = require('fs');
const path = require('path');

async function deleteItems() {
    await deletePdfImages();
    await deleteVideoImages();
}

function deletePdfImages () {
    return new Promise ((resolve, reject) => {
        const directoryPath = __dirname + '/lesson';
        //passsing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } else {
                files.forEach(function (file, index) {
                    // Do whatever you want to do with the file
                    if (path.extname(file) === '.png' || 
                        path.extname(file) === '.PNG' ||
                        path.extname(file) === '.jpg' ||
                        path.extname(file) === '.JPG' ||
                        path.extname(file) === '.jpeg' ||
                        path.extname(file) === '.JPEG') {
                            fs.unlinkSync(directoryPath + path.sep + file);
                        } 
                    if (index === files.length-1)
                        resolve();
                });
                if (files.length === 0)
                    resolve(); 
            }
        });
    });
}

function deleteVideoImages () {
    return new Promise ((resolve, reject) => {
        const directoryPath = __dirname + '/lesson/video_screens';
        //passsing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } else {
                files.forEach(function (file, index) {
                    // Do whatever you want to do with the file
                    if (path.extname(file) === '.png' || 
                        path.extname(file) === '.PNG' ||
                        path.extname(file) === '.jpg' ||
                        path.extname(file) === '.JPG' ||
                        path.extname(file) === '.jpeg' ||
                        path.extname(file) === '.JPEG') {
                            fs.unlinkSync(directoryPath + path.sep + file);
                        } 
                    if (index === files.length-1)
                        resolve();
                });
                if (files.length === 0)
                    resolve(); 
            }
        });
    });
}



module.exports = {deleteItems}