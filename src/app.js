/**
 * Server Side JavaScript with RESTful api handlers and middleware functions to get and post data between the client and server.
 *
 * The Week 9 complete app example by Dr Kasim Terzić proved a great base into understanding how to implement the server side
 *
 * Favicon item sourced from: https://www.favicon-generator.org/
 *
 * @author tmep
 * @date August 8th 2018
 * @module app
 */
/*eslint no-undef: "error"*/
/*eslint-env node*/

/*Import libraries.*/
const config = require('../config');
const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const https = require("https");
const http = require("http");


let app = express();
/*Only use logger in development and production*/
if (process.env.NODE_ENV !== "test") {
    app.use(logger(config.app.loggerMode));
}
app.use(express.json());
app.use(require('body-parser').urlencoded({extended: true}));

/*Authentication*/
const authentication = require("./server/Authentication");
authentication.initAuthentication(app);

/*Login router*/
let LoginRouter = require("./routes/LoginRouter")(authentication.passport);
app.use('/login', LoginRouter);


app.all('*', function (request, response, next) {
    if (request.secure) {
        /*Check if user session was created*/
        if (!request.user) {
            response.redirect('/login');
        } else {
            return next();
        }
    } else {
        console.log('req start: ', request.secure, request.hostname, request.url, config.app.httpPort);
        console.log("redirecting");
        response.redirect('https://' + request.hostname + ':' + config.app.httpsPort + request.url);
    }
});


/*Homepage Router*/
let homepageRouter = require("./routes/HomeRouter");
app.use('/Homepage', homepageRouter);

app.get('/', function (request, response) {
    if (request.isAuthenticated()) {
        response.redirect('/Homepage');
    } else {
        response.redirect('/login');
    }
});
app.use('/', express.static('src/public'));
let projectAllocationRouter = require("./routes/ProjectDataRouter");
app.use("/Allocation", projectAllocationRouter);


/*Error pages*/
/*404*/
app.use(function (request, response, next) {
    next(createError(404));
});

/* Sourced from: https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener*/
/*Get key and certificate.*/
const options = {
    key: fs.readFileSync('src/server/encryption/server.key'),
    cert: fs.readFileSync('src/server/encryption/server.cert')
};

/*Setup HTTP and HTTPS server.*/
http.createServer({}, app).listen(config.app.httpPort, () => {
    console.log("Listening HTTP on port " + config.app.httpPort);

});
https.createServer(options, app).listen(config.app.httpsPort, () => {
    console.log("Listening HTTPS on port " + config.app.httpsPort);
    console.log("Click on ", config.app.host + ":" + config.app.httpsPort, " to start.");
});


module.exports = app;

