// https://askubuntu.com/questions/53896/natural-sounding-text-to-speech
// https://circuitdigest.com/microcontroller-projects/best-text-to-speech-tts-converter-for-raspberry-pi-espeak-festival-google-tts-pico-and-pyttsx3
// offline, pico is best
/*
wget http://ftp.us.debian.org/debian/pool/non-free/s/svox/libttspico0_1.0+git20130326-9_armhf.deb
wget http://ftp.us.debian.org/debian/pool/non-free/s/svox/libttspico-utils_1.0+git20130326-9_armhf.deb
sudo apt-get install -f ./libttspico0_1.0+git20130326-9_armhf.deb ./libttspico-utils_1.0+git20130326-9_armhf.deb
*/
// newer version requires libc6 2.29 but this pi is on 2.28, so we left it alone
//    libttspico0 : Depends: libc6 (>= 2.29) but 2.28-10+rpi1 is to be installed
const spawn = require('child_process').spawn;
const { tempFile } = require('./tempfile');
const { AudioFile } = require('./audio-file');

module.exports = async function(inputText) {
    return new Promise((resolve, reject) => {
        let audioFile = tempFile('.wav');
        let pico2wave = spawn('pico2wave', ['-w', audioFile, inputText]);

        let stdout = '';
        let stderr = '';
        pico2wave.stdout.pipe(process.stdout);
        pico2wave.stderr.pipe(process.stderr);
        pico2wave.stdout.on('data', data=>stdout += data.toString());
        pico2wave.stderr.on('data', data=>stderr += data.toString());
    
        pico2wave.on('exit', (code)=>{
            console.log("pico done", audioFile, code);
            if (code === 0) {
                resolve(new AudioFile(audioFile));
            } else {
                reject(stderr);
            }
        })
    });
}