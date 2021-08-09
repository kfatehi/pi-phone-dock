const axios = require('axios');
const fs = require('fs');
const { spawn } = require('child_process');
const { tempFile } = require('../core/tempfile');
const { AudioFile } = require('../core/audio-file');

async function tts(content) {
    return new Promise(async (resolve, reject)=>{
        let aac = new AudioFile(tempFile('.aac'));
        let wav = new AudioFile(tempFile('.wav'));
        let resp1 = await axios.post("https://tts.farsi.keyvan.tv/tts", { content });
        let resp2 = await axios.get("https://tts.farsi.keyvan.tv"+resp1.data.path, {responseType: "stream"} )  
        resp2.data.on('end', ()=>{
            let ffmpeg = spawn('ffmpeg', ['-i', aac.path, wav.path ])
            ffmpeg.on('exit', ()=>{
                resolve(wav);
                aac.rm();
            })
        })
        resp2.data.pipe(fs.createWriteStream(aac.path))
    })
}

if (!module.parent) {
    tts("نمایش ازمنه سویی لیکن ").then(res=>{
        console.log(res);
    }).catch(err=>{
        console.log(err.stack)
    })
}

module.exports = tts;