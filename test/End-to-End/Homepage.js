const path = require('path');
const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
const config = require("../../config");
require("mocha");
require("../../src/app");
chai.use(chaiAsPromise);
const downloadFolder = path.join(__dirname, "./testDownloads/");
const {By, until} = require('selenium-webdriver');
const databaseDriver = require("../../src/DataAccessObject");

describe("Homepage Tests", function () {
    this.timeout(5000);
    const baseURL = config.app.host + ":" + config.app.httpsPort;

    let driver;

    before(function (done) {
        const driverBuilder = require("./BrowserInit")(downloadFolder);

        databaseDriver.saveData("StudentCohorts", [{cohortName: "TESTS", cohortYear: "2019"}, {
            cohortName: "TESTS",
            cohortYear: "2020"
        }]).then(() => {
            driver = driverBuilder.build();
            /*Find input for progress and save.*/
            driver.get(baseURL);
            driver.wait(until.urlIs(baseURL + "/login"));
            driver.findElement(By.id('usernameBox')).then(element => element.sendKeys("test"));
            driver.findElement(By.id('passwordBox')).then(element => element.sendKeys("test"));
            driver.findElement(By.id("submitBox")).click();
            driver.wait(until.urlIs(baseURL + "/Homepage")).then(() => {
                done();
            });
        });
    });

    beforeEach((done) => {
        driver.get(baseURL + "/Homepage");
        driver.wait(until.elementLocated(By.id('2019-TESTS'))).then(() => {
            done();
        });

    });

    it("should be able to navigate to an existing link.", function () {
        return driver.findElement(By.id("2019-TESTS")).then((element) => {
            element.click();
            console.log("Wait for page to load.");
            return chai.expect(driver.wait(until.urlIs("https://localhost:9998/Allocation/2019/TESTS/"), 1000)).to.eventually.be.fulfilled;
        });
    });

    it("should display all cohorts present cohort.", function () {
        return driver.findElements(By.className("cohortElement")).then((elements) => {
            return chai.expect(elements).to.have.lengthOf(2, "Did not have the correct length");
        });
    });

    it("should be able to add a new student cohort.", function () {
        driver.findElement(By.id('studentCohort')).then(element => element.sendKeys("TESTS"));
        driver.findElement(By.id('cohortYear')).then(element => element.sendKeys("2021"));
        return driver.findElement(By.id('submitBox')).click().then(() => {
            return driver.wait(until.elementLocated(By.id("2021-TESTS")));
        })
    });

    it("should not able to add a new student cohort if parameters are empty.", function () {
        driver.findElement(By.id('studentCohort')).then(element => element.sendKeys("TESTS"));
        driver.findElement(By.id('cohortYear')).then(element => element.sendKeys("2019"));
        return driver.findElement(By.id('submitBox')).click().then(() => {
            return driver.wait(until.alertIsPresent())
                .then(function (alert) {
                    return alert.accept();
                });
        })
    });


    after(() => {
        this.timeout(10000);
        driver.quit();
    });
})
;

