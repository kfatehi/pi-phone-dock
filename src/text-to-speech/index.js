const englishtts = require('./english');
const farsitts = require('./farsi');

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