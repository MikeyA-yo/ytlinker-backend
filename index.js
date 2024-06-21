const yt = require("ytdl-core");
const fs = require("node:fs")
const path = require('path');
const cors = require("cors");
const express = require("express");
const app = express();
const corsOption = {
    origin:"http://localhost:5173/"
}
app.use(cors())

function genTimeStamp(time){
    let hour;
    let minutes;
    let seconds;
    function timeRec(time){
        if (time >= 3600){
            hour = Math.floor(time/3600)
            hour = hour > 9 ? hour : `0${hour}`
            return timeRec(time % 3600)
           // let reminder = time % 3600
          }else if(time >= 60 && time < 3600){
              minutes = Math.floor(time/60)
              minutes = minutes > 9 ? minutes : `0${minutes}`
              return timeRec(time % 60)
          }else{
              seconds = time > 9 ? time : `0${time}`
              return `${hour  ?? "00"} : ${minutes ?? "00"} : ${seconds  ?? "00"}`
          }
    }
    return timeRec(time)
}
app.get("/", async (req, res)=>{
    if(req.query.link){
       try {
        let  detail = await yt.getBasicInfo(req.query.link)
        let relatedDetails = detail.videoDetails
        let timestamp = genTimeStamp(parseInt(relatedDetails.lengthSeconds));
        let image = relatedDetails.thumbnails
        let title = relatedDetails.title
        res.json({title, timestamp, image })
       } catch (err) {
        console.log(err.message)
       }
      }else{
        res.send("yes")
      }
})
function genRandom(len){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let res = ''
    for (let i = 0; i < len; i++){
        let index = Math.floor(Math.random() * 62);
        res += characters.charAt(index);
    }
    return res;
}
let filename = `${genRandom(12)}.mp4`
console.log(filename)
app.get("/download", (req, res)=>{
    console.log(req.query)
    if(req.query.link){
        const {link} = req.query
        const stream = yt(link, { filter: 'audioandvideo'})
        const writeStream = fs.createWriteStream(filename)
        stream.pipe(writeStream)
        .on("finish",()=>{
            res.download(filename, (err)=>{
                if(err){
        
                }else{
                    console.log("yo")
                    fs.unlinkSync(filename)
                }
            })
        })
    }else{
        res.status(400).send("Bad request")
    }
   
})
// app.get("/details", async (req, res) =>{
//     if(req.query.link){
//         let  detail = await yt.getBasicInfo(req.query.link)
//         let relatedDetails = detail.videoDetails
//         console.log(relatedDetails)
//       }
// })
app.listen(3000, ()=>{
    console.log("I'm running")
})