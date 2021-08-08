const spawn = require('child_process').spawn;

async function playOn(deviceOrDevices, audioFilePath) {
    if (!Array.isArray(deviceOrDevices)) {
        deviceOrDevices = [deviceOrDevices];
    }
    return Promise.all(deviceOrDevices.map(d=>paplay(d, audioFilePath)));
}


async function paplay(device, audioFilePath) {
    return new Promise((resolve, reject)=>{
        let paplay = spawn('paplay', ['-d', device, audioFilePath]);
        paplay.on('exit', ()=>{
            resolve();
        })
    })
}

module.exports = playOn;