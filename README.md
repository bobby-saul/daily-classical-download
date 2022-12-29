# Daily Classical Download

A program to download the
[Your Classical Daily Download](https://www.yourclassical.org/daily-download).

## Install

This script requires node and npm in order to download the required packages.
Clone the repository and run `npm install` in order to download the packages.

Then, your can run index.js with node, `node index.js`. This will give you the
option to run the downloads, or to configure. You can also add 'download' or
'config' to the command to bypass the select. For example,
`node index.js download`. The config will allow you to set the directory where
to download the MP3s inside. By default, it is set to download inside this repo
inside the data directory.

## Add a Cron Job

In order to run the downloads automatically, a cron job can be created to run
the download daily. [Crontab](http://crontab.org/) is a popular option. Your
Classical seems to publish the new music at 06:00:00 +0000 on the weekdays. So,
a cron job that runs the script after this time would be ideal.

`which node` will show  you where the node executable is located, and you can
run `pwd` to get the full path of where the project is in order to point to the
index.js file. `0 8 * * 1-5` will tell crontab to run every Monday-Friday at
8AM. The final touch is to add `>/dev/null` in order to silence the scrip
(optional).

For example, the full line for the cron job would be:
```
0 8 * * 1-5 /Users/bobbysaul/.nvm/versions/node/v18.12.1/bin/node /Users/bobbysaul/Development/daily-classical-download/index.js download >/dev/null
```

## Todo

- [x] Download MP3
  - [x] Get available downloads from RSS feed.
  - [x] Check if MP3 is already downloaded
  - [x] Download MP3 to directory
- [x] Make CLI
- [x] Add cron job documentation
- [x] Settings
  - [x] Change where downloads are saved
