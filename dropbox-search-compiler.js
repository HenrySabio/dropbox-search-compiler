// Load dependencies
require('dotenv').config();
require('isomorphic-fetch');
const inquirer = require("inquirer");
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.TEST_API_KEY, fetch });

// Assigns current date to variable - formatted yyyy-mm-dd
const date = new Date().toISOString().slice(0, 10);

// Loads file system modile, converts text file data to an array
const fs = require('fs');
let productArray = fs.readFileSync('query.txt').toString().split('\n');

// Updates array with _A.jpg after each item to narrow down search
for (var i = 0; i < productArray.length; i++) {
    productArray[i] = productArray[i] + '_A.jpg';
}

let requestedBy, originalPath, fileName, username;

// Header for missing_files log
let missingLogHeader = `------------------------------------------------------------------------------------------\n
Date of Search: ${date}\nRequested pictures for the files below could not be found.\n
------------------------------------------------------------------------------------------\n\n`

// Creates log to record files that can't be found
fs.writeFile('missing_files.txt', missingLogHeader, function (err) {
    if (err) return console.log(err);
  });

// Create a "Prompt" with a series of questions.
console.log('\n')
inquirer
    .prompt([
        // Requests name of user - this name will be used for the dropbox folder created to save queried images.
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
                // If the inquirerResponse confirms as correct, beginSearch function is called.
                if (inquirerResponse.confirm) {
                    console.log('\n-------------------------------------------------------')
                    console.warn('Beginning Search for your rquested files...')
                    console.log('-------------------------------------------------------\n')
                    beginSearch();
                }
                // If not confirmed then program ends - try again when ready
                else {
                    console.log("\nThat's okay " + username + ", come again when you are more sure.\n");
                }
            });
    })

// Takes product array and name of person requesting to begin api calls for search
function dropboxSearch(searchQuery, requestedWho) {
    requestedBy = requestedWho;

    // Search begins at path defined, takes the first search result 
    dbx.filesSearch({ path: '', mode: 'filename_and_content', max_results: 4, query: searchQuery })
        // If result is found - copyFile function is called 
        .then(function (res) {
            originalPath = res.matches[0].metadata.path_lower;
            fileName = res.matches[0].metadata.name;
            copyFile(originalPath, requestedBy, fileName);
        })
        // If product is not found - conosle logs the item that is missing
        .catch(function (error) {
            console.error(`\nERROR --> Unable to find: ${searchQuery}\n`);

            // Logs name of files that count be found to missing_files.txt
            fs.appendFile('missing_files.txt', `${searchQuery}\n`, function(err) {
                if (err) return console.log(err);
            })
        });
}

// Takes query result data and creates a copy in folder named after user who requested files under the current data
function copyFile(originalPath, requestedBy, fileName) {
    dbx.filesCopy({ allow_shared_folder: true, autorename: true, from_path: originalPath, to_path: `/requested-files/${requestedBy}/${date}/${fileName}` })
        // Confirms file has been copied
        .then(function (res) {
            console.log('Successfully copied: ' + fileName);
        })
        // Console logs if file is unable to be copied
        .catch(function (error) {
            console.log('------------------------Error------------------------')
            console.log('Failed to copy: ' + fileName);
            console.log(error);
            console.log('------------------------Error------------------------')
        });
}

// Work in progress - DNU - Automatically creates share link to folder where data was saved.
function shareFolder(requestedBy) {
    dbx.sharingShareFolder({ path: `/requested-files/${requestedBy}/${date}/` })
        .then(function (res) {
            console.log('share success for ' + requestedBy);
        })
        .catch(function (error) {
            console.log('share fail');
        });
}

// Calls search function 
function beginSearch() {
    // Loops through product array to search for each item and copy as they are found
    for (let i = 0; i < productArray.length; i++) {
        // setTimeout triggered as an Immdiately Invoked Function Expression (IIFE)
        // Must be done as IIFE because setTimeout is nonblocking and returns immidiately - no delay seen inside for loop if done normally
        (function (i) {
            setTimeout(function () {
                dropboxSearch(productArray[i], username);
            }, 1500 * i);
        })(i);
    };
}