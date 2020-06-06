/**
 * This file is for testing the supervisor class.
 * @author rarpda
 */
const path = require("path");
require("mocha");
const chai = require("chai");

const studentModel = require("../src/model/Student");

describe("Student class", function () {
    const filepath = path.join(__dirname, "/resources/studentsDataWarehouse.csv");
    it('should be able to create array of Students from csv data.', function () {
        return new Promise((resolve,reject)=> studentModel.loadFromCsvData(filepath).then(listOfStudents => {
            for(const student of listOfStudents){
                chai.expect(student.dateOfBirth).to.not.be.undefined;
                chai.expect(student.fulltimePartime).to.not.be.undefined;
                chai.expect(student.registrationStatus).to.not.be.undefined;
                chai.expect(student.qualificationAwarded).to.not.be.undefined;
                chai.expect(student.classAwarded).to.not.be.undefined;
                chai.expect(student.faculty).to.not.be.undefined;
                chai.expect(student.studentType).to.not.be.undefined;
                chai.expect(student.programmeName).to.not.be.undefined;
                chai.expect(student.degreeIntention).to.not.be.undefined;
                chai.expect(student.degreeIntentionCode).to.not.be.undefined;
                chai.expect(student.lastSchool).to.not.be.undefined;
            }
            resolve();
        }).catch(reason => {
            reject(reason);
        }));
    });

    it('should throw an error if an empty file is added', function () {
        return studentModel.loadFromCsvData("").then(() => {
            chai.assert.fail("Error not detected.")
        }).catch(() => {
            chai.assert.ok(true);
        });
    });
});


