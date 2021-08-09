const spawn = require('child_process').spawn;
const split2 = require('split2');

const getInfo = sendEvent => macAddress => {
    let bluetoothctl = spawn("bluetoothctl", ['--', 'info', macAddress]);
    let info = {};
    bluetoothctl.stdout.pipe(split2()).on('data', (data)=>{
        let matches = data.match(/^\s+(\w+):\s(.+)$/);
        if (matches && matches[1] !== "UUID") {
            info[matches[1].toLowerCase()] = matches[2];
        }
    });
    bluetoothctl.on('exit', ()=>{
        sendEvent("bluetooth-device-info", { macAddress, info });
    })    
}


const getPairedDeviceList = sendEvent => {
    let bluetoothctl = spawn("bluetoothctl", ['--', 'paired-devices']);
    let devices = [];
    bluetoothctl.stdout.pipe(split2()).on('data', (data)=>{
        let matches = data.match(/^Device\s(([0-9A-F]{2}[:-]){5}([0-9A-F]{2}))\s(.+)$/);
        if (matches) {
            devices.push({
                macAddress: matches[1],
                name: matches[matches.length-1]
            });
        }
    });
    bluetoothctl.on('exit', ()=>{
        sendEvent("bluetooth-paired-devices", { devices });
    })
}


const connectPairedDevice = sendEvent => macAddress => {
    let bluetoothctl = spawn("bluetoothctl", ['--', 'connect', macAddress]);
    bluetoothctl.on('exit', ()=>{
        getInfo(sendEvent)(macAddress);  
    })
}

const disconnectPairedDevice = sendEvent => macAddress => {
    let bluetoothctl = spawn("bluetoothctl", ['--', 'disconnect', macAddress]);
    bluetoothctl.on('exit', ()=>{
        getInfo(sendEvent)(macAddress);  
    })
}

module.exports = {
    getInfo, getPairedDeviceList, connectPairedDevice, disconnectPairedDevice
}