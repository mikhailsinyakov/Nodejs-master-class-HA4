
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const util = require('util');

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
            if (statusCode == 200) {
                console.log(`Created order for $${amount}`);
                resolve();
            } else {
                reject(Error('Could not connect to stripe api'));
            }
        });
    });
};

helpers.sendMailgunEmail = order => {
    const { user } = order;
    const { firstName, lastName, streetAddress, email } = user;
    let { receiptTime } = order;
    receiptTime = helpers.dateToPrettierFormat(receiptTime);

    const apiKey = process.env.MAILGUN_PRIVATE_KEY;
    const domain = 'sandboxa5a7bfdcc02a4ecbbc4bc93e5278d2c2.mailgun.org';

    const orderMetadata = `<h2>Ship to:</h2>\n<p>${firstName} ${lastName}</p>\n<p>${streetAddress}</p>\n<p>Receipt time: ${receiptTime}</p>`;
    const orderData = order.items.map(item => {
        return `<tr>\n<td>${item.name}</td>\n<td>$${item.price}</td>\n<td>${item.number}</td>\n<td>$${Math.round(item.number * item.price * 100) / 100}</td>\n</tr>`
    }).join('\n');
    const tableHead = `<tr>\n<td><strong>Name</strong></td>\n<td><strong>Unit price</strong></td>\n<td><strong>Quantity</strong></td>\n<td><strong>Amount</strong></td>\n</tr>`
    const total = `<h3><strong>Total:</strong>$${order.sum}`
    
    const receiptHTML = `${orderMetadata}\n<table>\n${tableHead}\n${orderData}\n</table>\n${total}\n</h3>\n<h3>Thank you for ordering</h3>`;

    const postData = {
        from: `Pizza-delivery company <orders@${domain}>`,
        to: `${firstName} ${lastName} <${email}>`,
        subject: `Receipt for order #${order.orderId}`,
        html: receiptHTML
    };

    const queryStringData = querystring.stringify(postData);

    const options = {
        hostname: 'api.mailgun.net',
        method: 'POST',
        path: `/v3/${domain}/messages`,
        auth: `api:${apiKey}`,
        headers: {
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
            if (statusCode == 200) {
                console.log(`Sent email to ${email}`);
                resolve();
            } else {
                reject(Error('Could not connect to mailgun api'));
            }
        });
    });
};

helpers.dateToPrettierFormat = date => {
    date = typeof date == 'number' ? new Date(date) : new Date();

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;

};

helpers.baseTemplateDir = path.join(__dirname, '../templates/');
helpers.basePublicDir = path.join(__dirname, '../public/');

helpers.fsPromises = {
    readFile: util.promisify(fs.readFile)
};

helpers.getTemplate = filename => {
    filename = typeof filename == 'string' && filename.length > 0 ? filename : null;
    if (!filename) {
        return Promise.reject(Error('Internal server error'));
    }

    const { readFile } = helpers.fsPromises;
    const pathToFile = helpers.baseTemplateDir + filename + '.html';
    return readFile(pathToFile, 'utf8')
        .catch(e => {
            throw Error('Not found');
        });
};

// Replace variables on a object property with the same key
helpers.interpolate = (str, templateData, currentProtocol) => {
    str = typeof str == 'string' && str.length > 0 ? str : null;

    if (!str) {
        return null;
    }
    
    templateData = typeof templateData == 'object' ? templateData : {};
    const protocol = currentProtocol;
    const port = protocol == 'http' ? config.httpPort : config.httpsPort;
    const mainData = {
        'main.baseUrl': `${protocol}://localhost:${port}/`,
        'main.author': 'Mikhail Sinyakov',
        'main.companyName': 'Pizza-Delivery Company',
        'main.yearCreated': '2018'
    };
    const totalData = { ...mainData, ...templateData };
    
    for (let key in totalData) {
        if (totalData.hasOwnProperty(key)) {
            // Replace all the found strings with the data
            const find = new RegExp(`{${key}}`, 'g');
            const replace = totalData[key];
            str = str.replace(find, replace);
        }
    }

    // If any variables remains, replace it with empty string
    const find = /{\S+}/g;
    str = str.replace(find, '');

    return str;
};

helpers.getPublicFile = filename => {
    filename = typeof filename == 'string' && filename.length > 0 ? filename : null;
    if (!filename) {
        return Promise.reject(Error('Internal server error'));
    }

    const { readFile } = helpers.fsPromises;
    const pathToFile = helpers.basePublicDir + filename;

    return readFile(pathToFile)
        .catch(e => {
            throw Error('Not found');
        });
};

module.exports = helpers;