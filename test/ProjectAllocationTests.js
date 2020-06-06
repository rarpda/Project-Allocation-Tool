require("mocha");
const path = require("path");
const Student = require("../src/model/Student");
const chai = require("chai");

let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const testData = [{
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

describe("ProjectAllocation", function () {
    const projectAllocation = require("../src/model/ProjectAllocation");
    const filepath = path.join(__dirname, "/resources/ProgressSaved.json");
    it('should be able to create an array of project allocations from the json data from a file.', function () {
        let projectList;
        try {
            projectList = projectAllocation.loadFromJsonFile(filepath);
        } catch (error) {
            console.error(error.message);
        }
        chai.expect(projectList).to.have.length(15, "Data was not loaded correctly.");
    });

    it('should be able to create an array of project allocations from the json data.', function () {
        let projectList;
        try {
            projectList = projectAllocation.loadFromJsonData(testData);
        } catch (error) {
            console.error(error.message);
        }
        chai.expect(projectList).to.have.length(2, "Data was not loaded correctly.");
    });

    it('should throw an error when incorrect data is inputted.', function () {
        let exceptionThrown = false;
        try {
            projectAllocation.loadFromJsonData("str");
        } catch (error) {
            exceptionThrown = true;
        }
        chai.assert.isTrue(exceptionThrown,"Error not detected" );
    });


    it('should be able to create an array of project allocations from a list of students.', function () {
        const studentFilepath = path.join(__dirname, "/resources/studentsDataWarehouse.csv");
        return Student.loadFromCsvData(studentFilepath).then(data => {
            const projectList = projectAllocation.createNewList(data);
            chai.assert.isTrue(projectList.length === data.length, "Project allocation array was not created correctly.");
        }).catch(error=>{
            chai.assert.fail(0,1,error.message);
        });
    });


    it('should load the data from a CSV file', function () {
        const filepath = path.join(__dirname, "/resources/ProjectAllocation.csv");
        return projectAllocation.loadFromCSV(filepath).then( projectList =>{
            chai.expect(projectList).to.have.length(15, "Data was not loaded correctly.")
        }).catch(error=>{
            chai.assert.fail(0,1,error.message);
        });
    });


    it('should throw an error if an empty JSON file is added', function () {
        let errorFound = false;
        try {
            projectAllocation.loadFromJsonFile(" ");
        } catch (error) {
            errorFound = true;
        }
        chai.assert.isTrue(errorFound, "Error not detected");

    });


    it('should throw an error if an empty CSV file is added', function () {
        return chai.expect(Promise.resolve(projectAllocation.loadFromCSV(""))).to.be.rejected;
    });

    it('should throw an error if an empty array is added', function () {
        let exceptionThrown = false;
        try {
            projectAllocation.createNewList([]);
        } catch (error) {
            exceptionThrown = true;
        }
        chai.assert.isTrue(exceptionThrown,"Error not detected" );
    });
});


