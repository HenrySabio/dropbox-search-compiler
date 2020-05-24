require('dotenv').config();
require('isomorphic-fetch'); // or another library of choice.
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.API_KEY });
const date = new Date().toISOString().slice(0, 10);

const fs = require('fs');
const productArray = fs.readFileSync('query.txt').toString().split('\n');

let requestedBy, originalPath, fileName;

function dropboxSearch(searchQuery, requestedWho) {
    requestedBy = requestedWho;
    
    dbx.filesSearch({ path: '', mode: 'filename_and_content', max_results: 1, query: searchQuery })
        .then(function (res) {
            originalPath = res.matches[0].metadata.path_lower;
            fileName = res.matches[0].metadata.name;
            copyFile(originalPath, requestedBy, fileName);
        })
        .catch(function (error) {
            console.log('Unable to find: ' + fileName);
            console.error(error);
        });
}

function copyFile(originalPath, requestedBy, fileName) {
    dbx.filesCopy({ allow_shared_folder: true, autorename: true, from_path: originalPath, to_path: `/requested-files/${requestedBy}/${date}/${fileName}` })
        .then(function (res) {
            console.log('Successfully copied ' + fileName);
        })
        .catch(function (error) {
            console.log('copy fail');
        });
}

function shareFolder(requestedBy) {
    dbx.sharingShareFolder({ path: `/requested-files/${requestedBy}/${date}/` })
        .then(function (res) {
            console.log('share success for ' + requestedBy);
        })
        .catch(function (error) {
            console.log('share fail');
        });
}

function beginSearch() {
    for (let i = 0; i < productArray.length; i++) {
        (function(i) {
            setTimeout( function() { 
                dropboxSearch(productArray[i], 'henry'); 
            }, 2000 * i);
        })(i);
    };
}
    

beginSearch();