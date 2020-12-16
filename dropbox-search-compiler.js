/* ----- BEGIN: Application Dependency and Variable setup ----- */

require('dotenv').config();
require('isomorphic-fetch');
const cliProgress = require('cli-progress');
const inquirer = require("inquirer");
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.API_KEY, fetch });

// Assigns current date to variable - formatted yyyy-mm-dd
const d = new Date();
const date = d.toLocaleDateString().split('/').reverse().join('-');

// Loads file system modile, converts text file data to an array
const fs = require('fs');
let copyBatch = [];
let productArray = fs.readFileSync('data/search.txt').toString().split('\n');

// Initializes Base Arrays to build on
let topViewsArr = [...productArray], angleViewArr = [...productArray], closeViewArr = [...productArray], extraViewArr = [...productArray],
    allAnglesArr = [], roomSceneArr = [];

// Will build arrays off existing base arrays for individual angle searchs
function buildProductSearchArr(arrName, prefix) {
    for (let i = 0; i < arrName.length; i++) {
        arrName[i] = arrName[i] + prefix;
    }
}

// Builds all product angle arrays at once
for (let i = 0; i <= 3; i++) {
    let tempArr1 = [topViewsArr, angleViewArr, closeViewArr, extraViewArr]
    let tempArr2 = ['_A.jpg', '_B.jpg', '_C.jpg', '_D.jpg']
    buildProductSearchArr(tempArr1[i], tempArr2[i])

    // Creates a single array for all product angles
    allAnglesArr = topViewsArr.concat(angleViewArr, closeViewArr, extraViewArr);
}

// Builds room scene array
for (let i = 1; i < 8; i++) {
    let tempArr = [...productArray]
    tempArr.forEach((element, x) => { tempArr[x] += `_0${i}.jpg` });
    roomSceneArr = roomSceneArr.concat(tempArr);
}

let requestedBy, originalPath, fileName, username,
    found = 0,
    notFound = 0;

/* ----- End: Application Dependency and Variable setup ----- */

/* ******************************************************************************************************* */

/* ----- BEGIN: Result Data Logging Operations ----- */

// Header for missing_files log
let missingLogHeader = `--------------------------------------------------------------------------\n
Date of Search: ${date}\nRequested pictures for the files below could not be found.\n
--------------------------------------------------------------------------\n\n`

// Header for found_files log
let foundLogHeader = `--------------------------------------------------------------------------\n
Date of Search: ${date}\nRequested pictures for the files below were succesfuly found and copied to a new folder.\n
--------------------------------------------------------------------------\n\n`

// Creates log to record files that can or can't be found
function createLog(fileName, textHeader) {
    fs.writeFile(`results/${fileName}.txt`, textHeader, function (err) {
        if (err) return console.log(err);
    });
}

createLog('missing_files', missingLogHeader);
createLog('found_files', foundLogHeader);

// Logs result to correspoinding log file
function logResult(logName, searchQuery) {
    fs.appendFile(`results/${logName}.txt`, `${searchQuery}\n`, function (err) {
        if (err) return console.log(err);
    })
}

/* ----- END: Result Data Logging Operations ----- */

/* ******************************************************************************************************* */

/* ----- BEGIN: CLI Prompt - Application Run ----- */

// Create a "Prompt" with a series of questions.
console.log('============================================================\n')
console.log('     Welcome to the Dropbox Asset Search & File Compiler\n')
console.log('============================================================\n')

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
                }
            ])

            // If the inquirerResponse confirms as correct, beginSearch function is called.
            .then(inquirerResponse => {
                if (inquirerResponse.confirm) {
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                message: `What images are you searching for?`,
                                name: "choice",
                                choices: [
                                    'A angles only',
                                    'B angles only',
                                    'C angles only',
                                    'All of the above',
                                    'Room Scenes',
                                ],
                            }
                        ])
                        // If the inquirerResponse confirms as correct, beginSearch function is called.
                        .then(list => {
                            if (list.choice == 'A angles only') {
                                beginSearch(topViewsArr)
                            } else if (list.choice == 'B angles only') {
                                beginSearch(angleViewArr)
                            } else if (list.choice == 'C angles only') {
                                beginSearch(closeViewArr)
                            } else if (list.choice == 'All of the above') {
                                beginSearch(allAnglesArr)
                            } else if (list.choice == 'Room Scenes') {
                                beginSearch(roomSceneArr)
                            } else {
                                console.log("\nThat's okay " + username + ", come again when you are more sure.\n")
                            }
                        });
                } else {
                    console.log("\nOops! Please restart the application to try again.\n");
                }
            })
    })

/* ----- END: CLI Prompt - Application Run ----- */

/* ******************************************************************************************************* */

/* ----- BEGIN: Dropbox API Operations - Handles operations during application run ----- */

// Takes product array and name of person requesting to begin api calls for search
async function dropboxSearch(searchQuery, requestedWho) {
    requestedBy = requestedWho;

    // Search begins at path defined, takes the first search result 
    await dbx.filesSearch({ path: '/Brochures/image library', mode: 'filename', max_results: 4, query: searchQuery })
        // If result is found - copyFile function is called 
        .then(async function (res) {
            originalPath = res.matches[0].metadata.path_lower;
            fileName = res.matches[0].metadata.name;

            // Takes first result and appends source & destinaiton paths to array.
            await copyBatch.push({ from_path: originalPath, to_path: `/requested-files/${requestedBy}/${date}/${fileName}` })
            found = copyBatch.length;
        })
        // If product is not found - conosle logs the item that is missing
        .catch(function (error) {
            // Updates count for total files not found
            notFound++;
            // Logs name of files that can't be found to missing_files.txt
            logResult('missing_files', searchQuery);
        });
}

// Takes query result data and creates a copy in folder named after user who requested files under the current data
function copyFile() {
    dbx.filesCopyBatchV2({ entries: copyBatch, autorename: true })
        .catch(function (err) {
            if (entries == []) {
                console.log('Sorry, no files found.');
            } else {
                console.log(err);
            }
        })
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
function beginSearch(searchArray) {

    // Displays premature results if application is ended early via 'ctrl + c' or 'ctrl + z'
    process.on('SIGINT', function () {
        console.log("\n\n\nUh-oh! You have ended the process before completion.");
        bar1.stop();

        console.log('---------------------------------------------------------------------------------------------------------');
        console.log('\nPlease check the log files in the results folder for confirmation of what was able to be completed.\n');
        console.log(`Final Results:\n${found} files found\n${notFound} files not found`);
        process.exit();
    });

    process.on('SIGTSTP', function () {
        console.log("\n\n\nUh-oh! You have ended the process before completion.");
        bar1.stop();

        console.log('---------------------------------------------------------------------------------------------------------');
        console.log('\nPlease check the log files in the results folder for confirmation of what was able to be completed.\n');
        console.log(`Final Results:\n${found} files found\n${notFound} files not found`);
        process.exit();
    });

    // Begins search for files
    console.log('\n-------------------------------------------------------');
    console.log('Beginning Search for your rquested files...');
    console.log('Results will be recorded in the results folder as the search progresses.');
    console.log('-------------------------------------------------------\n');

    // Creates a new progress bar instance
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let barValue = 0;

    // Set bar length to amount of items we are searching for, start point to 0
    bar1.start(searchArray.length, 0, {
        speed: 'N/A'
    });

    // Loops through product array to search for each item and copy as they are found
    for (let i = 0; i <= searchArray.length; i++) {
        // setTimeout triggered as an Immdiately Invoked Function Expression (IIFE)
        // Must be done as IIFE because setTimeout is nonblocking and returns immidiately - no delay seen inside for loop if done normally
        bar1.increment();
        (async function (i) {
            setTimeout(await function () {
                if (i < searchArray.length) {
                    dropboxSearch(searchArray[i], username);
                    bar1.update(barValue++);
                } else {
                    bar1.stop();
                    console.log('\n-------------------------------------------------------\n');
                    console.log('Mission Complete! --> Please check the log files in the results folder for final confirmation.\n');
                    console.log(`Final Results:\n${found} files found\n${notFound} files not found`);
                    copyFile();
                }
            }, 500 * i);
        })(i);
    };
}

/* ----- END: Dropbox API Operations - Handles operations during application run ----- */