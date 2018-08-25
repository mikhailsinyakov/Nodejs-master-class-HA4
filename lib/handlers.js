
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

const handlers = {};

handlers.handleErrors = e => {
    if (e.message == 'Internal server error') {
        return { statusCode: 500, body: e.message };
    }
    if (e.message == 'Token does not exist or is invalid') {
        return { statusCode: 403, body: e.message };
    }
    return { statusCode: 400, body: e.message };
};

handlers.users = requestData => {
    const { method, path } = requestData;

    const pathLevels = helpers.getPathLevels(path);
    if (pathLevels[1]) {
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
    const userObject = { firstName, lastName, email, streetAddress, hashedPassword, cart: [] };
    const cartObject = { email, items: [] };

    return _data.create('users', email, userObject)
        .then(dataObject => {
            delete dataObject.hashedPassword;
            return Promise.all([_data.create('carts', email, cartObject), dataObject])
        }).then(([_, dataObject]) => {
            return { statusCode: 200, body: dataObject };
        })
        .catch(handlers.handleErrors);
    
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
                return { statusCode: 404, body: { Error: e.message } };
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
    if (pathLevels[1]) {
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
        }).catch(handlers.handleErrors);
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
    const { method, headers } = requestData;
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
    if (pathLevels[2]) {
        return handlers.notFound(requestData);
    }
    if (pathLevels[1]) {
        return handlers.cartItems(requestData, pathLevels[1]);
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
        updatedCart.sum = updatedCart.items.reduce((acc, val) => acc + (val.price * val.number), 0);
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

        updatedCart.sum = updatedCart.items.reduce((acc, val) => acc + (val.price * val.number), 0);
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
    const { method, headers: { token } } = requestData;

    const acceptedMethod = 'post';

    if (acceptedMethod != method) {
        return handlers.notFound(requestData);
    }

    return handlers._tokens.verifyToken(token)
        .then(token => _data.read('carts', token.email))
        .then(cart => {
            if (!cart.items.length) {
                throw Error('First add some items to your cart');
            }
            return Promise.all([helpers.createOrder(cart.email, cart.sum), cart]);
        }).then(([_, cart]) => {
            const orderId = helpers.createRandomString(20);
            const newOrder = { orderId, ...cart };
            return _data.create('orders', orderId, newOrder);
        }).then(order => _data.read('carts', order.email))
        .then(cart => {
            const updatedCart = { email: cart.email };
            updatedCart.items = [];
            updatedCart.sum = 0;
            return Promise.all([_data.update('carts', cart.email, updatedCart), cart.email]);
        }).then(([_, email]) => _data.read('users', email))
        .then(user => {
            const updatedUser = { ...user };
            updatedUser.cart = [];
            return _data.update('users', user.email, updatedUser);
        }).then(() => {
            return { statusCode: 200 };
        }).catch(handlers.handleErrors);


};

handlers.notFound = requestData => {
    return Promise.resolve({ statusCode: 404 });
};

handlers.init = () => {
    const deleteExpiredTokens = () => {
        handlers._tokens.deleteExpiredTokens()
            .catch(e => console.log('Could not delete all the expired tokens'));
    }
    deleteExpiredTokens();
    setInterval(deleteExpiredTokens, config.tokenExpiredTime);
}

module.exports = handlers;