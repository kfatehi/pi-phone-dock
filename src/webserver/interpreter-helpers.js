const { broadcast } = require('./global-socketry');
const { readPulseConfigFile } = require('./pulseaudio-helpers');

let interpreterProc = null;

const getInterpreterStatus = ()=>{
    if (interpreterProc === null) {
        broadcast('interpreter-status', { enabled: false })
    } else {
        broadcast('interpreter-status', { enabled: true })
    }
}

const startInterpreter = async ()=>{
    if (interpreterProc !==  null) return;
    let speaker = null;
    let mic = null;

    interpreterProc = {
        stop: ()=>{
            speaker.stop();
            speaker = null;
            mic.stop();
            mic = null;
            interpreterProc = null;
            broadcast('interpreter-status', { enabled: false });
        }
    }

    broadcast('interpreter-status', { enabled: true })

    let pulseConfig = await readPulseConfigFile();

    console.log(pulseConfig)
    
    const { SoundGrabber } = require('../core/sound-grabber');
    const translate = require('@vitalets/google-translate-api');
    const { textToSpeech } = require('../text-to-speech');
    const { speechToText } = require('../speech-recognition/vosk');
    const playOn = require('../core/play-on');
    
    const AG_MIC_SINK = pulseConfig.audiogatewayMicSink;
    const AG_SPEAKER_SOURCE = pulseConfig.audiogatewaySpeakerSource;
    const USER_MIC_SOURCE = pulseConfig.userMicSource;
    const USER_SPEAKER_SINK = pulseConfig.userSpeakerSink;

    const magicTranslator = (from, to) => async (audioFile) => {
        let logPrefix = `${new Date().toLocaleString()}|${audioFile.path}|${from}->${to}:`;
        const log = (...args)=>broadcast('log', {logPrefix, args});
        try {
            log("attempting to recognize speech")
            let nativeText = await speechToText(from, audioFile.path);
            if (nativeText) {
                log("recognition success! attempting translation:", nativeText)
                let foreign = await translate(nativeText, {from, to});            
                log("translation success! attempting speech synthesis:", nativeText)
                let foreignAudioFile = await textToSpeech(to, foreign.text);
                log("synthesis success! attempting playback for the listeners!");
                await playOn([AG_MIC_SINK, USER_SPEAKER_SINK], foreignAudioFile.path);
                await foreignAudioFile.rm();
            }
            await audioFile.rm();
        } catch (err) {
            log("An error occurred but we were able to recover, but dont trust like that, restart probably", err);
        }
    }

    speaker = new SoundGrabber({ device: AG_SPEAKER_SOURCE, prefixWith: "farsi" })
    speaker.on('audio-file', magicTranslator('fa', 'en'));
    speaker.start();

    mic = new SoundGrabber({ device: USER_MIC_SOURCE, prefixWith: "english" })
    mic.on('audio-file', magicTranslator('en', 'fa'));
    mic.start();

    console.log("Ready.")
}

const stopInterpreter = ()=>{
    if (interpreterProc !== null) {
        interpreterProc.stop();
    }
}



module.exports = {
    getInterpreterStatus, startInterpreter, stopInterpreter
}