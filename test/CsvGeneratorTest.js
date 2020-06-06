require("mocha");
const csvGenerator = require("../src/server/CsvGenerator");
const chai = require("chai");
const fs = require("fs");
const extract = require('extract-zip');
const path = require("path");


process.env.NODE_ENV = 'test';

describe("CsvGenerator", function () {
    before(() => {
        require("../src/app");
    });

    let testCsvFilepath;
    const testFileName = "test";
    const dummyHeaders = ["# username", "group name", "left the module"];
    const dummyData = [["test4", "test5", "test6"], ["test1", "test2", "test3"]];
    const outputExpected = "# username,group name,left the module\n" +
        "test4,test5,test6\n" +
        "test1,test2,test3";
    it('should create a csv file with any data inputted.', function () {
        return csvGenerator.createCsvFile("dataStorage/tmp/files/", testFileName, dummyHeaders, dummyData)
            .then((filename) => {
                testCsvFilepath = filename;
                /*Check file is correct format*/
                let dataRead = fs.readFileSync(testCsvFilepath, "utf8");
                chai.expect(dataRead).equal(outputExpected, "CSV data was not stored correctly.");
            })
            .catch((error) => {
                chai.assert.fail(true, error.message);
            }).finally(() => {
                fs.unlinkSync(testCsvFilepath);
            });
    });

    let zipFilepath;
    let unzipDirectory;

    it('should be able to create a zipped folder', function () {
        this.timeout(5000);
        return new Promise((resolve, reject) => {
            const sourceDirectory = path.join(__dirname, "./dataStorage/resources/");
            const outputDirectory = path.join(__dirname, "./dataStorage/tmp/");
            const testFilename = "test";
            unzipDirectory = path.join(__dirname, "./dataStorage/tmp/zipTest");
            try {
                zipFilepath = csvGenerator.createZippedFolder(sourceDirectory, outputDirectory, testFilename).then((zipFilepathTest) => {
                    zipFilepath = zipFilepathTest;
                    extract(zipFilepath, {dir: unzipDirectory}, function (error) {
                        if (error) {
                            throw error;
                        }
                    });
                    setTimeout(() => {
                        let files = fs.readdirSync(unzipDirectory);
                        chai.assert.equal(files.length, 2, "Folder zipping failed!");
                        resolve();
                    }, 2000);
                });
            } catch (error) {
                chai.assert.fail(0, 1, error.message);
                reject();
            }
        });
    });


    it('should be able to empty folders contents without deleting it.', function () {
        return new Promise((resolve, reject) => {
            let files = [];
            const deleteDirectory = "test/dataStorage/tmp/zipTest";
            try {
                csvGenerator.emptyFolder(deleteDirectory);
                setTimeout(() => {
                    files = fs.readdirSync(deleteDirectory);
                    chai.assert.equal(files.length, 0, "Files not deleted!");
                    resolve();
                }, 1000);

            } catch (error) {
                reject();
                chai.assert.fail(0, 1, error.message);
            }
        })
    });

    after(() => {
        fs.unlinkSync(zipFilepath);
        csvGenerator.emptyFolder(unzipDirectory);
    });
});



