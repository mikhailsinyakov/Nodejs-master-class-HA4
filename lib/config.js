
const config = {};

config.staging = {
    httpPort: 300,
    httpsPort: 400,
    tokenExpiredTime: 1000 * 60 * 60,
    envName: 'staging'
};

config.production = {
    httpPort: 305,
    httpsPort: 405,
    tokenExpiredTime: 1000 * 60 * 60,
    envName: 'production'
};

const env = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV : '';
const envToExport = typeof config[env] == 'object' ? config[env] : config.staging;

module.exports = envToExport;