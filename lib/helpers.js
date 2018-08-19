
const crypto = require('crypto');

const helpers = {};

helpers.parseJsonStringToObject = str => {
    str = typeof str == 'string' && str.length > 0 ? str : null;
    if (!str) {
        return {};
    }
    try {
        return JSON.parse(str);
    }
    catch(e) {
        return {};
    }
};

helpers.createHash = str => {
    str = typeof str == 'string' && str.length > 0 ? str : null;
    if (!str) {
        return null;
    }
    return crypto.createHash('sha256').update(str).digest('hex');
};

helpers.createRandomString = length => {
    length = typeof length == 'number' && length > 0 ? length : 20;
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        const charIndex = Math.floor(Math.random() * possibleChars.length);
        str += possibleChars.charAt(charIndex);
    }
    return str;
};


module.exports = helpers;