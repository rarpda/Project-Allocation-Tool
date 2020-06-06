/**
 * This is responsible for implementing the router for project allocation handling.
 * @module ProjectDataRouter
 * */
/*eslint no-undef: "error"*/
/*eslint-env node*/
const express = require('express');
const path = require("path");
const dataHandler = require("../DataHandler");
const multer = require('multer');
let projectRouter = express.Router();
const fs = require("fs");


/*Setup the upload folder for multer upload middleware*/
const upload = multer({
    dest: 'uploads/',
});


/**
 * @function
 * This functions is responsible for handling sending the project allocation html page to the client.
 * If the user attempts to access the file instead of the directory, they get redirected to the directory.
 * @param request.params.cohortName{String} The name of the cohort desired.
 * @param request.params.cohortYear{number} The year of the cohort desired.
 * @return request.body{File} The html page for the project allocation.
 **/
projectRouter.get('/:cohortYear/:cohortName', (request, response) => {
    /*Checks it the user is attempting to access the file as opposed to the directory.*/
    if (request.path.substr(-1) !== '/' && request.path.length > 1) {
        console.log("redirect to", request.originalUrl + "/");
        /*Redirect to directory.*/
        response.redirect(request.originalUrl + "/");
    } else {
        const name = request.params.cohortName;
        const year = request.params.cohortYear;
        /*Check if cohort requested is available.*/
        dataHandler.getAvailableCohorts().then(data => {
            const cohortExists = Object.values(data).find((availableCohort) => {
                return (name === availableCohort.cohortName && year === availableCohort.cohortYear);
            });
            if (cohortExists) {
                /*Send file*/
                response.sendFile(path.join(__dirname, "../views/AllocationPage.html"));
            } else {
                /*Send error message.*/
                response.sendStatus(404);
            }
        }).catch((error) => {
            console.error(error.message);
            response.sendStatus(500);
        });
    }
});

/**
 * @function
 * This function is responsible for handling requests for data to be exported.
 * The data can be exported into 5 types: Saved progress (JSON), MMS Group data(ZIP-CSV), MMS Supervisor Data(ZIP-CSV),
 * PDF and tabledata (CSV).
 * @param request.params.cohortName{String} The name of the cohort desired.
 * @param request.params.cohortYear{number} The year of the cohort desired.
 * @param request.query.filename{String} The file requested.
 * @return response.body{File} The file to be exported.
 **/
projectRouter.get("/:cohortYear/:cohortName/dataExport", (request, response) => {
    /*Document name. (<Year>-<CohortName>-<DataType>*/
    let documentName = request.params.cohortYear + "-" + request.params.cohortName;
    dataHandler.dataExport(request.query.filename, documentName).then((exportFilepath) => {
        /*Send file*/
        response.download(exportFilepath);
        /*Clear temp files folder.*/
        require("../server/CsvGenerator").emptyFolder('dataStorage/tmp/files');
    }).catch((error) => {
        console.error(error.message);
        response.sendStatus(400);
    });
});


/**
 * @function
 * This function is responsible for sending the data for a particular cohort.
 * This could be staff data, project allocation data or module and dissertation info.
 * @param request.params.cohortName{String} The name of the cohort desired.
 * @param request.params.cohortYear{number} The year of the cohort desired.
 * @param request.query.dataType{String} The type of data required.
 * @return response.body{JSON} The Array of JSON data to be sent to the client.
 **/
projectRouter.get("/:cohortYear/:cohortName/dataDownload", (request, response) => {
    /*Document name. (<Year>-<CohortName>-<DataType>*/
    let documentName = request.params.cohortYear + "-" + request.params.cohortName;
    dataHandler.dataFetch(request.query.dataType, documentName).then(dataExport => {
        /*Send data in JSON format*/
        response.send(dataExport);
    }).catch((error) => {
        console.error(error.message);
        response.sendStatus(400);
    });
});


/**
 * @function
 * This function is responsible for handling the upload of data.
 * It uses multer as the middleware for handling file uploads and places them on a temporary upload directory.
 * The data will be processed and afterwards the file will deleted.
 * Accepts multiform data.
 * @param request.params.cohortName{String} The name of the cohort desired.
 * @param request.params.cohortYear{number} The year of the cohort desired.
 * @param request.file{File} The file to be uploaded and processed.
 * @param request.body.dataType{String} The type of data being uploaded.
 * @return response Status code, 400 if not valid valid, otherwise 201 if okay.
 **/
projectRouter.post("/:cohortYear/:cohortName/dataUpload", upload.single('fileToUpload'), (request, response) => {
    /*Document name. (<Year>-<CohortName>-<DataType>*/
    let documentName = request.params.cohortYear + "-" + request.params.cohortName;
    /*Process and store data.*/
    dataHandler.dataUpload(request.body.dataType, documentName, request.file.path).then(() => {
        response.sendStatus(201);
    }).catch((error) => {
        console.error(error.message);
        response.sendStatus(400);
    });
});


/**
 * @function
 * This function is responsible for handling the saving of data by application.
 * It supports the save of project allocation and staff type data.
 * @param request.params.cohortName{String} The name of the cohort desired.
 * @param request.params.cohortYear{number} The year of the cohort desired.
 * @param request.savedData{JSON} The array of json data to be saved.
 * @param request.body.dataType{String} The type of data being saved (either staff or project allocation).
 * @return response Status code, 400 if not valid valid, otherwise 200 if okay.
 **/
projectRouter.post("/:cohortYear/:cohortName/dataSave", upload.none(), (request, response) => {
    /*Document name. (<Year>-<CohortName>-<DataType>*/
    let documentName = request.params.cohortYear + "-" + request.params.cohortName;
    /*Process and send data.*/
    dataHandler.dataSave(request.body.dataType, documentName, request.body.savedData)
        .then(() => {
            response.sendStatus(200)
        })
        .catch((error) => {
            console.error(error.message);
            response.sendStatus(400);
        });
});


/**
 * @function
 * This function is responsible for handling the reupload of data.
 * It uses multer as the middleware for handling file uploads and places them on a temporary upload directory.
 * The data will be processed and afterwards the file will deleted.
 * Accepts multiform data.
 * @param request.params.cohortName{String} The name of the cohort desired.
 * @param request.params.cohortYear{number} The year of the cohort desired.
 * @param request.fileToUpload{File} The file to be uploaded and processed.
 * @param request.body.dataType{String} The type of data being uploaded.
 * @return response Status code, 400 if not valid valid, otherwise 200 if okay.
 **/
projectRouter.post("/:cohortYear/:cohortName/dataReupload", upload.single('fileToUpload'), (request, response) => {
    /*Document name. (<Year>-<CohortName>-<DataType>*/
    let documentName = request.params.cohortYear + "-" + request.params.cohortName;
    /*Process data reupload and save data.*/
    dataHandler.dataReupload(request.body.dataType, documentName, request.file.path)
        .then(() => {
            response.sendStatus(200);
        })
        .catch((error) => {
            console.error(error.message);
            response.sendStatus(400);
        }).finally(() => {
        if ((process.env.NODE_ENV !== 'test') && fs.existsSync(request.file.path)) {
            /*Delete temporary file*/
            fs.unlink(request.file.path, (error => {
                if (error) {
                    console.error(error.message);
                    console.error("Failed to clear temporary files! Check file: ", request.file.path);
                }
            }));
        }
    });
});


module.exports = projectRouter;













