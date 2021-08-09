// honestly sox can do a lot
// here are some xamples 
// https://gist.github.com/ideoforms/d64143e2bad16b18de6e97b91de494fd
// but we are using it for silence-based splitting here only 

const spawn = require('child_process').spawn;

const EventEmitter = require('events').EventEmitter;

const { tempFile } = require('./tempfile');

const { AudioFile } = require('./audio-file');

class SoundGrabber extends EventEmitter {
    constructor(config) {
        super()
        this.config = config;
        if (!this.config.silence) {
            this.config.silence = [
                // nice explanation of silence behavior here https://unix.stackexchange.com/questions/318164/sox-split-audio-on-silence-but-keep-silence
                '1', '0.1', '0.1%', // Remove silence, if any, at the start until 0.1 seconds of sound above 0.1%
                '1', '0.5', '0.1%' // Stop when there is at least 0.5 seconds of silence below 0.1%
            ]
        }
    }
    start() {
        let audioFile = tempFile('.wav');
        this.parec = spawn('parec', ['-d', this.config.device]);
        // this.sox = spawn('sox', ['-t', 'raw', '-b', '16', '-e', 'signed', '-c', '2', '-r', '44100', '-', audioFile, 'silence', ...this.config.silence])
        // vosk wants PCM 16khz 16bit mono
        // hey this is a pretty stunning way to learn some commands! https://explainshell.com/explain?cmd=sox+-r+48000+-b+16+-e+unsigned-integer+IMG_5367.raw+image.ogg+
        // reading the manpage revealed how to the conversion by simply chaining additional effects
        this.sox = spawn('sox', ['-t', 'raw', '-b', '16', '-e', 'signed', '-c', '2', '-r', '44100', '-', audioFile,
            'silence', ...this.config.silence,
            'rate', '16000',
            'channels', '1',
            'vad'
        ])
        this.parec.stdout.pipe(this.sox.stdin);
        this.sox.stdin.on('error', ()=>{ /* swallowing this error event which happens normally when sox exits after silence detection */ });
        this.sox.on('exit', (code)=>{
            this.sox = null;
            this.parec = null;
            this.start();
            this.emit('audio-file', new AudioFile(audioFile));
        });
    }
    stop() {
        console.log("Stopping sound grabber!");
        this.sox.removeAllListeners('exit');
        this.parec.kill();
    }
}

module.exports = {
    SoundGrabber
}