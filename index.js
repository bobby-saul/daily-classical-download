import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const filePath = path.join(__dirname, "data", name + ".mp3");
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filePath}`);
    return;
  }
  // Save to fs
  fetch(url).then((response) => {
    response.arrayBuffer().then((arrayBuffer) => {
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      console.log(`Downloaded ${name}:\n ${filePath}`);
    });
  });
}

// Get rss feed and download all mp3 items
getRSS().then((json) => {
  const items = json.rss.channel[0].item;
  items.forEach((item) => {
    downloadMp3(item);
  });
});
