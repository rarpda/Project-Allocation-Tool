require("mocha");
const config = require("../config");
const chai = require("chai"),
    chaiHttp = require('chai-http');
const databaseHandler = require("../src/DataAccessObject");
require("../src/app");

chai.use(chaiHttp);


describe("Homepage functionality.", function () {
    let agent;
    const baseURL = config.app.host + ":" + config.app.httpsPort;

    before(() => {
        databaseHandler.saveData("StudentCohorts", [{cohortName: "TESTS", cohortYear: "2019"}]);

        /*Log in to the application.*/
        agent = chai.request.agent(baseURL).keepOpen();
        /*Post authentication*/
        return agent.post("/login")
            .type("form")
            .send({
                    username: "test",
                    password: "test"
                }
            ).catch(error => {
                console.error(error.message);
            });
    });

    it('should return a list of available student cohorts.', function () {
        return agent.get("/Homepage/StudentCohorts").then(function (res) {
            return chai.expect(res).to.have.status(200);
        })
    });

    it('should add the new cohort type sent to the database.', function () {
        return agent.post("/Homepage/addCohort")
            .type("form")
            .send({
                    cohortName: "test2",
                    cohortYear: 2019
                }
            ).then((response) => {
                return chai.expect(response).to.have.status(201);
            })
    });

    it('should return an error if attempting to add an existing cohort.', function () {
        return agent.post("/Homepage/addCohort")
            .type("form")
            .send({
                    cohortName: "test2",
                    cohortYear: 2019
                }
            ).then((response) => {
                return chai.expect(response).to.have.status(400);
            })
    });


    it("should redirect if a backslash is added to the end of the url.", function () {
        return agent.get("/HOMEPAGE/").then(function (res) {
            return chai.expect(res).to.redirectTo(baseURL + "/HOMEPAGE");
        });
    });

    it('should send an error if cohorts and year are undefined', function () {
        return agent.post("/Homepage/addCohort").then(function (res) {
            return chai.expect(res).to.have.status(400);
        });
    });


    after(() => {
        return agent.close();
    })
});
