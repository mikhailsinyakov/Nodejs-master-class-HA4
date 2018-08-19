
const fs = require('fs');
const path = require('path');
const util = require('util');

const lib = {};

lib.fsPromises = {
    writeFile: util.promisify(fs.writeFile),
    open: util.promisify(fs.open),
    close: util.promisify(fs.close)
};

lib.baseDir = path.join(__dirname, '../.data/');

lib.create = (folder, filename, dataObj) => {
    folder = typeof folder == 'string' && folder.length > 0 ? folder : null;
    filename = typeof filename == 'string' && filename.length > 0 ? filename : null;
    dataObj = typeof dataObj == 'object' ? dataObj : null;

    if (!folder || !filename || !dataObj) {
        return Promise.reject('Specified arguments are invalid');
    }

    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/${filename}.json`;
    const dataJson = JSON.stringify(dataObj);
    let fileDescriptor;
    return new Promise((resolve, reject) => {
        fsPromises.open(path, 'wx')
        .then(_fileDescriptor => {
            fileDescriptor = _fileDescriptor;
            return fsPromises.writeFile(path, dataJson);
        }).then(() => fsPromises.close(fileDescriptor))
        .then(() => resolve(dataObj))
        .catch(e => reject(e));
    });
};

lib.read = (folder, filename) => {
    const path = `${lib.baseDir}${folder}/${filename}.json`;
    
};

lib.update = (folder, filename, data) => {
    const path = `${lib.baseDir}${folder}/${filename}.json`;

};

lib.delete = (folder, filename) => {
    const path = `${lib.baseDir}${folder}/${filename}.json`;

};


module.exports = lib;