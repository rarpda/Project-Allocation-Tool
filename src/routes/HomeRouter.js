/**
 * This file is responsible for settign up the router for the homepage.
 * This handles adding new cohorts and listing the available ones on the database.
 * @module HomeRouter
 * */

/*eslint no-undef: "error"*/
/*eslint-env node*/
const express = require('express');
const homeRouter = express.Router();
const dataHandler = require("../DataHandler");
const path = require("path");


/*Check if student cohort document exists. If not create an empty document.*/
dataHandler.getAvailableCohorts().catch((error) => {
    console.log("Running bootup checks");
    if (error.error === "not_found") {
        console.log("Student cohort document not found");
        dataHandler.saveNewStudentCohorts([]).then(() => {
            console.log("Created student cohort document!");
        }).catch(error => console.error(error.message));
    }
});

/**
 * @function
 * @param request{Object} The request from the client.
 * @param response{Object} The response to send.
 * */
homeRouter.get("/", function (request, response) {
    /*Checking if request is pointing to directory.*/
    if (request.originalUrl.substr(-1) === '/' && request.originalUrl.length > 1) {
        /*Redirect to file otherwise*/
        console.log("redirect to", request.originalUrl.slice(0, request.originalUrl.length - 1));
        console.log(request.originalUrl.slice(0, request.originalUrl.length - 1));
        response.redirect(request.originalUrl.slice(0, request.originalUrl.length - 1));
    } else {
        /*Send html path*/
        response.sendFile(path.join(__dirname, "../views/HomeDashboard.html"));
    }
});

/**
 *  Handles fetching of all available student cohort.
 * @function
 * @param request{Object} The request from the client.
 * @param response{Object} The response to send.
 * @param response.body{Object} The JSON array of available cohorts.
 * */
homeRouter.get('/StudentCohorts', function (request, response) {
    /*Get available cohorts*/
    dataHandler.getAvailableCohorts().then(data => {
        return response.send(data);
    }).catch((error) => {
        console.error(error.message);
        return response.sendStatus(400);
    });
});

/**
 * Handles adding of student cohort.
 * @function
 * @param request{Object} The request from the client.
 * @param response{Object} The response to send.
 * @param request.body.cohortName{String} The name of the cohort to add.
 * @param request.body.cohortYear{number} The year of cohort to add.
 * */
homeRouter.post('/addCohort', function (request, response) {
    if (request.body.cohortName && request.body.cohortYear) {
        const name = request.body.cohortName;
        const year = request.body.cohortYear;
        /*Check if route exists*/
        return dataHandler.getAvailableCohorts().then(data => {
            let saveData = true;
            let newList;
            /*If data is empty just add the new cohort else check.*/
            if (data) {
                let cohortExists = Object.values(data).find((availableCohort) => {
                    return (name === availableCohort.cohortName && year === availableCohort.cohortYear);
                });
                if (cohortExists) {
                    /*Only save if list */
                    saveData = false;
                } else {
                    /*Create copy and Add new element to list to be saved.*/
                    newList = data.slice();
                    newList.push({cohortName: name, cohortYear: year});
                }
            } else {
                /*Add new cohort straight away.*/
                newList = [{cohortName: name, cohortYear: year}];
            }

            if (saveData) {
                dataHandler.saveNewStudentCohorts(newList)
                    .then(() => {
                        response.sendStatus(201);
                    })
                    .catch((error) => {
                        console.error(error.message);
                        response.sendStatus(500);
                    });
            } else {
                /*Send request is invalid*/
                response.sendStatus(400);
            }
        });
    } else {
        /*data parameters not valid*/
        response.sendStatus(400)
    }
});


module.exports = homeRouter;