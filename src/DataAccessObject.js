/**
 * File contains the methods required to communicate with the database.
 * Contains methods for saving data and getting data.
 * @module DataAccessObject
 * */
/*eslint no-undef: "error"*/
/*eslint-env node*/
const config = require("../config");
const {db: {host, port, name, username, password}} = config;

const cradle = require("cradle");
let databaseController;

const databaseEndpoint = host + ":" + port;
databaseController = new (cradle.Connection)
(databaseEndpoint, {
    auth: {
        username: username,
        password: password
    }
}).database(name);
console.log("Database used ", databaseEndpoint, " Name: ", name);
/**
 * Function to check if the database connection is setup.
 * @param callback The done function that is called once the database is setup.
 * @throws Error in case the database is not running or not found.
 * */
const connectionSetup = function (callback) {
    /*Create connection*/
    databaseController.exists((error, exists) => {
        if (error) {
            throw new Error("Database not connected!");
        } else if (exists) {
            console.log("Database: running");
            callback();
        } else {
            throw new Error("Database not found!");
        }
    });
};

/*Run connection check*/
connectionSetup(() => {
    console.log("Finished check.")
});


/**
 * Function to get data from the database by cohort type.
 * @param documentName The name of the document to search for.
 * @return Promise<Any> the promise that will return the data or the error.
 * */
exports.getData = function (documentName) {
    return new Promise((resolve, reject) => {
        databaseController.get(documentName, function (error, doc) {
            if (error) {
                reject(error);
            } else {
                try {
                    //TODO resolve this.
                    resolve(doc.projectAllocation);
                } catch (error) {
                    console.log(error.message);
                    reject(error);
                }
            }
        });
    });
};


/**
 * Function to save data to the database by cohort type.
 * @param documentName The name of the document to search for.
 * @param data The data to store.
 * @return Promise<Any> the promise that will return the status or the error.
 * */
exports.saveData = function (documentName, data) {
    return new Promise((resolve, reject) => {
        //TODO resolve this.
        databaseController.save(documentName, {projectAllocation: data}, function (error, response) {
            if (error) {
                console.log(error.message);
                reject(error);
            } else {
                resolve(response.ok);
            }
        });
    });
};


exports.connectionSetup = connectionSetup;
if (process.env.NODE_ENV === "test") {
    exports.databaseController = databaseController;
}
