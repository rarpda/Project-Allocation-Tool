const path = require("path");
require("mocha");
const chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const testJsonData = [
    {
        engagementNumber: '382518667/1',
        Id: '382518667',
        username: 'cb237',
        title: 'Mr',
        givenNames: 'Callum',
        familyName: 'Baresi',
        email: 'cb237@st-andrews.ac.uk'
    },
    {
        engagementNumber: '471346184/1',
        Id: '471346184',
        username: 'db491',
        title: 'Miss',
        givenNames: 'Dorothy',
        familyName: 'Bellafonte',
        email: 'db491@st-andrews.ac.uk'
    },
];


describe("Supervisor class", function () {
    let supervisor;
    const filepath = path.join(__dirname, "/resources/supervisorsDataWarehouse.csv");

    beforeEach(() => {
        supervisor = require("../src/model/Supervisor");
    });


    it('should be able to create array of Supervisors from csv data.', function () {
        return supervisor.loadFromCsvData(filepath).then(data => {
            chai.expect(data).to.have.length(15," length is not correct");
        }).catch(reason => {
            chai.assert.fail(reason);
        })
    });

    it('should be able to create array of Supervisors from json data.', function () {
        const arrayOfData = supervisor.loadFromJsonData(testJsonData);
        chai.assert.equal(arrayOfData.length, 2, "Data has been loaded");
        chai.expect(arrayOfData[0]).to.contain(testJsonData[0]);
        chai.expect(arrayOfData[1]).to.contain(testJsonData[1]);
    });


    it('should throw an error if an unexpected input is inserted.', function () {
        let errorThrown = false;
        try {
            supervisor.loadFromJsonData(undefined);
        } catch (error) {
            errorThrown = true;
        }
        chai.assert.isTrue(errorThrown, " Error not detected");
    });

    it('should throw an error if an empty file is added',  function () {
        return chai.expect(supervisor.loadFromCsvData("")).to.eventually.be.rejected;
    });
});


