/**
 * This file is responsible for handling all files related to loading modules.
 * All the files needed for these processes will be stored in the root resources folder of the application.
 * @author rarpda
 * @module Module
 **/

/* Libraries required. */
const fs = require('fs');

/**
 *  This class holds information for dissertations.
 *  @class Dissertation
 * */
class Dissertation {

    /**
     * Constructor for the module class.
     * @param{Object} jsonObject - The Json object to convert.
     * */
    constructor(jsonObject) {
        if (typeof jsonObject === "undefined") {
            throw new Error("jsonObject is not defined.")
        }
        this.code = jsonObject['code'];
        this.title = jsonObject['title'];
        this.external = jsonObject['external'];
        /*Check properties*/
        if ((Object.values(this)).includes(undefined)) {
            console.log(this);
            throw new Error("One of the parameters is undefined valid.")
        }
    }
}

/**
 * This class holds information for the module objects.
    @class Module
 * */
class Module {
    /**
     * Constructor for the module class.
     * @param{Object} jsonObject - The Json object to convert.
     * */
    constructor(jsonObject) {
        if (typeof jsonObject === "undefined") {
            throw new Error("jsonObject is not defined.")
        }
        "use strict";
        this.title = jsonObject['title'];
        this.code = jsonObject['code'];
        this.abbreviation = jsonObject['abbreviation'];
        this.dissertationOptions = jsonObject['dissertationOptions'];
        /*Check properties*/
        if ((Object.values(this)).includes(undefined)) {
            console.log(this);
            throw new Error("One of the parameters is undefined valid.")
        }
    }

}

/**
 *
 * This function loads the module information from the resources filepath.
 * @param {String} filepath The filepath from where to load.
 * @return {Array} Array of module objects.
 * */
exports.loadModuleInformation = function (filepath) {
    let outputArray = [];
    let rawData = fs.readFileSync(filepath);
    let modulesList = JSON.parse(rawData);
    for (let index = 0; index < modulesList.length; index++) {
        outputArray.push(new Module(modulesList[index]));
    }
    return outputArray;
};


/**
 *  This function loads the dissertation information from the resources filepath.
 * @param {String} filepath The filepath from where to load.
 * @return {Array} Array of dissertation objects.
 * */
exports.loadDissertationOptions = function (filepath) {
    let outputArray = [];
    let rawData = fs.readFileSync(filepath);
    let dissertationList = JSON.parse(rawData);
    for (let index = 0; index < dissertationList.length; index++) {
        outputArray.push(new Dissertation(dissertationList[index]));
    }
    return outputArray;
};


/**
 * This function creates an array of dissertation data from Json format data.
 * @param {Array} dataArray The array that contains the JSON data.
 * @return {Array} Array of module objects.
 * @throws {Error} when input it not an array or empty.
 * */
exports.loadModulesFromJsonData = function (dataArray) {
    if (Array.isArray(dataArray) && dataArray.length > 0) {
        let outputData = [];
        for (let index = 0; index < dataArray.length; index++) {
            outputData.push(new Module(dataArray[index]));
        }
        return outputData;
    } else {
        throw new Error("Input is not a array with data.");
    }
};


/**
 * This function creates an array of module data from Json format data.
 * @param {Array} dataArray The array that contains the JSON data.
 * @return {Array} Array of dissertation objects.
 * @throws {Error} when input it not an array or empty.
 * */
exports.loadDissertationsFromJsonData = function (dataArray) {
    if (Array.isArray(dataArray) && dataArray.length > 0) {
        let outputData = [];
        for (let index = 0; index < dataArray.length; index++) {
            outputData.push(new Dissertation(dataArray[index]));
        }
        return outputData;
    } else {
        throw new Error("Input is not a array with data.");
    }
};
