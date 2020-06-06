require("mocha");
const chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);


const projectAllocationTestData = [{
    username: 'jz582',
    id: '451599133',
    firstName: 'Julian',
    lastName: 'Zhao',
    degreeIntention: 'MSc Artificial Intelligence',
    dissCode: 'CS5099',
    projectTitle: 'BBC Sport Feed',
    supervisor: '',
    secondSupervisor: '',
    secondMarker: '',
    notes: ''
},
    {
        username: 'lz154',
        id: '126964489',
        firstName: 'Lauren',
        lastName: 'Zhao',
        degreeIntention: 'MSc Human Computer Interaction',
        dissCode: 'CS5099',
        projectTitle: 'Museum Archive',
        supervisor: 'Juanita Honda',
        secondSupervisor: 'Dorothy Bellafonte',
        secondMarker: '',
        notes: ''
    }
];

const supervisorTestData = [
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


describe("Database controller", function () {
    let databaseController;
    before(function (done) {
        databaseController = require("../src/DataAccessObject");
        databaseController.connectionSetup(done);
    });


    it("should be able to save the data.", function () {
        let mergedArray = {projectAllocation: projectAllocationTestData, supervisor: supervisorTestData};
        return databaseController.saveData("TEST", mergedArray).then((outcome) => {
            return chai.expect(outcome).to.be.true;

        })
    });


    it("should be able to load project data.", function () {
        return databaseController.getData("TEST").then(projectData => {
            return Promise.all([
                chai.expect(projectData.projectAllocation).to.eql(projectAllocationTestData),
                chai.expect(projectData.supervisor).to.eqls(supervisorTestData)
            ]);
        })

    });

    it("should throw an error if looking for a document that does not exists.", function () {
        return chai.expect(Promise.resolve(databaseController.getData("Tete"))).to.be.rejected;
    });


    it("should check if a ", function () {
        return chai.expect(Promise.resolve(databaseController.getData("Tete"))).to.be.rejected;
    });

    after((done) => {
        /*Clean up documents */
        databaseController.databaseController.remove("TEST", function (err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Removed the file!");
            }
            done();
        });
    })
});