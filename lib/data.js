
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
    appendFile: util.promisify(fs.appendFile),
    unlink: util.promisify(fs.unlink),
    readdir: util.promisify(fs.readdir)
};

lib.baseDir = path.join(__dirname, '../.data/');

lib.create = (folder, filename, dataObject) => {
    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/${filename}.json`;
    const dataJson = JSON.stringify(dataObject);

    return fsPromises.open(path, 'wx')
        .then(fd => Promise.all([fsPromises.writeFile(fd, dataJson), fd]))
        .catch(e => {
            console.error(e);
            throw Error('Specified file already exist')
        }).then(([_, fd]) => fsPromises.close(fd))
        .then(() => dataObject)
        .catch(e => {
            console.error(e);
            throw Error('Internal server error');
        });
};

lib.read = (folder, filename) => {
    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/${filename}.json`;

    return fsPromises.readFile(path, 'utf8')
        .then(data => helpers.parseJsonStringToObject(data))
        .catch(e => {
            console.error(e);
            throw Error('Specified file does not exist');
        });
    
};

lib.update = (folder, filename, dataObject) => {
    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/${filename}.json`;

    return fsPromises.open(path, 'r+')
        .then(fd => Promise.all([fsPromises.truncate(path), fd]))
        .catch(e => {
            console.error(e);
            throw Error('Specified file does not exist');
        }).then(([_, fd]) => {
            const dataJson = JSON.stringify(dataObject);
            return Promise.all([fsPromises.appendFile(fd, dataJson), fd]);
        }).then(([_, fd]) => fsPromises.close(fd))
        .catch(e => {
            console.error(e);
            throw Error('Internal server error');
        });
};

lib.delete = (folder, filename) => {
    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/${filename}.json`;

    return fsPromises.unlink(path)
        .catch(e => {
            console.error(e);
            throw Error('Internal server error');
        });
};

lib.list = folder => {
    const { fsPromises } = lib;
    const path = `${lib.baseDir}${folder}/`;

    return fsPromises.readdir(path)
        .then(files => files.map(fileName => fileName.replace('.json', '')))
        .catch(e => {
            console.error(e);
            throw Error('Internal server error');
        });
};


module.exports = lib;