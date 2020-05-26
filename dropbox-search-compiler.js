/* ----- BEGIN: Application Dependency and Variable setup ----- */

require('dotenv').config();
require('isomorphic-fetch');
const cliProgress = require('cli-progress');
const inquirer = require("inquirer");
const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.TEST_API_KEY, fetch });


// Assigns current date to variable - formatted yyyy-mm-dd
const date = new Date().toISOString().slice(0, 10);

// Loads file system modile, converts text file data to an array
const fs = require('fs');
let productArray = fs.readFileSync('data/search.txt').toString().split('\n');

// Updates array with _A.jpg after each item to narrow down search
for (var i = 0; i < productArray.length; i++) {
    productArray[i] = productArray[i] + '_A.jpg';
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
                }
            ])
            .then(() => {
                inquirer
                    .prompt([
                        {
                            type: "confirm",
                            message: `Have you done the following:
    * Created a .txt file named 'search' inside of the data folder?
    * Updated the search.txt file with the products you'd like to search for? 
        - (Ensure each name is it's own line.)`,
                            name: "confirm",
                            default: true
                        }
                    ])
                    // If the inquirerResponse confirms as correct, beginSearch function is called.
                    .then(inquirerResponse => { inquirerResponse.confirm ? beginSearch() : console.log("\nThat's okay " + username + ", come again when you are more sure.\n") })
            })
    })

/* ----- END: CLI Prompt - Application Run ----- */

/* ******************************************************************************************************* */

/* ----- BEGIN: Dropbox API Operations - Handles operations during application run ----- */

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
            // Updates count for total files found
            found++;
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
function copyFile(originalPath, requestedBy, fileName) {
    dbx.filesCopy({ allow_shared_folder: true, autorename: true, from_path: originalPath, to_path: `/requested-files/${requestedBy}/${date}/${fileName}` })
        // Confirms file has been copied
        .then(function (res) {
            // Logs name of files that can be found to found.txt
            logResult('found_files', fileName);
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
    // Begins search for files
    console.log('\n-------------------------------------------------------');
    console.log('Beginning Search for your rquested files...');
    console.log('Results will be record in the results folder as the search progresses.');
    console.log('-------------------------------------------------------\n');

    // Creates a new progress bar instance
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let barValue = 1;

    // Set bar length to amount of items we are searching for, start point to 0
    bar1.start(productArray.length, 0, {
        speed: 'N/A'
    });


    // Loops through product array to search for each item and copy as they are found
    for (let i = 0; i < productArray.length; i++) {
        // setTimeout triggered as an Immdiately Invoked Function Expression (IIFE)
        // Must be done as IIFE because setTimeout is nonblocking and returns immidiately - no delay seen inside for loop if done normally
        (function (i) {
            setTimeout(function () {
                bar1.increment();
                if (i == (productArray.length - 1)) {
                    bar1.update(barValue++);
                    bar1.stop();
                    console.log('\nMission Complete! --> Please check the log files in the results folder for final confirmation.\n');
                    console.log(`Results:\n${found} files found\n${notFound} files not found`);
                } else if (i < productArray.length) {
                    bar1.update(barValue++);
                    dropboxSearch(productArray[i], username);
                }
            }, 1500 * i);
        })(i);
    };
}

/* ----- END: Dropbox API Operations - Handles operations during application run ----- */