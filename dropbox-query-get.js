require('dotenv').config();
require('isomorphic-fetch'); // or another library of choice.
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.API_KEY });

const fs = require('fs');
const productArray = fs.readFileSync('query.txt').toString().split('\n');
console.log(productArray);


function dropboxSearch(searchQuery) {
    dbx.filesSearch({ path: '', mode: 'filename_and_content', max_results: 1, query: searchQuery })
        .then(function (res) {
            let originalPath = res.matches[0].metadata.path_lower;
            let fileName = res.matches[0].metadata.name;
            copyFile(originalPath, fileName);
        })
        .catch(function (error) {
            console.error(error);
        });
}

function copyFile(originalPath, fileName) {
    dbx.filesCopy({ allow_shared_folder: true, autorename: true, from_path: originalPath, to_path: `/requested-files/${fileName}` })
                .then(function (res) {
                    console.log(res);
                })
                .catch(function (error) {
                    console.error(error);
                });
}

dropboxSearch('photo');