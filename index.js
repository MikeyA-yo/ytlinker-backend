const yt = require("@distube/ytdl-core");
const fs = require("node:fs");
const path = require("path");
const cors = require("cors");
const express = require("express");
const app = express();
// const corsOption = {
//     origin:"http://localhost:5173"
// }
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
("http://122.200.19.103:80");

const agent = yt.createProxyAgent({
  uri: "http://152.26.229.66:9443",
});
function genTimeStamp(time) {
  let hour;
  let minutes;
  let seconds;
  function timeRec(time) {
    if (time >= 3600) {
      hour = Math.floor(time / 3600);
      hour = hour > 9 ? hour : `0${hour}`;
      return timeRec(time % 3600);
      // let reminder = time % 3600
    } else if (time >= 60 && time < 3600) {
      minutes = Math.floor(time / 60);
      minutes = minutes > 9 ? minutes : `0${minutes}`;
      return timeRec(time % 60);
    } else {
      seconds = time > 9 ? time : `0${time}`;
      return `${hour ?? "00"} : ${minutes ?? "00"} : ${seconds ?? "00"}`;
    }
  }
  return timeRec(time);
}
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
app.get("/", async (req, res) => {
  if (req.query.link) {
    try {
      if (req.query.link.length < 12) {
        res.status(400).send("Confirm Link");
      }
      let detail = await yt.getBasicInfo(req.query.link, {agent});
      let relatedDetails = detail.videoDetails;
      let timestamp = genTimeStamp(parseInt(relatedDetails.lengthSeconds));
      let image = relatedDetails.thumbnails;
      let title = relatedDetails.title;
      res.json({ title, timestamp, image });
    } catch (err) {
      console.log(err.message);
    }
  } else {
    res.send("yes");
  }
});
function genRandom(len) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < len; i++) {
    let index = Math.floor(Math.random() * 62);
    res += characters.charAt(index);
  }
  return res;
}
let filename = `${genRandom(12)}.mp4`;
app.get("/download", (req, res) => {
  if (req.query.link) {
    const { link } = req.query;
    const filter = req.query.filter === "mp3" ? "audioonly" : "videoandaudio";
    const stream = yt(link, { filter: filter, requestOptions: {
        headersTimeout: 1000 * 10, // 10 Seconds
        bodyTimeout: 1000 * 10, // 10 Seconds
        agent,
        headers: {
          referer: "https://www.youtube.com/",
        },
      }, });
    filename =
      filter === "videoandaudio" ? filename : filename.replace(".mp4", ".mp3");
    //const writeStream = fs.createWriteStream(filename)
    stream.on("data", (chunk) => {
      res.write(chunk);
    });
    stream.on("end", () => {
      res.end();
    });
  } else {
    res.status(400).send("Bad request");
  }
});
app.get("/sizeDetails", async (req, res) => {
  if (req.query.link) {
    const filter = req.query.filter === "mp3" ? "audioonly" : "videoandaudio";
    const stream = yt(req.query.link, {
      filter: filter,
      agent,
      requestOptions: {
        headersTimeout: 1000 * 10, // 10 Seconds
        bodyTimeout: 1000 * 10, // 10 Seconds
        headers: {
          referer: "https://www.youtube.com/",
        },
      },
    });
    let bytes = 0;
    console.log(stream)
    stream.on("data", (chunk) => {
      bytes += chunk.length;
    });
    stream.on("end", () => {
      console.log(bytes);
      res.send(`${formatBytes(bytes)}`);
    });
  } else {
    res.send("Wrong Usage");
  }
});
app.listen(process.env.PORT || 3001, () => {
  console.log("I'm running");
});
