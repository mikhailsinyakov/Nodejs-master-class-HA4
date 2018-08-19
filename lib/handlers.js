
const _data = require('./data');
const helpers = require('./helpers');

const handlers = {};

handlers.users = requestData => {
    const { method } = requestData;
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
    const userObject = { firstName, lastName, email, streetAddress, hashedPassword };

    return new Promise((resolve, reject) => {
        _data.create('users', email, userObject)
            .then(dataObject => {
                delete dataObject.hashedPassword;
                resolve({ statusCode: 200, body: dataObject })
            })
            .catch(e => {
                if (e == 'Specified user already exist') {
                    resolve({ statusCode: 400, body: {Error: e} });
                    return;
                }
                resolve({ statusCode: 500, body: {Error: e} })
            });
    });
    

};

// Required field: email
// Optional fields: none
// @TODO Let users to get their information only if their request headers contains token
handlers._users.get = requestData => {
    let { email } = requestData.queryStringObject;
    email = typeof email == 'string' && email.trim().length > 0 ? email : null;

    if (!email) {
        return Promise.resolve({ statusCode: 400, body: {Error: 'Missing required field'} });
    }

    return new Promise((resolve, reject) => {
        _data.read('users', email)
            .then(dataObject => {
                delete dataObject.hashedPassword;
                resolve({ statusCode: 200, body: dataObject })
            })
            .catch(e => {
                resolve({ statusCode: 404, body: { Error: 'Specified user does not exist' } })
            });
    });
};

// Required field: email
// Optional fields: firstName, lastName, streetName, password (one must be specified)
// @TODO Let users to update their information only if their request headers contains token
handlers._users.put = requestData => {
    let { email, firstName, lastName, streetAddress, password } = requestData.payload;
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

    return new Promise((resolve, reject) => {
        _data.read('users', email)
            .then(userObject => {
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
                return _data.update('users', email, userObject);
            }, e => resolve({ statusCode: 400, body: { Error: 'Specified user does not exist' }}))
            .then(() => resolve({ statusCode: 200 }),
                e => {
                if (e == 'Specified user does not exist') {
                    resolve({ statusCode: 400, body: { Error: e }});
                    return;
                }
                resolve({ statusCode: 500, body: { Error: 'Could not update the user object' }})
            });
    });
};

// Required field: email
// Optional fields: none
// @TODO Let users to delete their object only if their request headers contains token
handlers._users.delete = requestData => {
    let { email } = requestData.queryStringObject;
    email = typeof email == 'string' && email.trim().length > 0 ? email : null;

    if (!email) {
        return Promise.resolve({ statusCode: 400, body: {Error: 'Missing required field'} });
    }

    return new Promise((resolve, reject) => {
        _data.delete('users', email)
            .then(() => resolve({ statusCode: 200 }))
            .catch(e => resolve({ statusCode: 400, body: { Error: e } }));
    });

};

handlers.tokens = requestData => {
    const { method } = requestData;
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


    return new Promise((resolve, reject) => {
        _data.read('users', email)
            .then(userObject => {
                if (userObject.hashedPassword !== helpers.createHash(password)) {
                    resolve({ statusCode: 400, body: {Error: 'Specified password did not matched'}});
                    return;
                }
                const tokenId = helpers.createRandomString(20);
                const expires = Date.now() + 1000 * 60 * 60;
                const tokenObject = { tokenId, email, expires };
                return _data.create('tokens', tokenId, tokenObject);
            }, e => resolve({ statusCode: 400, body: {Error: 'Specified email does not belong to any user'}}))
            .then(tokenObject => resolve({ statusCode: 200, body: tokenObject }),
                e => resolve({ statusCode: 500, body: {Error: 'Could not create a token object'}}));
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

    let tokenObject = null;
    return new Promise((resolve, reject) => {
        _data.read('tokens', id)
            .then(_tokenObject => {
                tokenObject = _tokenObject;
                return _data.read('users', tokenObject.email)
            },  e => resolve({ statusCode: 400, body: {Error: 'Specified token does not exist'} }))
            .then(() => resolve({ statusCode: 200, body: tokenObject }),
                e => resolve({ statusCode: 400, body: {Error: 'User related with the token does not exist'} }));
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

    let tokenObject = null;
    return new Promise((resolve, reject) => {
        _data.read('tokens', id)
            .then(_tokenObject => {
                tokenObject = _tokenObject;
                return _data.read('users', tokenObject.email)
            },  e => resolve({ statusCode: 400, body: {Error: 'Specified token does not exist'} }))
            .then(() => {
                if (tokenObject.expires < Date.now()) {
                    resolve({ statusCode: 400, body: {Error: 'This token has already expired'} });
                    return;
                }
                tokenObject.expires = Date.now() + 1000 * 60 * 60; 
                return _data.update('tokens', id, tokenObject);
            }, e => resolve({ statusCode: 400, body: {Error: 'User related with the token does not exist'} }))
            .then(() => resolve({ statusCode: 200 }),
                e => resolve({ statusCode: 500, body: {Error: 'Could not update the token object'} }));
             
    });
};

// Required field: id
// Optional field: none
handlers._tokens.delete = requestData => {
    let { id } = requestData.queryStringObject;
    id = typeof id == 'string' && id.trim().length > 0 ? id : null;
    if (!id) {
        return Promise.resolve( { statusCode: 400, body: {Error: 'Missing required field'} } );
    }

    return new Promise((resolve, reject) => {
        _data.read('tokens', id)
            .then(() => _data.delete('tokens', id),
                e => resolve({ statusCode: 400, body: {Error: 'Specified token does not exist'} }))
            .then(() => resolve({ statusCode: 200 }),
                e => resolve({ statusCode: 500, body: {Error: 'Could not delete the token object'} }));
    });

};

handlers.notFound = requestData => {
    return Promise.resolve({ statusCode: 404 });
};

module.exports = handlers;