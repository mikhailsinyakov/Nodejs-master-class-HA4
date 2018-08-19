
const _data = require('./data');
const helpers = require('./helpers');

/*_data.create('users', 'example', {example: 'good'})
    .then(data => console.log(data))
    .catch(e => console.error(e));*/


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
            .then(dataObject => resolve({ statusCode: 200, body: dataObject }))
            .catch(e => {
                if (e == 'Specified user already exist' || 
                    e == 'Specified arguments are invalid') {
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
            .then(dataObject => resolve({ statusCode: 200, body: dataObject }))
            .catch(e => {
                resolve({ statusCode: 404, body: {Error: 'Specified user does not exist'} })
            });
    });
};

handlers._users.put = requestData => {

};

handlers._users.delete = requestData => {

};

handlers.notFound = requestData => {
    return Promise.resolve({ statusCode: 404 });
};

module.exports = handlers;