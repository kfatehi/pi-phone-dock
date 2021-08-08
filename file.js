class File {
    constructor(path) {
        this.path = path;
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


module.exports = { File };