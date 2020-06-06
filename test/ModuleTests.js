/**
 * This file is for testing the supervisor class.
 * @author rarpda
 */
require("mocha");
const chai = require("chai");
const path = require("path");
const moduleHandler = require("../src/model/Module");


describe("Module class", function () {

    it('should load the dissertation options from a JSON file.', function () {
        let dissertationData = moduleHandler.loadDissertationOptions(path.join(__dirname, "./resources/dissertationOptions.json"));
        chai.expect(dissertationData).to.have.length(14, "Dissertation data not loaded correctly.");
    });

    it('should load the modules options from a JSON file.', function () {
        let moduleData = moduleHandler.loadModuleInformation(path.join(__dirname, "./resources/moduleLibrary.json"));
        chai.expect(moduleData).to.have.length(16, "Module data not loaded correctly.");
    });


    const moduleTestData = [{
        "title": "MSc Advanced Computer Science",
        "code": 643768366,
        "abbreviation": "MSc ACS",
        "dissertationOptions": [
            "CS5099",
            "CS5098"
        ]
    },
        {
            "title": "MSc Artificial Intelligence",
            "code": 643768366,
            "abbreviation": "MSc AI",
            "dissertationOptions": [
                "CS5099",
                "CS5098"
            ]
        }];

    const dissertationOptions = [
        {
            "code": "IS5188",
            "title": "Group Dissertation in Management and IT  (60 credits)",
            "external": false
        },
        {
            "code": "IS5198",
            "title": "Group Dissertation in Information Technology  (60 credits)",
            "external": false
        },
    ];

    it('should be able to create an array of dissertation options from an array of JSON data.', function () {
        let dissertationData = moduleHandler.loadDissertationsFromJsonData(dissertationOptions);
        chai.expect(dissertationData).to.have.length(2, "Dissertation data not loaded correctly.");
    });


    it('should be able to create an array of moduleHandler options from an array of JSON data.', function () {
        let moduleData = moduleHandler.loadModulesFromJsonData(moduleTestData);
        chai.expect(moduleData).to.have.length(2, "Module data not loaded correctly.");
    });


    it('should throw an error if a invalid path is inserted when loading dissertations.', function () {
        let errorThrown = false;
        try {
            moduleHandler.loadDissertationOptions(" ");
        } catch (error) {
            errorThrown = true;
        }
        chai.expect(errorThrown).to.be.true;
    });

    it('should throw an error if a invalid path is inserted when loading modules.', function () {
        let errorThrown = false;
        try {
            moduleHandler.loadModuleInformation(" ");
        } catch (error) {
            errorThrown = true;
        }
        chai.expect(errorThrown).to.be.true;
    });

    it('should throw an error if an empty array is inserted when loading dissertations.', function () {
        let errorThrown = false;
        try {
            moduleHandler.loadDissertationsFromJsonData([]);
        } catch (error) {
            errorThrown = true;
        }
        chai.expect(errorThrown).to.be.true;
    });

    it('should throw an error if an empty array is inserted when loading modules.', function () {
        let errorThrown = false;
        try {
            moduleHandler.loadModulesFromJsonData([]);
        } catch (error) {
            errorThrown = true;
        }
        chai.expect(errorThrown).to.be.true;
    });


});


