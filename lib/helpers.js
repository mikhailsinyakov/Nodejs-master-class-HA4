
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;

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

helpers.getPathLevels = path => {
    const regex = /[^\/]+/g;
    const levels = [];
    let arr;
    while((arr = regex.exec(path)) !== null ) {
        levels.push(arr[0]);
    }
    return levels;
};

helpers.createOrder = (email, amount) => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    const token = 'tok_visa';
    const currency = 'usd';
    const description = `Order for ${email}`;

    const postData = {
        amount: amount * 100,
        currency: 'usd',
        description,
        source: token
    };

    const queryStringData = querystring.stringify(postData);

    const options = {
        hostname: 'api.stripe.com',
        method: 'POST',
        path: '/v1/charges',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(queryStringData),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    const req = https.request(options);
    req.write(queryStringData);
    req.end();

    return new Promise((resolve, reject) => {
        req.on('error', reject);
        req.on('response', res => {
            const statusCode = res.statusCode;
            const decoder = new StringDecoder('utf8');
            let buffer = '';
            res.on('data', data => {
                buffer += decoder.write(data);
            });
            res.on('end', () => {
                buffer += decoder.end();
                const data = helpers.parseJsonStringToObject(buffer);
                if (statusCode == 200) {
                    resolve();
                } else {
                    reject();
                }
                
            });
        });
    });
    


};


module.exports = helpers;