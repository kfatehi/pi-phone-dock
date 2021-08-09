const spawn = require('child_process').spawn;
const split2 = require('split2');
const { broadcast } = require('./global-socketry')
const fs = require('fs');

const configFilePath = '/home/pi/pidock-pulse-config.json';

let pulseConfig = {
    audiogatewayMicSink: "",
    audiogatewaySpeakerSource: "",
    userMicSource: "",
    userSpeakerSink: ""
}

const pulseList = async (sos) => {
    return new Promise((resolve, reject) => {
        let results = [{ name: "" }];
        let proc = spawn("bash", ['-c', `pacmd list-${sos} | grep -e 'name:' -e 'index' -e 'Speakers' | grep name`])
        proc.stderr.pipe(process.stderr);
        proc.stdout.pipe(split2()).on('data', (data) => {
            let match = data.match(/<(.+)>/)
            if (match) {
                let name = match[1];
                if (!name.match(/bcm2835/)) {
                    results.push({ name });
                }
            }
        }).on('end', () => resolve(results))
    });
}

const getPulseChoices = async () => {
    let [sinks, sources] = await Promise.all([pulseList('sinks'), pulseList('sources')]);
    broadcast("pulse-choices", { sinks, sources });
}


const writePulseConfigFile = () => {
    return new Promise((resolve, reject) => {
        fs.writeFile(configFilePath, JSON.stringify({ pulseConfig }), (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

const readPulseConfigFile = () => {
    return new Promise((resolve, reject) => {
        fs.exists(configFilePath, (exists)=>{
            if (exists) {
                fs.readFile(configFilePath, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        try {
                            resolve(JSON.parse(data).pulseConfig);
                        } catch (err) {
                            writePulseConfigFile().then(resolve, reject);
                        }
                    }
                })
            } else {
                writePulseConfigFile().then(resolve, reject);
            }
        })
    });
}


const getPulseConfig = async () => {
    pulseConfig = await readPulseConfigFile();
    broadcast("pulse-config", { config: pulseConfig });
}

const setPulseConfig = async (key, value) => {
    pulseConfig[key] = value;
    writePulseConfigFile();
    broadcast("pulse-config", { config: pulseConfig });
}

module.exports = {
    getPulseConfig, setPulseConfig, getPulseChoices, readPulseConfigFile
}