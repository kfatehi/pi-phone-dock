// Main algorithm is as follows:
// Capture phone audio output, creating files split by silence (Sox handles this)
// We will end up with a stream of audio files.
// In this example, we'll just force the audio files to be played back just to test

// PSOURCE=${PSOURCE:-'bluez_source.DC_52_85_E1_60_48.headset_audio_gateway'}
// OUTFILE=${OUTFILE:-'test.ogg'}

// parec -d $PSOURCE | sox -t raw -b 16 -e signed -c 2 -r 44100 - $OUTFILE silence 1 0.1 3% 1 3.0 3%


const farsiTts = require('./farsi-tts');
const { SoundGrabber } = require('./sound-grabber');
const spawn = require('child_process').spawn;
const translate = require('@vitalets/google-translate-api');
const englishtts = require('./english-tts');

async function main() {
    console.log("Starting audio file generator.")

    let grabber = new SoundGrabber({
        device: 'bluez_source.DC_52_85_E1_60_48.headset_audio_gateway', 
        silence: [
            // nice explanation of silence behavior here https://unix.stackexchange.com/questions/318164/sox-split-audio-on-silence-but-keep-silence
            '1', '0.1', '0.1%', // Remove silence, if any, at the start until 0.1 seconds of sound above 0.1%
            '1', '0.5', '0.1%' // Stop when there is at least 0.5 seconds of silence below 0.1%
        ]
    })
    grabber.on('audio-file', async (audioFile)=>{
        // await audioFile.play();
        console.log("checking if i heard farsi")
        let farsiText = await audioFile.recognizeFarsi();
        if (farsiText) {
            console.log("yes, detected farsi", farsiText);
            console.log("attempting to translate to english")
            let translation = await translate(farsiText, {from: 'fa', to: 'en'});
            
            console.log(translation.text);
            let englishAudioFile = englishtts(translation.text);
            await englishAudioFile.play();
            await englishAudioFile.rm();
            // let farsiSpeechURL = await farsiTts(farsiText);
            // console.log(farsiSpeechURL);
            // spawn('mpv', [farsiSpeechURL]);
        }
        await audioFile.rm();
    })
    grabber.start();
}

main();

