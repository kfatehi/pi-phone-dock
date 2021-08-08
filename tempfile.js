

function tempFile(ext='.flac') {
    let rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    let tempFile = '/dev/shm/'+rand+ext;
    return tempFile;
}




module.exports = { tempFile }
