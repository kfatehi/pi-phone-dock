
function tempFile(ext='.flac') {
    let ts = new Date().getTime();
    let tempFile = '/dev/shm/aud-'+ts+ext;
    return tempFile;
}




module.exports = { tempFile }
