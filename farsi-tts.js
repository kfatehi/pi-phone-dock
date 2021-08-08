const axios = require('axios');

module.exports = async function(content) {
    let resp = await axios.post("https://tts.farsi.keyvan.tv/tts", { content });
    return "https://tts.farsi.keyvan.tv"+resp.data.path;
}