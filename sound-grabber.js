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
}

module.exports = {
    SoundGrabber
}