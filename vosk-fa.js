var vosk = require('./libvosk')

const fs = require("fs");
const { Readable } = require("stream");
const wav = require("wav");

MODEL_PATH = __dirname+"/vosk-model-small-fa-0.5"

if (!fs.existsSync(MODEL_PATH)) {
    console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
    process.exit()
}

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);

module.exports = async function(audioFilePath) {
    return new Promise((resolve, reject) => {
        const wfReader = new wav.Reader();
        const wfReadable = new Readable().wrap(wfReader);
    
        wfReader.on('format', async ({ audioFormat, sampleRate, channels }) => {
            if (audioFormat != 1 || channels != 1) {
                reject(new Error("Audio file must be WAV format mono PCM."))
            }
            const rec = new vosk.Recognizer({model: model, sampleRate: sampleRate});
            rec.setMaxAlternatives(1);
            rec.setWords(false);
            for await (const data of wfReadable) {
                rec.acceptWaveform(data);
            }
            resolve(rec.finalResult(rec));
            rec.free();
        });
    
        fs.createReadStream(audioFilePath, {'highWaterMark': 4096}).pipe(wfReader).on('error', (err)=>reject(err));
    });
}