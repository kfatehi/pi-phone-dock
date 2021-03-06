// infuses an audio file with helper functions that can be used 
// with the audio file as it gets emitted from the soundgrabber.
const spawn = require('child_process').spawn;
const fs = require('fs');

class AudioFile {
    constructor(path) {
        this.path = path;
    }

    async play() {
        // for testing more efficiently...
        return new Promise((resolve, reject)=>{
            let player = spawn('play', [this.path])
            player.stdout.pipe(process.stdout);
            player.on('exit', ()=>resolve());
        })
    }

    async rm() {
        // delete the file when you're done with it
        return new Promise((resolve, reject)=>{
            fs.unlink(this.path, (err) => {
                if (err) {
                    console.error("Error deleting "+this.path, err.message);
                    return reject(err);
                }
                resolve();
            });
        })
    }

}


module.exports = { AudioFile };