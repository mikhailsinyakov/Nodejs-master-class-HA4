
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


module.exports = helpers;