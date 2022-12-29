import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = process.argv.slice(2);
const settingsFile = path.join(__dirname, "data", "settings.json");
let command = "download";
let settings = {
  downloadDir: path.join(__dirname, "data"),
};
if (fs.existsSync(settingsFile)) {
  settings = JSON.parse(fs.readFileSync(settingsFile));
}

// Download the RSS feed and convert xml to json.
async function getRSS() {
  return fetch(
    "https://feeds.publicradio.org/public_feeds/daily-download/rss/rss.rss"
  )
    .then((response) => response.text())
    .then(async (xml) => parseStringPromise(xml));
}

// Download mp3 file
function downloadMp3(item) {
  const name = item.title[0].replace(/[/\\?%*:|"<>]/g, "");
  const url = item.enclosure[0]["$"].url;
  const filePath = path.join(settings.downloadDir, name + ".mp3");
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log(chalk.yellow("File already exists"));
    console.log(chalk.grey(filePath));
    return;
  }
  // Save to fs
  fetch(url).then((response) => {
    response.arrayBuffer().then((arrayBuffer) => {
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      console.log(chalk.green(`Downloaded ${name}`));
      console.log(chalk.grey(filePath));
    });
  });
}

// Get rss feed and download all mp3 items
function getDailyDownloads() {
  getRSS().then((json) => {
    const items = json.rss.channel[0].item;
    items.forEach((item) => {
      downloadMp3(item);
    });
  });
}

// Change settings
async function updateSettings() {
  const downloadDir = await inquirer
    .prompt({
      type: "input",
      name: "downloadDir",
      message: "Enter the full path of the directory to save the MP3s inside.",
      default: settings.downloadDir,
      validate: (input) => {
        if (!fs.existsSync(path.resolve(input))) {
          return `Path does not exist: ${input}`;
        }
        return true;
      },
    })
    .then(({ downloadDir }) => downloadDir);
  settings.downloadDir = downloadDir;
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  console.log(chalk.green("Settings saved!"));
}

if (args.includes("config")) {
  command = "config";
} else if (!args.includes("download")) {
  command = await inquirer
    .prompt({
      type: "list",
      name: "command",
      default: "download",
      choices: [
        { name: "Daily Download", value: "download" },
        { name: "Configure Settings", value: "config" },
      ],
    })
    .then(({ command }) => command);
}

switch (command) {
  case "config":
    updateSettings();
    break;
  default:
    getDailyDownloads();
    break;
}
