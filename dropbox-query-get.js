require('dotenv').config();
require('isomorphic-fetch'); // or another library of choice.
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.API_KEY });

dbx.usersGetCurrentAccount()
    .then(function (response) {
        console.log(response);
    })
    .catch(function (error) {
        console.error(error);
    });

dbx.filesListFolder({ path: '' })
    .then(function (response) {
        console.log(response.entries);
    })
    .catch(function (error) {
        console.error(error);
    });

const fs = require('fs');
const productArray = fs.readFileSync('query.txt').toString().split('\n');
console.log(productArray);