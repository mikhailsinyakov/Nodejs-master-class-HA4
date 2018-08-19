
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
    let { firstName, lastName, email, streetName, password } = requestData.payload;
    firstName = typeof firstName == 'string' && firstName.trim().length > 0 
                                                            ? firstName.trim() 
                                                            : null;
    lastName = typeof lastName == 'string' && lastName.trim().length > 0 
                                                            ? lastName.trim() 
                                                            : null;
    email = typeof email == 'string' && email.trim().length > 0 
                                                            ? email.trim() 
                                                            : null;
    streetName = typeof streetName == 'string' && streetName.trim().length > 0 
                                                            ? streetName.trim() 
                                                            : null;
    password = typeof password == 'string' && password.trim().length > 0 
                                                            ? password.trim() 
                                                            : null;

    if (!firstName || !lastName || !email || !streetName || !password) {
        return Promise.resolve({ statusCode: 400, body: {Error: 'Missing required field(s)'} });
    }

    const hashedPassword = helpers.createHash(password);
    const userObject = { firstName, lastName, email, streetName, hashedPassword };

    return new Promise((resolve, reject) => {
        _data.create('users', email, userObject)
            .then(dataObject => resolve({ statusCode: 200, body: dataObject }))
            .catch(e => resolve({ statusCode: 500, body: {Error: e.message} }));
    });
    

};

handlers._users.get = requestData => {

};

handlers._users.put = requestData => {

};

handlers._users.delete = requestData => {

};

handlers.notFound = requestData => {
    return Promise.resolve({ statusCode: 404 });
};

module.exports = handlers;