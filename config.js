/**
 * File that contains configurations for 3 modes:
 * Development, Test and Production.
 * Inspired from: https://codingsans.com/blog/node-config-best-practices
 * */

const dotenv = require("dotenv");
const path = require("path");
const testPath = path.join(__dirname, "/.env");
const result = dotenv.config({path: testPath});
/*Check if result is correct.*/
if (result.error) {
    console.error(result.error);
    process.exit(2);
}

const environment = process.env.NODE_ENV || "production";
console.log("Current environment: ", environment);

const development = {
    app: {
        host: 'https://localhost',
        httpsPort: 9998,
        httpPort: 8080,
        loggerMode: 'dev',
    },
    db: {
        host: 'http://rarpda.host.cs.st-andrews.ac.uk',
        port: 21547,
        name:  process.env.DEVELOPMENT_DATABASE_NAME,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    }
};

const test = {
    app: {
        host: 'https://localhost',
        httpsPort: 9998,
        httpPort: 8080,
        loggerMode: 'tiny',
    },
    db: {
        host: 'http://rarpda.host.cs.st-andrews.ac.uk',
        port: 21547,
        name: process.env.TEST_DATABASE_NAME,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    }
};

const production = {
    app: {
        host: 'https://localhost',
        httpsPort: 9998,
        httpPort: 8080,
        loggerMode: 'tiny',
    },
    db: {
        host: 'http://rarpda.host.cs.st-andrews.ac.uk',
        port: 21547,
        name: process.env.PRODUCTION_DATABASE_NAME,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    }
};


const config = {
    development,
    test,
    production
};


module.exports = config[environment];