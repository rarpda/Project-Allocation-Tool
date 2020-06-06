const path = require('path');
const chai = require("chai");
const config = require("../../config");
require("mocha");
require("../../src/app");

const resourcesFolder = path.join(__dirname, "/../resources/");
const downloadFolder = path.join(__dirname, "./testDownloads/");
const {By, until} = require('selenium-webdriver');

describe("User Interaction", function () {
        this.timeout(8000);

        const baseURL = config.app.host + ":" + config.app.httpsPort;
        const testStudent = "rd196";
        let driver;


        before(function (done) {
            let driverBuilder = require("./BrowserInit")(downloadFolder);
            driver = driverBuilder.build();
            /*Find input for progress and save.*/
            driver.get(baseURL);
            driver.wait(until.urlIs(baseURL + "/login"));
            driver.findElement(By.id('usernameBox')).then(element => element.sendKeys("test"));
            driver.findElement(By.id('passwordBox')).then(element => element.sendKeys("test"));
            driver.findElement(By.id("submitBox")).click();

            driver.wait(until.urlIs(baseURL + "/Homepage")).then(() => {
                driver.get(baseURL + "/Allocation/2019/TESTS/");
                driver.wait(until.elementLocated(By.id('inputSavedProgressSetUp')), 500).then(element => {
                    element.sendKeys(path.join(resourcesFolder, "ProgressSaved.json")).then(() => {
                        driver.wait(until.elementLocated(By.id('progressMessageInput-savedProgress'))).then(() => {
                            done();
                        })
                    })
                });
            });
        });


        const rowCounter = function (searchFor, tableName, countExpected) {
            let displayCount = 0;
            /*Navigate to project allocation page.*/
            return driver.findElement(By.id("allocationNav")).click().then(() => {
                return driver.findElement(By.id('searchTable')).then(searchTable => {
                    searchTable.sendKeys(searchFor);
                    /*Check if another student is displayed*/
                    return driver.sleep(50).then(() => {
                        return driver.findElements(By.className(tableName)).then(async (tableRows) => {
                            /*Check file exists in test downloads*/
                            for (const row of tableRows) {
                                let visible = await row.isDisplayed();
                                if (visible) {
                                    displayCount++;
                                }
                            }
                            return chai.assert.equal(displayCount, countExpected, "Student is still displayed!");
                        });
                    });
                });
            })
        };

        it('should display the projects on the table.', function () {
            /*Navigate to project allocation page.*/
            driver.findElement(By.id("allocationNav")).click();
            /*Check if data is displayed.*/
            let displayCount = 0;
            return driver.sleep(100).then(() => {
                return driver.findElements(By.className("allocationTable-row")).then(async (tableRows) => {
                    for (const row of tableRows) {
                        await row.isDisplayed().then(result => {
                            if (result) {
                                displayCount++;
                            }
                        });
                    }
                    return chai.assert.equal(displayCount, 15, "Not all students are displayed!");
                })
            });
        });

        it("should hide student not in the filter.", function () {
            return rowCounter("ttttttt", "allocationTable-row", 0);
        });


        it("should only show the student in the filter.", function () {
            return rowCounter(testStudent, "allocationTable-row", 1);
        });

        const testElementUsernames = ['gh392', 'rh392', 'sj692'];
        const testElementIds = ['154189663', '474475769', '622549286'];

        const checkOrder = async function (comparator, headerID, attributeID, ascend) {
            return new Promise(async (resolve) => {
                /*Navigate to project allocation page.*/
                await driver.findElement(By.id("allocationNav")).click();
                let searchTable = await driver.findElement(By.id('searchTable'));
                await searchTable.sendKeys("IS5");
                driver.sleep(200);
                await driver.findElement(By.className(headerID)).click();
                if (!ascend) {
                    /*Double click*/
                    await driver.findElement(By.className(headerID)).click();
                }
                let tableRow = await driver.findElements(By.className("allocationTable-row"));
                /*Check file exists in test downloads*/
                let elementsDisplayed = [];
                await driver.sleep(100).then(async () => {
                    for (const element of tableRow) {
                        /*Check if it is displayed*/
                        let isElementVisible = await element.isDisplayed();
                        if (isElementVisible) {
                            await element.findElement(By.id(attributeID)).then(async result => {
                                elementsDisplayed.push(await result.getText());
                            });
                        }
                    }
                });
                let orderCorrect = true;
                if (comparator.length === elementsDisplayed.length) {
                    for (let index = 0; index < comparator.length; index++) {
                        if (ascend) {
                            if (comparator[index] !== elementsDisplayed[index]) {
                                orderCorrect = false;
                                break;
                            }
                        } else {
                            if (comparator[index] !== elementsDisplayed[elementsDisplayed.length - (1 + index)]) {
                                orderCorrect = false;
                                break;
                            }
                        }
                    }
                } else {
                    orderCorrect = false;
                }
                resolve(orderCorrect);
            });
        };


        it("should alphabetically ascending sort the elements of the table by username.", async () => {
            return checkOrder(testElementUsernames, "secondaryHeaders-Username", "username", true)
                .then((orderCorrect) => {
                    return chai.assert.isTrue(orderCorrect, "Ordering not correct!");
                });
        });


        it("should numerically ascending sort the elements of the table by ID.", () => {
            return checkOrder(testElementIds, "secondaryHeaders-ID", "id", true)
                .then((orderCorrect) => {
                    return chai.assert.isTrue(orderCorrect, "Ordering not correct!");
                });
        });

        it("should alphabetically descending sort the elements of the table by username.", () => {
            return checkOrder(testElementUsernames, "secondaryHeaders-Username", "username", false)
                .then((orderCorrect) => {
                    return chai.assert.isTrue(orderCorrect, "Ordering not correct!");
                });
        });


        it("should numerically descending sort the elements of the table by ID.", () => {
            return checkOrder(testElementIds, "secondaryHeaders-ID", "id", false)
                .then((orderCorrect) => {
                    return chai.assert.isTrue(orderCorrect, "Ordering not correct!");
                });
        });

        it("should redirect user to HTTPS server if they attempt to access via HTTTP.", () => {
            return driver.get("http://localhost:8080/").then(() => {
                return driver.getCurrentUrl().then(url => {
                    return chai.expect(url).to.equal("https://localhost:9998/Homepage");
                })
            });
        });


        after(() => {
            this.timeout(10000);
            const csvGenerator = require("../../src/server/CsvGenerator");
            csvGenerator.emptyFolder(path.join(__dirname, "/../../uploads"));
            driver.quit();
        });
    }
)
;
