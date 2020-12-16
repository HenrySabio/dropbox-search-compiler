# Dropbox Search & Compiler
Hi! I have to search for a million files a day at work so I made an automated dropbox file search via CLI using the Dropbox Javascript SDK to make my life easier.

This is slowly changing as I learn to improve and streamline it - feel free to build off it for your own use! I built it out for my specific use case - but the concept is simple enough for someone to pick it apart, clean it up, and make it their own.

(This is my first real world application of the skills I've learned via self teaching and a bootcamp I attended - so I'm open to any advice or ideas should anyone take the time to provide it.)

![GIF of app running](img/app-gif.gif)

## Features

* Takes a .txt file you provide, containing names of files you need, then automatically searches for the files on your linked dropbox.
* Files that are found are copied to a new folder (requested-files) in your dropbox root directory using the following heirarchy: 
  * name > todays-date > files found
* Any files found or not found are also logged into their own respectice .txt files in the 'results' folder located in the applications root directory

## Planned features

* Choose file extensions being search for

## Installation

Installation is simple.
* Fork & Clone the repository to your computer
* `cd` into application directory
* Run `npm i` to download required node packages
* Created a `.env` file within the root directory and assign your dropbox API key
* Create a `search.txt` file inside the `data` folder and create list of files you'd like to search for.
  * Note: List must be 1 item per line. 
* Run `node dropbox-search-compiler` and follow prompts
* That's it!

More updates to follow as needs require.