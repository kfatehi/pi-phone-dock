const clients = {}

const trackClient = (ws) => {
    let rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    clients[rand] = ws;
    ws.on('close', ()=>{
        ws.removeAllListeners();
        clients[rand] = null;
        delete clients[rand];
    })
}

const broadcast = (name, data={}) => {
    console.log("awefawef", clients)
    for (let id of Object.keys(clients)) {
        let client = clients[id];
        let payload = { name, ...data };
        client.send(JSON.stringify(payload));
    }
}

module.exports = {
    trackClient, broadcast
}