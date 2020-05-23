require('dotenv').config();
require('isomorphic-fetch'); // or another library of choice.
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.API_KEY });

const fs = require('fs');
const productArray = fs.readFileSync('query.txt').toString().split('\n');
console.log(productArray);

function picSearch(searchQuery) {
    dbx.filesSearch({ path: '', mode: 'filename_and_content', max_results: 1, query: searchQuery })
        .then(function (response) {
            console.log(response.matches);
        })
        .catch(function (error) {
            console.error(error);
        });
}

picSearch('purple');