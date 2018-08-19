
const config = {};

config.staging = {
    httpPort: 300,
    httpsPort: 400,
    envName: 'staging'
};

config.production = {
    httpPort: 305,
    httpsPort: 405,
    envName: 'production'
};

const env = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV : '';
const envToExport = typeof config[env] == 'object' ? config[env] : config.staging;

module.exports = envToExport;