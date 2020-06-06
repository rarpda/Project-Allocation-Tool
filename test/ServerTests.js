require("mocha");
const config = require("../config");
const chai = require("chai"),
    chaiHttp = require('chai-http');
require("../src/app");

chai.use(chaiHttp);


describe("Server request handling", function () {
    let agent;
    const baseURL = config.app.host + ":" + config.app.httpsPort;

    before(async () => {
        agent = chai.request.agent(baseURL).keepOpen();
        /*Post authentication*/
        await agent.post("/login")
            .type("form")
            .send({
                    username: "test",
                    password: "test"
                }
            ).catch(error => {
                console.error(error.message);
            });
    });

    it('should download the staff data.', function () {
        return agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "staff"}).then(function (res) {
            return chai.expect(res).to.have.status(200);
        });
    });

    it('should download the project allocation data.', function () {
        return agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "projectAllocation"}).then(function (res) {
            return chai.expect(res).to.have.status(200);
        });
    });

    it('should download the modules data.', function () {
        return agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "modules"}).then(function (res) {
            return chai.expect(res).to.have.status(200);
        });
    });

    it('should download the dissertation data.', function () {
        return agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "dissertation"}).then(function (res) {
            return chai.expect(res).to.have.status(200);
        });
    });

    it('should return an error if the parameter is not valid.', function () {
        return agent.get("/Allocation/2019/TESTS/dataDownload").query({dataType: "dummy"}).then(function (res) {
            return chai.expect(res).to.have.status(400);
        });
    });


    it('should download the table csv file.', function () {
        return agent.get("/Allocation/2019/TESTS/dataExport").query({filename: "tableData"}).then(function (res) {
            return chai.expect(res).to.have.status(200);
        });
    });

    it('should download the zipped folder with student group data.', function () {
        return agent.get("/Allocation/2019/TESTS/dataExport").query({filename: "mmsGroupCsv"}).then(function (res) {
            return chai.expect(res).to.have.status(200);
        });
    });

    it('should download the zipped folder with supervisor data.', function () {
        return agent.get("/Allocation/2019/TESTS/dataExport").query({filename: "mmsSupervisorCsv"}).then(function (res) {
            return chai.expect(res).to.have.status(200);
        });
    });

    it('should download the pdf for studres.', function () {
        return agent.get("/Allocation/2019/TESTS/dataExport").query({filename: "pdfData"}).then(function (res) {
            return chai.expect(res).to.have.status(200);
        });
    });

    it('should return an error if the export parameter is not valid.', function () {
        return agent.get("/Allocation/2019/TESTS/dataExport").query({filename: "dummy"}).then(function (res) {
            return chai.expect(res).to.have.status(400);
        });
    });


    /*PUT requests*/
    const projectTestJson = [
        {
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
    const supervisorTestJson = [
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
    it('should save the supervisor data.', function () {
        return agent.post("/Allocation/2019/TESTS/dataSave")
            .send({
                savedData: JSON.stringify(supervisorTestJson),
                dataType: "supervisor",
            }).then(function (res) {
                return chai.expect(res).to.have.status(200);
            });
    });

    it('should throw an error for attempting to save bad  supervisor data.', function () {
        return agent.post("/Allocation/2019/TESTS/dataSave").send("string").then(function (res) {
            return chai.expect(res).to.have.status(400);
        });
    });

    it('should save the project allocation data.', function () {
        return agent.post("/Allocation/2019/TESTS/dataSave")
            .send({
                savedData: JSON.stringify(projectTestJson),
                dataType: "projectAllocation",
            }).then(function (res) {
                return chai.expect(res).to.have.status(200);
            });
    });


    it('should throw an error for attempting to save bad project allocation data.', function () {
        return agent.post("/Allocation/2019/TESTS/dataSave").send("string").then(function (res) {
            return chai.expect(res).to.have.status(400);
        })
    });


    /*Check resource not found */
    it('should throw error for resource not found.', function () {
        return agent.get("/dummy").then(function (res) {
            return chai.expect(res).to.have.status(404);
        });
    });


    after(() => {
        agent.close();
    })
});