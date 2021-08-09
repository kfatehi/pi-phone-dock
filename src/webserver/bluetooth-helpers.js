const spawn = require('child_process').spawn;
const split2 = require('split2');

const { broadcast } = require('./global-socketry')

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

const getControllerInfo = sendEvent => {
    let bluetoothctl = spawn("bluetoothctl", ['--', 'list']);
    let ctrl = [];
    bluetoothctl.stdout.pipe(split2()).on('data', (data)=>{
        let matches = data.match(/^Controller\s(([0-9A-F]{2}[:-]){5}([0-9A-F]{2}))\s(.+)$/);
        if (matches) {
            ctrl.push({
                macAddress: matches[1],
                name: matches[matches.length-1]
            });
        }
    });
    bluetoothctl.on('exit', ()=>{
        if (ctrl.length === 0) return;
        let macAddress = ctrl[0].macAddress;
        if (!macAddress) return;
        let bluetoothctl = spawn("bluetoothctl", ['--', 'show', macAddress]);
        let info = {};
        bluetoothctl.stdout.pipe(split2()).on('data', (data)=>{
            let matches = data.match(/^\s+(\w+):\s(.+)$/);
            if (matches && matches[1] !== "UUID") {
                info[matches[1].toLowerCase()] = matches[2];
            }
        });
        bluetoothctl.on('exit', ()=>{
            sendEvent("bluetooth-controller-info", { macAddress, info });
            if (info.discovering) {
                getDiscoveredDeviceList(sendEvent);
            }
        }) 
    })
}

const getDiscoveredDeviceList = sendEvent => {
    let bluetoothctl = spawn("bluetoothctl", ['--', 'devices']);
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
        sendEvent("bluetooth-discovered-devices", { devices });
    })
}


let scanProc = null;
let scanResultInterval = null;
const getOrCreateBluetoothScanInstance = () => {
    if (scanProc) return;
    scanProc = spawn("bluetoothctl", ['--', 'scan', 'on']);
    scanProc.stdout.pipe(split2()).on('data', (data)=>{
        // devices stream in here but rather use interval
    });

    scanResultInterval = setInterval(()=>{
        getDiscoveredDeviceList(broadcast)
        getControllerInfo(broadcast);
    }, 1000);
}

const destroyBluetoothScanInstance = () => {
    if (scanProc) {
        clearInterval(scanResultInterval);
        scanProc.stdout.removeAllListeners();
        scanProc.kill()
        scanProc = null;
    }
    getDiscoveredDeviceList(broadcast);
}

module.exports = {
    getInfo, getPairedDeviceList, connectPairedDevice, disconnectPairedDevice, getControllerInfo,
    getDiscoveredDeviceList,
    getOrCreateBluetoothScanInstance,
    destroyBluetoothScanInstance
}