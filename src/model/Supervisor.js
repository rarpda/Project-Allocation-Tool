/**
 * This file holds the class of the supervisor and is part of the data model.
 * @module Supervisor
 * */

/* Library imports.*/
const UniversityMember = require("./UniversityMember");
const csv = require('fast-csv');
const fs = require('fs');

/**
 * This class models the supervisor object for this application,
 * It extends the parent class UniversityMember.
 * @class Supervisor
 * @extends UniversityMember
 * */
class Supervisor extends UniversityMember {
    /**
     * Constructor for the supervisor class.
     * @param jsonObject The json formatted data for creating a supervisor instance.
     * */
    constructor(jsonObject) {
        if (typeof jsonObject === "undefined") {
            throw new Error("jsonObject is not defined.")
        }
        super(jsonObject['Engagement no'], jsonObject['Staff ID'], jsonObject['Username'], jsonObject['Title'], jsonObject['Given names'], jsonObject['Family name'], jsonObject['Email']);
        if (jsonObject['notes']) {
            this.notes = jsonObject['notes'];
        } else {
            this.notes = "";
        }

        /*Check properties*/
        if ((Object.values(this)).includes(undefined)) {
            console.log(this);
            throw new Error("One of the parameters is undefined valid.")
        }
    }
}


/**
 * This function creates an array of student data from csv format data.
 * @param filepath The filepath to where the resources are located.
 * @return {Promise<any>} Promise of operation.
 * */
exports.loadFromCsvData = function (filepath) {
    /*Check inputs */
    return new Promise(function (resolve, reject) {
        if (filepath === undefined || filepath === "") {
            reject("Input invalid!");
        } else {
            try {
                let supervisorList = [];
                fs.createReadStream(filepath)
                    .pipe(csv.parse({headers: true})
                        .on('data', row => {
                            supervisorList.push(new Supervisor(row));
                        })
                        .on('data-invalid', () => {
                            reject("Data invalid!");
                        })
                        .on('error', (error) => {
                            reject(error);
                        })
                        .on('end', (rowcount) => {
                            if (rowcount !== supervisorList.length) {
                                reject("Read failed!");
                            } else {
                                resolve(supervisorList);
                            }
                        })
                    );
            } catch (error) {
                reject(error.message);
            }
        }
    });
};


/**
 * This function creates an array of project allocation data from Json format data.
 * @param dataArray The JSON data array with supervisor information.
 * @return {Array} Array of project allocation objects.
 * @throws Error when input data is not valid.
 * */
exports.loadFromJsonData = function (dataArray) {
    if (Array.isArray(dataArray) && dataArray.length > 0) {
            let outputData = [];
            for (let index = 0; index < dataArray.length; index++) {
                /*convert to csv*/
                let csvDataArray = [];
                csvDataArray['Engagement no'] = dataArray[index].engagementNumber;
                csvDataArray['Staff ID'] = dataArray[index].Id;
                csvDataArray['Username'] = dataArray[index].username;
                csvDataArray['Title'] = dataArray[index].title;
                csvDataArray['Given names'] = dataArray[index].givenNames;
                csvDataArray['Family name'] = dataArray[index].familyName;
                csvDataArray['Email'] = dataArray[index].email;
                const supervisorData = new Supervisor(csvDataArray);
                outputData.push(supervisorData);
            }
            return outputData;
    } else {
        throw new Error("Input is not a array with data.");
    }
};