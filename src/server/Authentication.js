/**
 * File that contains the libraries and setup of the user authentication using Local strategies and the node package Passport.js.
 * Sourced from: https://blog.risingstack.com/node-hero-node-js-authentication-passport-js/
 * @module Authentication
 * */

const passport = require('passport');
const session = require('express-session');
let Strategy = require('passport-local').Strategy;

/**
 * Predefined user.
 * */
const PREDEFINED_USER = {
    username: 'test',
    passwordHash: 'test',
    id: 1
};

passport.use(new Strategy(
    function (username, password, done) {
        if (username === PREDEFINED_USER.username && password === PREDEFINED_USER.passwordHash) {
            return done(null, PREDEFINED_USER);
        } else {
            return done(null, false);
        }
    }
));


passport.serializeUser(function (user, cb) {
    return cb(null, PREDEFINED_USER.id);
});

passport.deserializeUser(function (id, cb) {
    return cb(null, PREDEFINED_USER);
});

/**
 * Session template to be stored
 * */
const sessionTemplate = session({
    secret: 'no secret',
    name: "projectAllocation",
    resave: false,
    proxy: false,
    saveUninitialized: false,
    cookie: {secure: true}
});

exports.initAuthentication = function (app) {
    app.use(sessionTemplate);
    app.use(passport.initialize());
    app.use(passport.session());
};

exports.passport = passport;

