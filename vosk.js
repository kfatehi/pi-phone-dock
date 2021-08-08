var vosk = require('./libvosk')

const fs = require("fs");
const { Readable } = require("stream");
const wav = require("wav");

function getModelPath(lang) {
    switch (lang) {
        case "en":
            return __dirname+"/vosk-model-small-en-us-0.15";
        case "fa":
            return __dirname+"/vosk-model-small-fa-0.5";
    }
    return null;
}

function createInstance(lang) {
    const MODEL_PATH = getModelPath(lang);

    if (!fs.existsSync(MODEL_PATH)) {
        console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
        process.exit()
    }

    vosk.setLogLevel(0);
    const model = new vosk.Model(MODEL_PATH);

    return async function(audioFilePath) {
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
}

const voskFarsi = createInstance('fa');
const voskEnglish = createInstance('en');

function getInstance(lang) {
    switch (lang) {
        case "en":
            return voskEnglish;
        case "fa":
            return voskFarsi;
    }
    return null;
}

async function speechToText(lang, audiofilepath) {
    let voskInstance = getInstance(lang);
    let result = await voskInstance(audiofilepath);
    if (result.alternatives.length) {
        let text = result.alternatives[0].text;
        if (text.length) {
            return text;
        }
    }
    return null;
}

module.exports = { speechToText };