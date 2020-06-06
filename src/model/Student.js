/**
 *
 * This file holds the class of the student and is part of the data model.
 * @module Student
 * */

/* Library imports.*/
const UniversityMember = require("./UniversityMember");
const csv = require('fast-csv');
const fs = require('fs');


/**
 * This class models the student object for this application,
 * It extends the parent class UniversityMember.
 * @class Student
 * @extends UniversityMember
 * */
class Student extends UniversityMember {

    /**
     * Constructor for the student class.
     * @param jsonObject The json formatted data for creating a student instance.
     * */
    constructor(jsonObject) {
        if (typeof jsonObject === "undefined") {
            throw new Error("jsonObject is not defined.")
        }

        super(jsonObject['Engagement no'], jsonObject['Student ID'], jsonObject['Username'], jsonObject['Title'], jsonObject['Given names'], jsonObject['Family name'], jsonObject['Email']);

        this.dateOfBirth = jsonObject["Date of birth"];
        this.fulltimePartime = jsonObject["Full/part time"];
        this.registrationStatus = jsonObject["Registration status"];
        this.qualificationAwarded = jsonObject["Qualification awarded"];
        this.classAwarded = jsonObject["Class awarded"];
        this.faculty = jsonObject["Faculty"];
        this.studentType = jsonObject["Student type"];
        this.programmeName = jsonObject["Programme name"];
        this.degreeIntention = jsonObject["Degree intention"];
        this.degreeIntentionCode = jsonObject["Degree intention (code)"];
        this.lastSchool = jsonObject["Last school"];

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
 * @throws Error when the file does not exist or the data is not in the correct format.
 * */
exports.loadFromCsvData = function (filepath) {
    /*Check inputs */
    return new Promise(function (resolve, reject) {
        /* Reject if filepath inputted is not valid.*/
        if (filepath === undefined || filepath === "") {
            reject("Input invalid!");
        } else {
            try {
                let studentList = [];
                fs.createReadStream(filepath)
                    .pipe(csv.parse({headers: true})
                        .on('data', row => {
                            /*When a row is read, process the data.*/
                            studentList.push(new Student(row));
                        })
                        .on('data-invalid', () => {
                            /* Data occurred whilst reading.*/
                            reject("Data invalid!");
                        })
                        .on('error', (error) => {
                            reject(error);
                        })
                        .on('end', (rowcount) => {
                            /*Check if the row count matches the numbers of projects in array.*/
                            if (rowcount !== studentList.length) {
                                reject("Read failed!");
                            } else {
                                resolve(studentList);
                            }
                        })
                    );
            } catch (error) {
                reject(error);
            }
        }
    });
};