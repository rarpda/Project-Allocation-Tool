/**
 *  This file contains the data model of the project allocation.
 *  @module ProjectAllocation
 * */

const fs = require('fs');
const csv = require('fast-csv');

/**
 * This class holds information for project allocations.
 * @class ProjectAllocation
 * */
class ProjectAllocation {

    /**
     * Function to populate project allocation objects when only student information is present.
     * @see src/model/Student.js
     * @param username The username of the student.
     * @param id The id of the student.
     * @param firstName The first name of the student.
     * @param lastName The last name of the student.
     * @param degreeIntention The degree intention tile for the project.
     * */
    createNewProjectAllocation(username, id, firstName, lastName, degreeIntention) {
        /*Basic constructor for both cases.*/
        this.username = username;
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.degreeIntention = degreeIntention;
        this.dissCode = "";
        this.projectTitle = "";
        this.supervisor = "";
        this.secondSupervisor = "";
        this.secondMarker = "";
        this.notes = "";
        /*Check properties*/
        if((Object.values(this)).includes(undefined)){
            console.log(this);
            throw new Error("One of the parameters is undefined valid.")
        }
    }


    /**
     * Function to populate the project allocation object with saved progress data.
     * @see src/model/Student.js
     * It will load from Json.
     * @param jsonObject The student object in Json format.
     *
     * */
    createFromSavedProgress(jsonObject) {
        /*Basic constructor for both cases.*/
        this.username = jsonObject["username"];
        this.id = jsonObject["id"];
        this.firstName = jsonObject["firstName"];
        this.lastName = jsonObject["lastName"];
        this.degreeIntention = jsonObject["degreeIntention"];
        this.dissCode = jsonObject["dissCode"];
        this.projectTitle = jsonObject["projectTitle"];
        this.supervisor = jsonObject["supervisor"];
        this.secondSupervisor = jsonObject["secondSupervisor"];
        this.secondMarker = jsonObject["secondMarker"];
        this.notes = jsonObject["notes"];
        /*Check properties*/
        if((Object.values(this)).includes(undefined)){
            console.log(this);
            throw new Error("One of the parameters is undefined valid.")
        }
    }
}

/**
 * This function creates an array of project allocation data from Json format data.
 * @param dataArray The array of JSON data.
 * @return {Array} Array of project allocation objects.
 * */
const loadFromJsonData = function (dataArray) {
    if (Array.isArray(dataArray) && dataArray.length > 0) {
            let outputData = [];
            for (let index = 0; index < dataArray.length; index++) {
                let projectAllocation = new ProjectAllocation();
                projectAllocation.createFromSavedProgress(dataArray[index]);
                outputData.push(projectAllocation);
            }
            return outputData;

    } else {
        throw new Error("Input is not a array with data.");
    }
};

/**
 * This function creates an array of project allocation data using Json data from a file.
 * @param filepath The filepath to where the resources
 * @return {Array} Array of project allocation objects.
 * @throws Error when the file does not exist or the data is not in the correct format.
 * */
exports.loadFromJsonFile = function (filepath) {
        /* Synchronously read from file.*/
        let rawData = fs.readFileSync(filepath);
        /*Only tableData in the file should be processed*/
        let projectAllocationList = JSON.parse(rawData).tableData;
        return loadFromJsonData(projectAllocationList);

};


/**
 * This function creates an array of project allocation data from csv format data.
 * @param filepath The filepath to where the resources are located.
 * @return {Promise<any>} Promise of operation.
 * @throws Error when the file does not exist or the data is not in the correct format.
 * */
exports.loadFromCSV = function (filepath) {
    /*Check inputs */
    return new Promise(function (resolve, reject) {
        /* Reject if filepath inputted is not valid.*/
        if (filepath === undefined || filepath === "") {
            reject("Input invalid!");
        } else {
            try {
                let arrayOfProjects = [];
                fs.createReadStream(filepath)
                    .pipe(csv.parse({headers: true})
                        .on('data', row => {
                            /*When a row is read, process the data.*/
                            let projectAllocation = new ProjectAllocation();
                            projectAllocation.createFromSavedProgress(row);
                            arrayOfProjects.push(projectAllocation);
                        })
                        .on('data-invalid', () => {
                            /* Data occurred whilst reading.*/
                            reject("Data invalid!");
                        })
                        .on('end', (rowcount) => {
                            /*Check if the row count matches the numbers of projects in array.*/
                            if (rowcount !== arrayOfProjects.length) {
                                reject("Read failed!");
                            } else {
                                resolve(arrayOfProjects);
                            }
                        })
                    );
            } catch (error) {
                /*Reject in case of error and pass the message.*/
                reject(error);
            }
        }
    });
};


/**
 * This function loads the module information from the resources filepath.
 * @param listOfStudents The list of students used to create a new list of projects.
 * @return {Array} Array of module objects.
 * @throws Error when the file does not exist or the data is not in the correct format.
 * */
exports.createNewList = function (listOfStudents) {
    if (Array.isArray(listOfStudents) && listOfStudents.length > 0) {
            let arrayOfProjects = [];
            listOfStudents.forEach((student) => {
                /*Create a new project allocation*/
                let projectAllocation = new ProjectAllocation();
                /*Breakdown into single inputs*/
                const username = student.username;
                const id = student.Id;
                const firstName = student.givenNames;
                const lastName = student.familyName;
                const degreeIntention = student.degreeIntention;
                /*Create new project allocation object.*/
                projectAllocation.createNewProjectAllocation(username, id, firstName, lastName, degreeIntention);
                arrayOfProjects.push(projectAllocation);
            });
            return arrayOfProjects;

    } else {
        throw new Error("Input is not an array or is empty.");
    }
};

exports.loadFromJsonData = loadFromJsonData;
