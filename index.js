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
app.get("/", async (req, res)=>{
    if(req.query.link){
        let  detail = await yt.getBasicInfo(req.query.link)
        let relatedDetails = detail.videoDetails
        let title = relatedDetails.title
        res.send(title)
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