/**
 * This file contains the router for all the login requests.
 * This controls user logging.
 * @module LoginRouter
 * */
/*eslint no-undef: "error"*/
/*eslint-env node*/
const express = require('express');
const loginRouter = express.Router();
const path = require("path");


/**
 * Function to create and export the login router.
 * @param passport{Object} The passport instance setup for authentication.
 * @return {Router} the router to be used by the server for login handling.
 * */
module.exports = function (passport) {
    /*Check if passport is set.*/
    if (!passport) {
        throw Error("Passport not setup!");
    }

    /**
     *  Sends LoginPage to user.
     * @function
     * @param request{Object} The request from the client.
     * @param response{Object} The response to send.
     * @param response.body{File} The page to send to the client.
     * */
    loginRouter.get("/", function (request, response) {
        response.sendFile(path.join(__dirname, "../views/LoginPage.html"));
    });


    /**
     * Handles authentication of user via passport.js
     * If login fails it redirects to login page otherwise it redirects the user to the homepage.
     * @function
     * @param request{Object} The request from the client.
     * @param response{Object} The response to send.
     * @param response.body{File} The page to send to the client.
     * */
    loginRouter.post('/',
        passport.authenticate('local', {failureRedirect: '/login'}),
        function (req, res) {
            res.redirect('/Homepage');
        }
    );

    return loginRouter;
};