const spawn = require('child_process').spawn;
const split2 = require('split2');
const { broadcast } = require('./global-socketry')

const pulseConfig = {
    audiogatewayMicSink: "",
    audiogatewaySpeakerSource: "",
    userMicSource: "",
    userSpeakerSink: ""
}

const pulseList = async (sos)=>{
    return new Promise((resolve, reject)=>{
        let results = [{name: ""}];
        let proc = spawn("bash", ['-c', `pacmd list-${sos} | grep -e 'name:' -e 'index' -e 'Speakers' | grep name`])
        proc.stderr.pipe(process.stderr);
        proc.stdout.pipe(split2()).on('data', (data)=>{
            let match = data.match(/<(.+)>/)
            if (match) results.push({ name: match[1] });
        }).on('end', ()=> resolve(results))
    });
}

const getPulseChoices = async ()=>{
    let [sinks, sources] = await Promise.all([pulseList('sinks'),pulseList('sources')]);
    broadcast("pulse-choices", { sinks, sources });
}

const getPulseConfig = ()=>{   
    broadcast("pulse-config", { config: pulseConfig });
}

const setPulseConfig = (key, value)=>{
    pulseConfig[key] = value;
    getPulseConfig();
}

module.exports = {
    getPulseConfig, setPulseConfig, getPulseChoices
}