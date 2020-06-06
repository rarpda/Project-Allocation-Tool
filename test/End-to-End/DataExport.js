const config = require("../../config");
const path = require('path');
const chai = require("chai");
const fs = require('fs');
let chaiHttp = require('chai-http');
require("mocha");
require("../../src/app");

chai.use(chaiHttp);
const downloadFolder = path.join(__dirname, "../dataStorage/testDownloads/");
const {By, until} = require('selenium-webdriver');

describe("Data Export", function () {
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
            driver.wait(until.elementLocated(By.id('inputSavedProgressSetUp'))).then(()=>{
                done();
            });
        });

        const exportTestFunction = function (driverTest, testFilepath, buttonID) {
            /*Navigate to project allocation page.*/
            driverTest.findElement(By.id("allocationNav")).click();
            return driverTest.wait(until.elementLocated(By.id("dataExportButton"))).click().then(() => {
                return driverTest.wait(until.elementIsVisible(driver.findElement(By.id(buttonID)))).click().then(() => {
                    /*Check file exists in test downloads*/
                    return driver.sleep(1000).then(() => {
                        return chai.expect(fs.existsSync(testFilepath)).to.be.true;
                    });
                })
            })
        };


        it(' should download current progress in Json format', function () {
            const filepath = path.join(downloadFolder, "ProgressSaved.json");
            /*Navigate to project allocation page.*/
            driver.findElement(By.id("allocationNav")).click();
            return driver.wait(until.elementLocated(By.id("download"))).click().then(() => {
                return driver.sleep(1500).then(() => {
                    return chai.expect(fs.existsSync(filepath)).to.be.true;
                });
            })
        });


        it(' should export the table data in CSV format.', function () {
            const filepath = path.join(downloadFolder, "ProjectAllocation.csv");
            return exportTestFunction(driver, filepath, "csvExportButton");
        });

        it(' should the MMS group data in CSV format.', function () {
            const filepath = path.join(downloadFolder, "mmsGroups.zip");
            return exportTestFunction(driver, filepath, "csvMmsGroupButton");
        });

        it(' should the MMS supervisor data in CSV format.', function () {
            const filepath = path.join(downloadFolder, "mmsSupervisor.zip");
            return exportTestFunction(driver, filepath, "csvMmsSupervisorButton");
        });

        it(' should the pdf file for Studres.', function () {
            const filepath = path.join(downloadFolder, "Allocation.pdf");
            return exportTestFunction(driver, filepath, "pdfExportDataButton");
        });


        after(() => {
            this.timeout(10000);
            driver.quit();
        });
    }
)
;

