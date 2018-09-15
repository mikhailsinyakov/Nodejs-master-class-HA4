
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

const handlers = {};



// Frontend handlers

handlers.favicon = requestData => {
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return Promise.resolve({ statusCode: 500 });
    }

    const { method } = requestData;
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    return helpers.getPublicFile('favicon.ico')
        .then(data => ({ statusCode: 200, body: data, contentType: 'favicon' }))
        .catch(e => {
            if (e.message == 'Internal server error') {
                return { statusCode: 500, body: { Error: e.message } };
            }
            if (e.message == 'Not found') {
                return { statusCode: 404, body: { Error: e.message } };
            }
        });
};

handlers.public = requestData => {
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return Promise.resolve({ statusCode: 500 });
    }

    const { method, path } = requestData;
    const pathLevels = helpers.getPathLevels(path);
    
    if (method != 'get' || pathLevels.length > 2) {
        return Promise.resolve({ statusCode: 405 });
    }
    
    const fileName = typeof pathLevels[1] == 'string' ? pathLevels[1] : null;
    
    if (!fileName) {
        return Promise.resolve({ statusCode: 404 });
    }

    const fileExtension = fileName.split('.')[1];
    let contentType = fileExtension;
    if (fileExtension == 'js') {
        contentType = 'javascript';
    }
    if (fileExtension == 'ico') {
        contentType = 'favicon';
    }

    return helpers.getPublicFile(fileName)
        .then(data => ({ statusCode: 200, body: data, contentType }))
        .catch(e => {
            if (e.message == 'Internal server error') {
                return { statusCode: 500, body: { Error: e.message } };
            }
            if (e.message == 'Not found') {
                return { statusCode: 404, body: { Error: e.message } };
            }
        });
};

handlers.notFoundPage = (requestData, currentProtocol) => {
    requestData = typeof requestData == 'object' ? requestData : null;
    if (!requestData || !requestData.method) {
        return handlers.serverErrorPage(requestData, currentProtocol);
    }

    const { method } = requestData;
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    const templateData = {
        'head.title': 'Not Found | Pizza-Delivery Company',
        'head.description': 'This page not found',
        'body.id': 'notFound'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('notFound'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return { statusCode: 404 };
            }
        });
};

handlers.serverErrorPage = (requestData, currentProtocol) => {
    requestData = typeof requestData == 'object' ? requestData : null;
    if (!requestData || !requestData.method) {
        return Promise.resolve({ statusCode: 500 });
    }

    const { method } = requestData;
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    const templateData = {
        'head.title': 'Server Error | Pizza-Delivery Company',
        'head.description': 'Server error',
        'body.id': 'serverError'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('serverError'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return { statusCode: 500 };
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return { statusCode: 500 };
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers.index = (requestData, currentProtocol) => {
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return handlers.serverErrorPage(requestData, currentProtocol);
    }

    const { method } = requestData;
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    const templateData = {
        'head.title': 'Home | Pizza-Delivery Company',
        'head.description': 'Login or signup to get the opportunity to order pizza',
        'body.id': 'index'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('index'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers.sessionCreate = (requestData, currentProtocol) => {
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return handlers.serverErrorPage(requestData, currentProtocol);
    }

    const { method } = requestData;
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    const templateData = {
        'head.title': 'Login | Pizza-Delivery Company',
        'head.description': 'Login to your account',
        'body.id': 'sessionCreate'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('sessionCreate'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers.account = (requestData, currentProtocol) => {
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return handlers.serverErrorPage(requestData, currentProtocol);
    }

    const { path, method } = requestData;
    const acceptedPaths = ['create', 'edit', 'deleted'];

    const pathLevels = helpers.getPathLevels(path);
    if (!pathLevels[1] || pathLevels[2] || !acceptedPaths.includes(pathLevels[1])) {
        return handlers.notFoundPage(requestData, currentProtocol);
    }
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    return handlers._account[pathLevels[1]](requestData, currentProtocol);
};

handlers._account = {};

handlers._account.create = (requestData, currentProtocol) => {
    const templateData = {
        'head.title': 'Signup | Pizza-Delivery Company',
        'head.description': 'Create an account',
        'body.id': 'accountCreate'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('accountCreate'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers._account.edit = (requestData, currentProtocol) => {
    const templateData = {
        'head.title': 'Edit account | Pizza-Delivery Company',
        'body.id': 'accountEdit'
    };
    
    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('accountEdit'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers._account.deleted = (requestData, currentProtocol) => {
    const templateData = {
        'head.title': 'Account deleted | Pizza-Delivery Company',
        'head.description': 'Your account has been deleted',
        'body.id': 'accountDeleted'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('accountDeleted'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers.session = (requestData, currentProtocol) => {
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return handlers.serverErrorPage(requestData, currentProtocol);
    }

    const { path, method } = requestData;
    const acceptedPaths = ['create', 'deleted'];

    const pathLevels = helpers.getPathLevels(path);
    if (!pathLevels[1] || pathLevels[2] || !acceptedPaths.includes(pathLevels[1])) {
        return handlers.notFoundPage(requestData, currentProtocol);
    }
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    return handlers._session[pathLevels[1]](requestData, currentProtocol);
};

handlers._session = {};

handlers._session.create = (requestData, currentProtocol) => {
    const templateData = {
        'head.title': 'Login | Pizza-Delivery Company',
        'head.description': 'Login to your account',
        'body.id': 'sessionCreate'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('sessionCreate'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers._session.deleted = (requestData, currentProtocol) => {
    const templateData = {
        'head.title': 'Logged out | Pizza-Delivery Company',
        'head.description': 'You have been logged out',
        'body.id': 'sessionDeleted'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('sessionDeleted'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers.menuPage = (requestData, currentProtocol) => {
    
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return handlers.serverErrorPage(requestData, currentProtocol);
    }

    const { method, path } = requestData;
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    const pathLevels = helpers.getPathLevels(path);
    if (pathLevels[1]) {
        return handlers.notFoundPage(requestData, currentProtocol);
    }

    const templateData = {
        'head.title': 'Menu | Pizza-Delivery Company',
        'body.id': 'menu'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('menu'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers.shoppingCart = (requestData, currentProtocol) => {
    
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return handlers.serverErrorPage(requestData, currentProtocol);
    }

    const { method, path } = requestData;
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    const pathLevels = helpers.getPathLevels(path);
    if (pathLevels[1]) {
        return handlers.notFoundPage(requestData, currentProtocol);
    }

    const templateData = {
        'head.title': 'Shopping Cart | Pizza-Delivery Company',
        'body.id': 'shoppingCart'
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('shoppingCart'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

handlers.orderPage = (requestData, currentProtocol) => {
    
    requestData = typeof requestData == 'object' ? requestData : null;

    if (!requestData || !requestData.method) {
        return handlers.serverErrorPage(requestData, currentProtocol);
    }

    const { method, path } = requestData;
    
    if (method != 'get') {
        return Promise.resolve({ statusCode: 405 });
    }

    const pathLevels = helpers.getPathLevels(path);
    if (pathLevels[1]) {
        return handlers.notFoundPage(requestData, currentProtocol);
    }

    const templateData = {
        'head.title': 'Make an order | Pizza-Delivery Company',
        'body.id': 'order',
        'stripePublishableKey': config.stripe.publishableKey
    };

    return Promise.all([helpers.getTemplate('_header'), 
                        helpers.getTemplate('order'), 
                        helpers.getTemplate('_footer')])
        .then(([header, body, footer]) => {
            const page = helpers.interpolate(header + body + footer, templateData, currentProtocol);
            if (!page) {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            return { statusCode: 200, body: page, contentType: 'html' }
        })
        .catch(e => {
            if (e.message == 'Internal server error') {
                return handlers.serverErrorPage(requestData, currentProtocol);
            }
            if (e.message == 'Not found') {
                return handlers.notFoundPage(requestData, currentProtocol);
            }
        });
};

// API handlers

handlers.handleErrors = e => {
    if (e.message == 'Internal server error') {
        return { statusCode: 500, body: {Error: e.message } };
    }
    if (e.message == 'Token does not exist or is invalid') {
        return { statusCode: 403, body: { Error: e.message } };
    }
    return { statusCode: 400, body: { Error: e.message } };
};

handlers.api = requestData => {
    const acceptedPaths = ['users', 'tokens', 'menu', 'carts', 'orders'];
    const { path } = requestData;
    const pathLevels = helpers.getPathLevels(path);
    const pathLevel2 = pathLevels[1];
    if (!pathLevel2 || !acceptedPaths.includes(pathLevel2)) {
        return handlers.notFound(requestData);
    }
    return handlers[pathLevel2](requestData);
};

handlers.users = requestData => {
    const { method, path } = requestData;

    const pathLevels = helpers.getPathLevels(path);
    if (pathLevels[2]) {
        return handlers.notFound(requestData);
    }

    const acceptedMethods = ['post', 'get', 'put', 'delete'];

    if (!acceptedMethods.includes(method)) {
        return Promise.resolve({ statusCode: 405 });
    }

    return handlers._users[method](requestData);
};

handlers._users = {};

// Required fields: firstName, lastName, email, streetName, password
// Optional fields: none
handlers._users.post = requestData => {
    
    let { firstName, lastName, email, streetAddress, password } = requestData.payload;
    firstName = typeof firstName == 'string' && firstName.trim().length > 0 
                                                            ? firstName.trim() 
                                                            : null;
    lastName = typeof lastName == 'string' && lastName.trim().length > 0 
                                                            ? lastName.trim() 
                                                            : null;
    email = typeof email == 'string' && email.trim().length > 0 
                                                            ? email.trim() 
                                                            : null;
    streetAddress = typeof streetAddress == 'string' && streetAddress.trim().length > 0 
                                                            ? streetAddress.trim() 
                                                            : null;
    password = typeof password == 'string' && password.trim().length > 0 
                                                            ? password.trim() 
                                                            : null;

    if (!firstName || !lastName || !email || !streetAddress || !password) {
        return Promise.resolve({ statusCode: 400, body: {Error: 'Missing required field(s)'} });
    }

    const hashedPassword = helpers.createHash(password);
    const signupTime = Date.now();
    const userObject = { firstName, lastName, email, streetAddress, hashedPassword, signupTime, cart: [] };
    const cartObject = { email, items: [] };

    return _data.create('users', email, userObject)
        .then(dataObject => {
            delete dataObject.hashedPassword;
            return Promise.all([_data.create('carts', email, cartObject), dataObject])
        }).then(([_, dataObject]) => {
            return { statusCode: 200, body: dataObject };
        })
        .catch(e => {
            if (e.message == 'Specified file already exist') {
                e.message = 'Specified user already exist';
            }
            return handlers.handleErrors(e);
        });
    
};

// Required field: email
// Optional fields: none
handlers._users.get = requestData => {
    let { queryStringObject: { email }, headers: { token } } = requestData;

    email = typeof email == 'string' && email.trim().length > 0 ? email : null;

    if (!email) {
        return Promise.resolve({ statusCode: 400, body: { Error: 'Missing required field(s)'} });
    }

    return _data.read('users', email)
        .then(dataObject => Promise.all([handlers._tokens.verifyToken(token, email), dataObject]))
        .then(([_, dataObject]) => {
            delete dataObject.hashedPassword;
            return { statusCode: 200, body: dataObject };
        }).catch(e => {
            if (e.message == 'Specified file does not exist') {
                return { statusCode: 404, body: { Error: 'Specified user does not exist' } };
            }
            return { statusCode: 403 };
        });
};

// Required field: email
// Optional fields: firstName, lastName, streetName, password (one must be specified)
handlers._users.put = requestData => {
    let { email, firstName, lastName, streetAddress, password } = requestData.payload;
    const { token } = requestData.headers;

    email = typeof email == 'string' && email.trim().length > 0 
                                                            ? email.trim() 
                                                            : null;

    if (!email) {
        return Promise.resolve({ statusCode: 400, body: { Error: 'Missing required field' } });
    }

    firstName = typeof firstName == 'string' && firstName.trim().length > 0 
                                                            ? firstName.trim() 
                                                            : null;
    lastName = typeof lastName == 'string' && lastName.trim().length > 0 
                                                            ? lastName.trim() 
                                                            : null;
    streetAddress = typeof streetAddress == 'string' && streetAddress.trim().length > 0 
                                                            ? streetAddress.trim() 
                                                            : null;
    password = typeof password == 'string' && password.trim().length > 0 
                                                            ? password.trim() 
                                                            : null;

    if (!firstName && !lastName && !streetAddress && !password) {
        return Promise.resolve({ statusCode: 400, body: { Error: 'Missing at least one of optional field' } });
    }

    const updateUserObject = userObject => {
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
        return userObject;
    };

    return _data.read('users', email)
        .then(userObject => Promise.all([handlers._tokens.verifyToken(token, email), userObject]))
        .then(([_, userObject]) => {
            userObject = updateUserObject(userObject);
            return _data.update('users', email, userObject);
        }).then(() => {
            return { statusCode: 200 };
        }).catch(handlers.handleErrors);
};

// Required field: email
// Optional fields: none
handlers._users.delete = requestData => {
    let { email } = requestData.queryStringObject;
    const { token } = requestData.headers;

    email = typeof email == 'string' && email.trim().length > 0 ? email : null;

    if (!email) {
        return Promise.resolve({ statusCode: 400, body: {Error: 'Missing required field'} });
    }

    return handlers._tokens.verifyToken(token, email)
        .then(() => _data.delete('users', email))
        .then(() => _data.delete('carts', email))
        .then(() => handlers._tokens.deleteTokensOfChosenUser(email))
        .then(() => {
            return { statusCode: 200 };
        }).catch(handlers.handleErrors);
};

handlers.tokens = requestData => {
    const { method, path } = requestData;

    const pathLevels = helpers.getPathLevels(path);
    if (pathLevels[2]) {
        return handlers.notFound(requestData);
    }

    const acceptedMethods = ['post', 'get', 'put', 'delete'];

    if (!acceptedMethods.includes(method)) {
        return Promise.resolve({ statusCode: 405 });
    }

    return handlers._tokens[method](requestData);
};

handlers._tokens = {};

// Required fields: email, password
// Optional field: none
handlers._tokens.post = requestData => {
    let { email, password } = requestData.payload;
    email = typeof email == 'string' && email.trim().length > 0  ? email.trim()  : null;
    password = typeof password == 'string' && password.trim().length > 0  ? password.trim() : null;

    if (!email || !password) {
        return Promise.resolve({ statusCode: 400, body: {Error: 'Missing required field(s)'} });
    }

    return _data.read('users', email)
        .then(userObject => {
            if (userObject.hashedPassword !== helpers.createHash(password)) {
                throw Error('Specified password did not matched');
            }
            const tokenId = helpers.createRandomString(20);
            const expires = Date.now() + config.tokenExpiredTime;
            const tokenObject = { tokenId, email, expires };
            return _data.create('tokens', tokenId, tokenObject);
        }).then(tokenObject => {
            return { statusCode: 200, body: tokenObject };
        }).catch(e => {
            if (e.message == 'Specified file does not exist') {
                e.message = 'Specified user does not exist';
            }
            return handlers.handleErrors(e);
        });
};

// Required field: id
// Optional field: none
handlers._tokens.get = requestData => {
    let { id } = requestData.queryStringObject;
    id = typeof id == 'string' && id.trim().length > 0 ? id : null;
    if (!id) {
        return Promise.resolve( { statusCode: 400, body: {Error: 'Missing required field'} } );
    }

    return _data.read('tokens', id)
        .then(tokenObject => Promise.all([_data.read('users', tokenObject.email), tokenObject]))
        .then(([_, tokenObject]) => {
            return { statusCode: 200, body: tokenObject };
        }).catch(e => {
            if (e.message == 'Internal server error') {
                return { statusCode: 500, body: { Error: e.message } };
            }
            return { statusCode: 404 };
        });
};

// Required field: id
// Optional field: none
handlers._tokens.put = requestData => {
    let { id } = requestData.payload;
    id = typeof id == 'string' && id.trim().length > 0 ? id : null;
    if (!id) {
        return Promise.resolve( { statusCode: 400, body: {Error: 'Missing required field'} } );
    }

    return _data.read('tokens', id)
        .then(tokenObject => Promise.all([_data.read('users', tokenObject.email), tokenObject]))
        .then(([_, tokenObject]) => {
            if (tokenObject.expires < Date.now()) {
                throw Error('This token has already expired');
            }
            tokenObject.expires = Date.now() + 1000 * 60 * 60; 
            return _data.update('tokens', id, tokenObject);
        }).then(() => {
            return { statusCode: 200 };
        }).catch(handlers.handleErrors);
};

// Required field: id
// Optional field: none
handlers._tokens.delete = requestData => {
    let { id } = requestData.queryStringObject;
    id = typeof id == 'string' && id.trim().length > 0 ? id : null;
    if (!id) {
        return Promise.resolve( { statusCode: 400, body: {Error: 'Missing required field'} } );
    }

    return _data.read('tokens', id)
        .then(() => _data.delete('tokens', id))
        .then(() => {
            return { statusCode: 200 };
        }).catch(handlers.handleErrors);
};

handlers._tokens.verifyToken = (id, email) => {

    return _data.read('tokens', id)
        .then(token => {
            if ((email && token.email != email) || token.expires < Date.now()) {
                throw Error('Token does not exist or is invalid');
            }
            return token;
        }).catch(e => {
            throw Error('Token does not exist or is invalid');
        });
};

handlers._tokens.deleteTokensOfChosenUser = email => {

    return _data.list('tokens')
        .then(files => Promise.all(files.map(fileName => _data.read('tokens', fileName))))
        .then(tokenList => {
            const userTokens = tokenList.filter(token => token.email == email);
            const userTokensPromises = userTokens.map(token => _data.delete('tokens', token.tokenId));
            return Promise.all(userTokensPromises);
        });

};

handlers._tokens.deleteExpiredTokens = () => {

    return _data.list('tokens')
        .then(files => Promise.all(files.map(fileName => _data.read('tokens', fileName))))
        .then(tokenList => {
            const expiredTokens = tokenList.filter(token => token.expires < Date.now());
            return Promise.all(expiredTokens.map(token => _data.delete('tokens', token.tokenId)));
        });
};

// Required fields: none
// Optional fields: none
handlers.menu = requestData => {
    const { method, path, headers } = requestData;

    const pathLevels = helpers.getPathLevels(path);
    if (pathLevels[2]) {
        return handlers.notFound(requestData);
    }

    let { token } = headers;
    const acceptedMethod = 'get';

    if (acceptedMethod != method) {
        return Promise.resolve({ statusCode: 405 });
    }

    token = typeof token == 'string' && token.length > 0 ? token : null;

    if (!token) {
        return Promise.resolve({ statusCode: 403 });
    }

    return handlers._tokens.verifyToken(token)
        .then(() => _data.list('menu'))
        .then(ids => Promise.all(ids.map(id => _data.read('menu', id))))
        .then(items => {
            return { statusCode: 200, body: items };
        }).catch(handlers.handleErrors);
};

// Required fields: none
// Optional fields: none
handlers.carts = requestData => {
    const { method, path } = requestData;

    const pathLevels = helpers.getPathLevels(path);
    if (pathLevels[3]) {
        return handlers.notFound(requestData);
    }
    if (pathLevels[2]) {
        return handlers.cartItems(requestData, pathLevels[2]);
    }

    const acceptedMethod = 'get';

    if (acceptedMethod != method) {
        return Promise.resolve({ statusCode: 405 });
    }

    const { token } = requestData.headers;
    return handlers._tokens.verifyToken(token)
        .then(tokenData => _data.read('carts', tokenData.email))
        .then(carts => {
            return { statusCode: 200, body: carts };
        }).catch(e => {
            return { statusCode: 403, body: { Error: e.message }};
        });

};

handlers.cartItems = (requestData, menuItemId) => {
    const { method } = requestData;

    const acceptedMethods = ['post', 'delete'];
    if (!acceptedMethods.includes(method)) {
        return Promise.resolve({ statusCode: 405 });
    }
    return handlers._cartItems[method](requestData, menuItemId);
};

handlers._cartItems = {};

// Required field: id
// Optional fields: none
handlers._cartItems.post = (requestData, menuItemId) => {
    const { headers: { token } } = requestData;

    const changeCartObject = (cart, menuItem) => {
        const updatedCart = { email: cart.email };
        const isItemExist = !!cart.items.filter(item => item.id == menuItemId).length;

        if (isItemExist) {
            updatedCart.items = cart.items.map(item => {
                if (item.id == menuItemId) {
                    return { ...item, number: item.number + 1 };
                }
                return item;
            });
        } else {
            updatedCart.items = cart.items;
            updatedCart.items.push({ ...menuItem, number: 1 });
        }
        const sum = updatedCart.items.reduce((acc, val) => acc + (val.price * val.number), 0);
        updatedCart.sum = Math.round(sum * 100) / 100;
        return updatedCart;
    };

    const changeUserObject = userObject => {
        const updatedUserObject = { ...userObject };
        updatedUserObject.cart.push(menuItemId);
        return updatedUserObject;
    };

    return handlers._tokens.verifyToken(token)
        .then(tokenData => Promise.all([_data.read('menu', menuItemId), tokenData.email]))
        .then(([menuItem, email]) => Promise.all([_data.read('carts', email), email, menuItem]))
        .then(([cart, email, menuItem]) => {
            const updatedCart = changeCartObject(cart, menuItem);
            return Promise.all([_data.update('carts', email, updatedCart), email]);
        }).then(([_, email]) => _data.read('users', email))
        .then(userObject => {
            const updatedUserObject = changeUserObject(userObject);
            return _data.update('users', updatedUserObject.email, updatedUserObject);
        }).then(() => {
            return { statusCode: 200 };
        }).catch(handlers.handleErrors);

};

// Required field: id
// Optional fields: none
handlers._cartItems.delete = (requestData, menuItemId) => {
    const { headers: { token } } = requestData;

    const changeCartObject = cart => {
        const updatedCart = { email: cart.email };
        const isItemExist = !!cart.items.filter(item => item.id == menuItemId).length;

        if (isItemExist) {
            updatedCart.items = cart.items.map(item => {
                if (item.id == menuItemId) {
                    return { ...item, number: item.number - 1 };
                }
                return item;
            }).filter(item => item.number);
        } else {
            return null;
        }
        const sum = updatedCart.items.reduce((acc, val) => acc + (val.price * val.number), 0);
        updatedCart.sum = Math.round(sum * 100) / 100;
        return updatedCart;
    };

    const changeUserObject = userObject => {
        const updatedUserObject = { ...userObject };
        const indexToDelete = updatedUserObject.cart.indexOf(menuItemId);
        const deletedItems = updatedUserObject.cart.splice(indexToDelete, 1);
        if (!deletedItems.length) {
            return null;
        }
        return updatedUserObject;
    };

    return handlers._tokens.verifyToken(token)
        .then(tokenData => Promise.all([_data.read('carts', tokenData.email), tokenData.email]))
        .then(([cart, email]) => {
            const updatedCart = changeCartObject(cart);
            if (!updatedCart) {
                return Promise.reject(Error('Specified menu item does not exist'));
            }
            return Promise.all([_data.update('carts', email, updatedCart), email]);
        }).then(([_, email]) => _data.read('users', email))
        .then(userObject => {
            const updatedUserObject = changeUserObject(userObject);
            if (!updatedUserObject) {
                return Promise.reject(Error('Specified menu item does not exist'));
            }
            return _data.update('users', updatedUserObject.email, updatedUserObject);
        }).then(() => {
            return { statusCode: 200 };
        }).catch(handlers.handleErrors);
};


handlers.orders = requestData => {
    const { method, path, headers: { token }, payload } = requestData;
    const pathLevels = helpers.getPathLevels(path);
    
    if (pathLevels[2]) {
        return handlers.notFound(requestData);
    }

    const acceptedMethod = 'post';

    if (acceptedMethod != method) {
        return handlers.notFound(requestData);
    }

    const stripeToken = typeof payload.stripeToken == 'string' && payload.stripeToken.length > 0 ? payload.stripeToken : null;
    
    if (!stripeToken) {
        return { statusCode: 500 };
    }

    return handlers._tokens.verifyToken(token)
        .then(token => _data.read('carts', token.email))
        .then(cart => {
            if (!cart.items.length) {
                throw Error('First add some items to your cart');
            }
            return Promise.all([helpers.createOrder(cart.email, cart.sum, stripeToken), cart]);
        }).then(([_, cart]) => Promise.all([_data.read('users', cart.email), cart]))
        .then(([user, cart]) => {
            const orderId = helpers.createRandomString(20);
            const receiptTime = Date.now();
            const newOrder = { orderId, receiptTime, ...cart };
            delete newOrder.email;
            newOrder.user = {
                firstName: user.firstName,
                lastName: user.lastName,
                streetAddress: user.streetAddress,
                email: user.email
            };
            return Promise.all([_data.create('orders', orderId, newOrder), user]);
        }).then(([order, user]) => {
            const updatedUser = { ...user };
            updatedUser.cart = [];
            return Promise.all([_data.update('users', user.email, updatedUser), order]);
        }).then(([_, order]) => Promise.all([_data.read('carts', order.user.email), order]))
        .then(([cart, order]) => {
            const updatedCart = { email: cart.email };
            updatedCart.items = [];
            updatedCart.sum = 0;
            return Promise.all([_data.update('carts', cart.email, updatedCart), order]);
        }).then(([_, order]) => helpers.sendMailgunEmail(order))
        .then(() => {
            return { statusCode: 200 };
        }).catch(handlers.handleErrors);


};

handlers.notFound = requestData => {
    return Promise.resolve({ statusCode: 404 });
};

handlers.init = () => {
    const deleteExpiredTokens = () => {
        handlers._tokens.deleteExpiredTokens()
            .catch(e => console.log('\x1b[31m%s\x1b[0m', 'Could not delete all the expired tokens'));
    }
    deleteExpiredTokens();
    setInterval(deleteExpiredTokens, config.tokenExpiredTime);
}

module.exports = handlers;