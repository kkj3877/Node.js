var testFolder = 'data';
var fs = require('fs');

fs.readdir(testFolder, function(err, fileList) {
    console.log(fileList);
});

// fs.readdir(testFolder, (err, fileList) => {
//     fileList.forEach(file => {
//         console.log(file);
//     });
// });