/*Import libraries*/
const config = require("../../config");
const path = require('path');
const chai = require("chai");
let chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised')
require("mocha");
require("../../src/app");
chai.use(chaiAsPromised);
chai.use(chaiHttp);
const resourcesFolder = path.join(__dirname, "../resources/");
const downloadFolder = path.join(__dirname, "../dataStorage/testDownloads/");

const {By, until} = require('selenium-webdriver');


describe("Data import", function () {

    this.timeout(8000);

    const baseURL = config.app.host + ":" + config.app.httpsPort;
    let agent;
    let driver;

    before((done) => {
        agent = chai.request.agent(baseURL).keepOpen();
        const driverBuilder = require("./BrowserInit")(downloadFolder);
        driver = driverBuilder.build();
        /*Find input for progress and save.*/
        driver.get(baseURL);
        driver.wait(until.urlIs(baseURL + "/login"));
        driver.findElement(By.id('usernameBox')).then(element => element.sendKeys("test"));
        driver.findElement(By.id('passwordBox')).then(element => element.sendKeys("test"));
        driver.findElement(By.id("submitBox")).click();
        driver.wait(until.urlIs(baseURL + "/Homepage")).then(() => {
            /*Post authentication*/
            agent.post("/login")
                .type("form")
                .send({
                        username: "test",
                        password: "test"
                    }
                ).catch(error => {
                console.error(error.message);
            });
            done();
        })
    });

    beforeEach((done) => {
        driver.get(baseURL + "/Allocation/2019/TESTS/");
        driver.wait(until.elementLocated(By.id('inputSavedProgressSetUp'))).then(() => {
            done();
        });
    });

    const dataImport = function (inputElementDomId, filename, resultElementDomId) {
        /*Find input for progress and save.*/
        return driver.findElement(By.id(inputElementDomId)).then(element => {
            element.sendKeys(path.join(resourcesFolder, filename));
            /*Check success message is visible*/
            let promise = driver.wait(until.elementIsVisible(driver.findElement(By.id(resultElementDomId))), 2000).catch(() =>{
                throw new Error(filename + " not uploaded!");
            });
            return chai.expect(promise).to.not.be.rejected;
        });
    };


    it(' should load the student data.', function () {
        return dataImport('stu-upload', "studentsDataWarehouse.csv", "progressMessageInput-stu-upload");
    });

    it(' should throw an error if supervisor data is inserted to the student import.', function () {
        return dataImport('stu-upload', "supervisorsDataWarehouse.csv", "progressMessageInput-stu-upload-failure");
    });

    it(' should load the supervisor data.', function () {
        return dataImport('sup-upload', "supervisorsDataWarehouse.csv", "progressMessageInput-sup-upload");
    });

    it(' should throw an error if student data is inserted to the supervisor import.', function () {
        return dataImport('sup-upload', "studentsDataWarehouse.csv", "progressMessageInput-sup-upload-failure");
    });


    it(' should load the dissertation options successfully.', function () {
        return dataImport('dissertationUpload', "dissertationOptions.json", "progressMessageInput-dissertationUpload");
    });


    it(' should fail if invalid dissertation options are loaded.', function () {
        return dataImport('dissertationUpload', "moduleLibrary.json", "progressMessageInput-dissertationUpload-failure");
    });


    it(' should load the module options successfully.', function () {
        return dataImport('moduleOptionsUpload', "moduleLibrary.json", "progressMessageInput-moduleOptionsUpload");
    });


    it(' should fail if invalid dissertation options are loaded.', function () {
        return dataImport('moduleOptionsUpload', "dissertationOptions.json", "progressMessageInput-moduleOptionsUpload-failure");
    });


    it(' should load from Saved Progress file.', function () {
        return dataImport('inputSavedProgressSetUp', "ProgressSaved.json", "progressMessageInput-savedProgress");
    });


    it(' should throw an error if attempting to load from Saved Progress is not valid.', function () {
        return dataImport('inputSavedProgressSetUp', "dissertationOptions.json", "progressMessageInput-savedProgress-failure");
    });


    const compareReUploadEqual = function (dataType, inputElementDomId, filename, resultElementDomId) {
        let initialData = [];
        agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: dataType}).then(res => {
            initialData = res.body;
        });
        /*POST data*/
        return driver.findElement(By.id(inputElementDomId)).then((element) => {
            element.sendKeys(path.join(resourcesFolder, filename));
            return driver.wait(until.elementIsVisible(driver.findElement(By.id(resultElementDomId))))
                .then(() => {
                    return agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: dataType}).then(res => {
                        let finalData = res.body;
                        return chai.expect(finalData).to.eql(initialData);
                    });
                })
        });
    };


    it('should reupload the same supervisor data and not make any changes.', function () {
        return compareReUploadEqual("staff", 'supervisorReupload', "supervisorsDataWarehouse.csv", "progressMessageInput-supervisorReupload");
    });

    it('should reupload the same student data and not make any changes.', function () {
        return compareReUploadEqual("projectAllocation", 'studentReupload', "studentsDataWarehouse.csv", "progressMessageInput-studentReupload");
    });


    it('should reject the student data reupload if the data is not in the correct format.', function () {
        return compareReUploadEqual("projectAllocation", 'studentReupload', "supervisorsDataWarehouse.csv", "progressMessageInput-studentReupload-failure");
    });

    it('should reject the supervisor data reupload if the data is not in the correct format.', function () {
        return compareReUploadEqual("staff", 'supervisorReupload', "studentsDataWarehouse.csv", "progressMessageInput-supervisorReupload-failure");
    });


    it('should upload the add delete supervisor data and adjust accordingly.', function () {
        let initialData = [];
        agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "staff"}).then(res => {
            initialData = res.body;
        });
        /*POST data*/
        return driver.findElement(By.id('supervisorReupload')).then((element) => {
            element.sendKeys(path.join(resourcesFolder, "supervisorsAddDelete.csv"));
            return driver.wait(until.elementIsVisible(driver.findElement(By.id("progressMessageInput-supervisorReupload"))))
                .then(() => {
                    return agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "staff"}).then(res => {
                        let finalData = res.body;
                        /*Remove ah492*/
                        initialData = initialData.filter(supervisor => {
                            return supervisor.username !== "ah492";
                        });
                        /*Compare all*/
                        let counter = 0;
                        for (const supervisor of initialData) {
                            let finalObjectFound = finalData.find(test => {
                                return test.username === supervisor.username;
                            });
                            if (finalObjectFound) {
                                counter++;
                            }
                        }
                        return Promise.all([
                            chai.expect(counter).to.eql(initialData.length, "Data has changed!"),
                            chai.expect(finalData).to.have.length(initialData.length + 1, "Data is not of the same length"),
                            chai.expect(finalData.find(element => {
                                return element.username === "test";
                            })).to.not.equal(undefined, "test user should've been added."),
                        ]);
                    });
                })

        });
    });


    it('should upload the add delete student data and adjust accordingly.', function () {
        let initialData = [];
        agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "projectAllocation"}).then(res => {
            initialData = res.body;
        });
        /*POST data*/
        return driver.findElement(By.id('studentReupload'))
            .then((element) => {
                element.sendKeys(path.join(resourcesFolder, "studentsAddDelete.csv"));
                return driver.wait(until.elementIsVisible(driver.findElement(By.id("progressMessageInput-studentReupload"))))
                    .then(() => {
                        return agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "projectAllocation"}).then(res => {
                            let finalData = res.body;
                            /*Remove sj692*/
                            initialData = initialData.filter(element => {
                                return element.username !== "sj692";
                            });

                            /*Compare all*/
                            let counter = 0;
                            for (const student of initialData) {
                                let finalObjectFound = finalData.find(test => {
                                    return test.username === student.username;
                                });
                                if (finalObjectFound) {
                                    counter++;
                                }
                            }
                            return Promise.all([
                                chai.expect(counter).to.eql(initialData.length, "Data has changed!"),
                                chai.expect(finalData).to.have.length(initialData.length + 1, "Data is not of the same length"),
                                chai.expect(finalData.find(element => {
                                    return element.username === "test";
                                })).to.not.equal(undefined, "test user should've been added.")
                            ]);
                        });
                    })
            });
    });


    /*Clear resources*/
    after(() => {
        this.timeout(10000);
        if (agent) {
            agent.close();
        }
        driver.get(baseURL + "/Allocation/2019/TESTS/");
        const csvGenerator = require("../../src/server/CsvGenerator");
        csvGenerator.emptyFolder(downloadFolder);
        return driver.wait(until.elementLocated(By.id('inputSavedProgressSetUp')), 500).then(element => {
            return element.sendKeys(path.join(resourcesFolder, "ProgressSaved.json")).then(() => {
                return driver.wait(until.elementLocated(By.id('progressMessageInput-savedProgress'))).then(() => {
                    driver.quit();
                });
            })
        });
    });
});

