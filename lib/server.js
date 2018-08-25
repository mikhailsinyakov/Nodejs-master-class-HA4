
const config = require('./config');
const http = require('http');
const https = require('https');
const fs = require('fs');
const handlers = require('./handlers');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const helpers = require('./helpers');

const server = {};

/*
    helpers.createOrder('mikhail.sinyakov86@gmail.com', 12)
        .then(console.log)
        .catch(console.error)
*/

server.httpServer = http.createServer((req, res) => server.unifiedServer(req, res));

const httpsOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
};
server.httpsServer =  https.createServer(httpsOptions, (req, res) => {
    server.unifiedServer(req, res);
});

server.unifiedServer = (req, res) => {
    const { router } = server;

    const urlObject = url.parse(req.url, true);
    const path = urlObject.pathname;

    const levels = helpers.getPathLevels(path);
    const firstPathLevel = levels[0] ? levels[0] : '/';
    const queryStringObject = urlObject.query;
    const method = req.method.toLowerCase();
    const headers = req.headers;
    
    const chosenHandler = typeof router[firstPathLevel] == 'function' ?
                                router[firstPathLevel] : 
                                handlers.notFound;

    const requestData = {
        path,
        method,
        headers,
        queryStringObject
    };

    const decoder = new StringDecoder('utf8');
    let buffer = '';
    req.on('data', data => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        requestData.payload = helpers.parseJsonStringToObject(buffer);
        chosenHandler(requestData)
            .then(responseData => {
                const { statusCode, body = {} } = responseData;
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = statusCode;
                res.end(JSON.stringify(body));
            }).catch(e => console.log(e));
    });

};

server.router = {
    users: handlers.users,
    tokens: handlers.tokens,
    menu: handlers.menu,
    carts: handlers.carts,
    orders: handlers.orders
};

server.init = () => {
    server.httpServer.listen(config.httpPort, () => {
        console.log(`HTTP server is listening on port ${config.httpPort}`)
    });
    server.httpsServer.listen(config.httpsPort, () => {
        console.log(`HTTPS server is listening on port ${config.httpsPort}`);
    });

    handlers.init();
};

module.exports = server;