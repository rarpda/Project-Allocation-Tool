require("mocha");
const config = require("../config");
const chai = require("chai"),
    chaiHttp = require('chai-http');

require("../src/app");

chai.use(chaiHttp);


describe("Project Router Tests", function () {
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

    it("should send the html page when accessing a valid cohort request", function () {
        return agent.get("/Allocation/2019/TESTS/").then(function (res) {
            chai.expect(res).to.have.status(200);
            chai.expect(res.type).to.equal("text/html");
        }).catch(error => {
                chai.assert.fail(error);
            }
        );
    });

    it("should a 404 if cohort does not exist", function () {
        return agent.get("/Allocation/1111/DOESNTEXIST/").then(function (res) {
            chai.expect(res).to.have.status(404);
        }).catch(error => {
                chai.assert.fail(error);
            }
        );
    });

    it("should redirect if a backslash is not added to the end of the url.", function () {
        return agent.get("/Allocation/2019/TESTS").then(function (res) {
            chai.expect(res).to.redirectTo(baseURL + "/Allocation/2019/TESTS/");
        }).catch(error => {
                chai.assert.fail(error);
            }
        );
    });



    after(() => {
        /*Clean data*/
        agent.close();
    })
});