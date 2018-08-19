
const fs = require('fs');
const path = require('path');
const util = require('util');
const helpers = require('./helpers');

const lib = {};

lib.fsPromises = {
    writeFile: util.promisify(fs.writeFile),
    open: util.promisify(fs.open),
    close: util.promisify(fs.close),
    readFile: util.promisify(fs.readFile),
    truncate: util.promisify(fs.truncate),
    appendFile: util.promisify(fs.appendFile)
};

lib.baseDir = path.join(__dirname, '../.data/');

lib.create = (folder, filename, dataObject) => {
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
            }).catch(e => reject('Error reading the file'));
    });
    
};

lib.update = (folder, filename, newUserProperties) => {
    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/${filename}.json`;

    let fileDescriptor = null;
    let userObject = null;

    return new Promise((resolve, reject) => {
        fsPromises.open(path, 'r+')
            .then(_fileDescriptor => {
                fileDescriptor = _fileDescriptor;
                return fsPromises.readFile(path, 'utf8');
            }, e => reject('Specified user does not exist'))
            .then(data => {
                userObject = helpers.parseJsonStringToObject(data);
                return fsPromises.truncate(path);
            }, e => reject('Could not read the file'))
            .then(() => {
                const { firstName, lastName, streetAddress, password } = newUserProperties
                if (firstName) {
                    userObject.firstName = firstName;
                }
                if (lastName) {
                    userObject.lastName = lastName;
                }
                if (streetAddress) {
                    userObject.streetAddress = streetAddress;
                }
                if (password) {
                    userObject.hashedPassword = helpers.createHash(password);
                }
                const dataJson = JSON.stringify(userObject);
                return fsPromises.appendFile(path, dataJson);
            }, e => reject('Could not truncate the file'))
            .then(() => fsPromises.close(fileDescriptor),
                e => reject('Could not append new data to the file'))
            .then(() => resolve(),
                e => reject('Could not close the file'));
    });
};

lib.delete = (folder, filename) => {
    const path = `${lib.baseDir}${folder}/${filename}.json`;

};


module.exports = lib;