const utilityPdf = require('./utilityPdf.js');
const utilityVideo = require('./utilityVideo.js');

function print (elements){
    for (i in elements)
        console.log(elements[i]);
}

module.exports = {print}