# Dropbox Search & Compiler

Simple automated dropbox file search via CLI using the Dropbox API.

![GIF of app running](img/app-gif.gif)

## Features

* Takes a .txt file you provide, containing names of files you need, then automatically searches for the files on your linked dropbox.
* Files that are found are copied to a new folder (requested-files) in your dropbox root directory using the following heirarchy: 
  * name > todays-date > files found
* Any files found or not found are also logged into their own respectice .txt files in the 'results' folder located in the applications root directory

## Planned features

* Choose file format being searched for
  * Currently only searches for .jpgs named using the following naming convention: 'FILENAME_A.jpg'

## Installation

Installation is simple.
* Fork & Clone the repository to your computer
* `cd` into application directory
* Run `npm i` to download required node packages
* Created a `.env` file withing root directory and assign your dropbox API key
* Create a `search.txt` file inside the `data` folder and create list of files you'd like to search for.
  * Note: List must be 1 item per line. 
* Run `node dropbox-search-compiler` and follow prompts
* That's it!

