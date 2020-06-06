/**
 * This file is for testing the data handler class.
 * @author rarpda
 */
require("mocha");
const chai = require("chai");
const path = require("path");
const dataHandler = require("../src/DataHandler");
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
describe("DataHandler", function () {

    it('should upload staff csv data.', function () {
        return chai.expect(dataHandler.dataUpload("student", "2019-TESTS", path.join(__dirname, "./resources/studentsDataWarehouse.csv"))).to.be.fulfilled;
    });

    it('should upload supervisor csv data.', function () {
        return chai.expect(Promise.resolve(dataHandler.dataUpload("supervisor", "2019-TESTS", path.join(__dirname, "./resources/supervisorsDataWarehouse.csv")))).to.be.fulfilled;
    });


    it('should saved progress data.', function () {
        return chai.expect(Promise.resolve(dataHandler.dataUpload("savedProgress", "2019-TESTS", path.join(__dirname, "./resources/ProgressSaved.json")))).to.be.fulfilled;
    });

    it('should export all types of data.', function () {
        return Promise.all([
            chai.expect(Promise.resolve(dataHandler.dataExport("tableData", "2019-TESTS"))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataExport("tableData", "2019-TESTS"))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataExport("mmsGroupCsv", "2019-TESTS"))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataExport("mmsSupervisorCsv", "2019-TESTS"))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataExport("pdfData", "2019-TESTS"))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataExport("savedProgress", "2019-TESTS"))).to.be.fulfilled,
        ]);
    });

    it('should fetch all types of data.', function () {
        return Promise.all([
            chai.expect(Promise.resolve(dataHandler.dataFetch("projectAllocation", "2019-TESTS"))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataFetch("staff", "2019-TESTS"))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataFetch("modules", "2019-TESTS"))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataFetch("dissertation", "2019-TESTS"))).to.be.fulfilled,
        ]);
    });

    it('should reupload all types of data.', function () {
        return Promise.all([
            chai.expect(Promise.resolve(dataHandler.dataReupload("student", "2019-TESTS", path.join(__dirname, "./resources/studentsDataWarehouse.csv")))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataReupload("staff", "2019-TESTS", path.join(__dirname, "./resources/supervisorsDataWarehouse.csv")))).to.be.fulfilled,
        ]);
    });

    it('should save all types of data.', function () {
        const testProjectStaff = [{
            "engagementNumber": "926773214/1",
            "Id": "926773214",
            "username": "er420",
            "title": "Mr",
            "givenNames": "Elvis",
            "familyName": "Rahman",
            "email": "er420@st-andrews.ac.uk"
        }];
        const testProjectAllocationJson = [{
            "username": "rd196",
            "id": "643768366",
            "firstName": "Rose",
            "lastName": "de la Rue",
            "degreeIntention": "MSc Advanced Computer Science",
            "dissCode": "CS5099",
            "projectTitle": "Tetete",
            "supervisor": "Dorothy Bellafonte",
            "secondSupervisor": "Jane Hazelnut",
            "secondMarker": "",
            "notes": "saadsa"
        }];
        return Promise.all([
            chai.expect(Promise.resolve(dataHandler.dataSave("supervisor", "2019-TESTS", JSON.stringify(testProjectStaff)))).to.be.fulfilled,
            chai.expect(Promise.resolve(dataHandler.dataSave("projectAllocation", "2019-TESTS", JSON.stringify(testProjectAllocationJson)))).to.be.fulfilled,
        ]);
    });

    after(function () {
        const csvGenerator = require("../src/server/CsvGenerator");
        csvGenerator.emptyFolder(path.join(__dirname, "../dataStorage/tmp/files"));
        return dataHandler.dataUpload(dataHandler.dataUpload("savedProgress", "2019-TESTS", path.join(__dirname, "./resources/ProgressSaved.json")));
    })
});

