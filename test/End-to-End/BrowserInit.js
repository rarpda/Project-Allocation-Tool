//TODO look into this for chrome headless
// https://stackoverflow.com/questions/44197253/headless-automation-with-nodejs-selenium-webdriver?rq=1
//https://www.toolsqa.com/selenium-webdriver/how-to-download-files-using-selenium/

const {Builder} = require('selenium-webdriver');

/**
 * Sets up download folder for browser.
 * Removed from https://stackoverflow.com/questions/25251583/downloading-file-to-specified-location-with-selenium-and-python
 * */
module.exports = function (downloadFolder) {
    let testOptions;
    let driverBuilder;
    let browser = process.env.BROWSER;
    if (browser === 'firefox') {
        /*Firefox*/
        require("geckodriver");
        let firefox = require('selenium-webdriver/firefox');
        testOptions = new firefox.Options();
        testOptions.setPreference("browser.download.folderList", 2);
        testOptions.setPreference("browser.download.dir", downloadFolder);
        testOptions.addArguments("--headless");
        testOptions.setPreference("browser.helperApps.neverAsk.saveToDisk",
            "application/json;application/pdf;application/zip;text/csv;");
        testOptions.setPreference("browser.download.manager.showWhenStarting", false);
        testOptions.setPreference("pdfjs.disabled", true);
        driverBuilder = new Builder().withCapabilities({
            browserName: 'firefox',
            acceptSslCerts: true,
            acceptInsecureCerts: true,
        }).setFirefoxOptions(testOptions);
    } else {
        /*Chrome*/
        require("chromedriver");
        let chrome = require('selenium-webdriver/chrome');
        testOptions = new chrome.Options();
        testOptions.setUserPreferences({
            "download.folderList": 2,
            'download.default_directory': downloadFolder,
            'download.behaviour': "allow",
            'certificate-errors': "ignore"
        });
        driverBuilder = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(testOptions);
    }
    console.log("Starting " + browser);
    return driverBuilder;
};