const englishtts = require('./english-tts');
const farsitts = require('./farsi-tts');

function getInstance(lang) {
    switch (lang) {
        case "en":
            return englishtts;
        case "fa":
            return farsitts;
    }
    return null;
}

async function textToSpeech(lang, text) {
    let ttsinstance = getInstance(lang);
    let result = await ttsinstance(text);
    return result;
}

module.exports = { textToSpeech };