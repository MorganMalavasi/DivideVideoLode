const fs = require('fs');
const path = require('path');

function readItems() {
    return new Promise ((resolve, reject) => {
        const directoryPath = __dirname + '/lezione1_ronchettipdf';
        //passsing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } else {
                let paths = [];
            
                    files.forEach(function (file, index) {
                        // Do whatever you want to do with the file
                        if (path.extname(file) === '.png' || 
                            path.extname(file) === '.PNG' ||
                            path.extname(file) === '.jpg' ||
                            path.extname(file) === '.JPG' ||
                            path.extname(file) === '.jpeg' ||
                            path.extname(file) === '.JPEG') {
                                paths.push(file);
                            } 
                        if (index === files.length-1)
                            resolve(paths);
                    });
                
            }
        });
    });
}

module.exports = {readItems}