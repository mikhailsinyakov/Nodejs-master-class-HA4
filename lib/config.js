
const config = {};

config.staging = {
    httpPort: 300,
    httpsPort: 400,
    tokenExpiredTime: 1000 * 60 * 60,
    stripe: {
        publishableKey: 'pk_test_EMePRd7GbbNK5DWUq1oSCp3O',
        secretKey: process.env.STRIPE_SECRET_KEY
    },
    envName: 'staging'
};

config.production = {
    httpPort: 305,
    httpsPort: 405,
    tokenExpiredTime: 1000 * 60 * 60,
    stripe: {
        publishableKey: '',
        secretKey: ''
    },
    envName: 'production'
};

const env = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV : '';
const envToExport = typeof config[env] == 'object' ? config[env] : config.staging;

module.exports = envToExport;