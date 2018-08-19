
const fs = require('fs');
const path = require('path');
const util = require('util');
const helpers = require('./helpers');

const lib = {};

lib.fsPromises = {
    writeFile: util.promisify(fs.writeFile),
    open: util.promisify(fs.open),
    close: util.promisify(fs.close),
    readFile: util.promisify(fs.readFile)
};

lib.baseDir = path.join(__dirname, '../.data/');

lib.create = (folder, filename, dataObject) => {
    folder = typeof folder == 'string' && folder.length > 0 ? folder : null;
    filename = typeof filename == 'string' && filename.length > 0 ? filename : null;
    dataObject = typeof dataObject == 'object' ? dataObject : null;

    if (!folder || !filename || !dataObject) {
        return Promise.reject('Specified arguments are invalid');
    }

    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/${filename}.json`;
    const dataJson = JSON.stringify(dataObject);
    let fileDescriptor;
    return new Promise((resolve, reject) => {
        fsPromises.open(path, 'wx')
            .then(_fileDescriptor => {
                fileDescriptor = _fileDescriptor;
                return fsPromises.writeFile(path, dataJson);
            }, e => reject('Specified user already exist'))
            .then(() => fsPromises.close(fileDescriptor), 
                e => reject('Error writing the file'))
            .then(() => resolve(dataObject), 
                e => reject('Error closing the file'));
    });
};

lib.read = (folder, filename) => {
    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/${filename}.json`;

    return new Promise((resolve, reject) => {
        fsPromises.readFile(path, 'utf8')
            .then(data => {
                const userObject = helpers.parseJsonStringToObject(data);
                delete userObject.hashedPassword;
                resolve(userObject);
            }).catch(e => reject(e));
    });
    
};

lib.update = (folder, filename, data) => {
    const path = `${lib.baseDir}${folder}/${filename}.json`;

};

lib.delete = (folder, filename) => {
    const path = `${lib.baseDir}${folder}/${filename}.json`;

};


module.exports = lib;