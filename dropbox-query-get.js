require('dotenv').config();
require('isomorphic-fetch'); // or another library of choice.
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.API_KEY });
const date = new Date().toISOString().slice(0, 10);

const fs = require('fs');
const productArray = fs.readFileSync('query.txt').toString().split('\n');
console.log(productArray);

let requestedBy = ''


function dropboxSearch(searchQuery, requestedWho) {
    requestedBy = requestedWho;
    dbx.filesSearch({ path: '', mode: 'filename_and_content', max_results: 1, query: searchQuery })
        .then(function (res) {
            let originalPath = res.matches[0].metadata.path_lower;
            let fileName = res.matches[0].metadata.name;
            copyFile(originalPath, requestedBy, fileName);
        })
        // .then(function () {
        //     shareFolder(requestedBy);
        // })
        .catch(function (error) {
            console.error(error);
        });
}

function copyFile(originalPath, requestedBy, fileName) {
    dbx.filesCopy({ allow_shared_folder: true, autorename: true, from_path: originalPath, to_path: `/requested-files/${requestedBy}/${date}/${fileName}` })
        .then(function (res) {
            console.log('Found: ' + fileName)
            console.log('copy success');
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

dropboxSearch('photo', 'tony');