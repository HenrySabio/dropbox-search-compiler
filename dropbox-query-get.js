require('dotenv').config();
require('isomorphic-fetch'); // or another library of choice.
// Load the NPM Package inquirer
const inquirer = require("inquirer");
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.API_KEY, fetch });
const date = new Date().toISOString().slice(0, 10);

const fs = require('fs');
const productArray = fs.readFileSync('query.txt').toString().split('\n');

let requestedBy, originalPath, fileName, username;


// Create a "Prompt" with a series of questions.
console.log('\n')
inquirer
    .prompt([
        // Here we create a basic text prompt.
        {
            type: "input",
            message: "What is your name?\n  Files will be saved in this folder:",
            name: "username"
        }
    ])
    .then(function (inquirerResponse) {
        username = inquirerResponse.username;
        inquirer
            .prompt([
                {
                    type: "confirm",
                    message: `Your name is ${username}, is this correct?`,
                    name: "confirm",
                    default: true
                },
                {
                    type: "confirm",
                    message: "\n\nHave you updated the 'query.txt' file with items you will be searching for?\nBe sure to have every individual item on its own line.",
                    name: "confirm",
                    default: true
                }
            ])
            .then(function (inquirerResponse) {
                // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
                if (inquirerResponse.confirm) {
                    console.log('\n-------------------------------------------------------')
                    console.warn('Beginning Search for your rquested files...')
                    console.log('-------------------------------------------------------\n')
                    beginSearch();
                }
                else {
                    console.log("\nThat's okay " + username + ", come again when you are more sure.\n");
                }
            });
        })
        
        function dropboxSearch(searchQuery, requestedWho) {
            requestedBy = requestedWho;
            
            dbx.filesSearch({ path: '', mode: 'filename_and_content', max_results: 1, query: searchQuery })
            .then(function (res) {
                originalPath = res.matches[0].metadata.path_lower;
                fileName = res.matches[0].metadata.name;
                copyFile(originalPath, requestedBy, fileName);
            })
            .catch(function (error) {
            console.log('\n------------------------Error------------------------')
            console.error('Unable to find: ' + searchQuery);
            console.log('------------------------Error------------------------\n')
        });
    }
    
    function copyFile(originalPath, requestedBy, fileName) {
        dbx.filesCopy({ allow_shared_folder: true, autorename: true, from_path: originalPath, to_path: `/requested-files/${requestedBy}/${date}/${fileName}` })
        .then(function (res) {
            console.log('Successfully copied: ' + fileName);
        })
        .catch(function (error) {
            console.log('------------------------Error------------------------')
            console.log('Failed to copy: ' + fileName);
            console.log('------------------------Error------------------------')
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
        (function (i) {
            setTimeout(function () {
                dropboxSearch(productArray[i], username);
            }, 1000 * i);
        })(i);
    };
}