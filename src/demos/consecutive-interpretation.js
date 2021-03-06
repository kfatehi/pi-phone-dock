// In this design we use consecutive interpretation
// And we disrupt the flow of the call letting both parties hear
// everything. https://en.wikipedia.org/wiki/Language_interpretation#Consecutive
// Original proof of concept / prototype.

const { SoundGrabber } = require('./sound-grabber');
const translate = require('@vitalets/google-translate-api');
const { textToSpeech } = require('./tts');
const { speechToText } = require('./vosk');
const playOn = require('./play-on');

const AG_MIC_SINK = "bluez_sink.DC_52_85_E1_60_48.headset_audio_gateway";
const AG_SPEAKER_SOURCE = 'bluez_source.DC_52_85_E1_60_48.headset_audio_gateway';
const USER_MIC_SOURCE = 'alsa_input.usb-SteelSeries_SteelSeries_Arctis_7-00.analog-mono';
const USER_SPEAKER_SINK = "alsa_output.usb-SteelSeries_SteelSeries_Arctis_7-00.analog-mono";

async function main() {
    console.log("Starting up...")

    const magicTranslator = (from, to) => async (audioFile) => {
        let logPrefix = `${new Date().toLocaleString()}|${audioFile.path}|${from}->${to}:`;
        const log = (...args)=>console.log(logPrefix, ...args);
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

    let speaker = new SoundGrabber({ device: AG_SPEAKER_SOURCE, prefixWith: "farsi" })
    speaker.on('audio-file', magicTranslator('fa', 'en'));
    speaker.start();

    let mic = new SoundGrabber({ device: USER_MIC_SOURCE, prefixWith: "english" })
    mic.on('audio-file', magicTranslator('en', 'fa'));
    mic.start();

    console.log("Ready.")
}

main();

