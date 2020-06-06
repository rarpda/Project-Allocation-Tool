

require("mocha");
let chai = require("chai"),
    http = require("chai-http");
let express = require("express");
let app = express();
const config = require("../config");
let authentication = require("../src/server/Authentication");
chai.use(http);
require("../src/app");

describe("Authentication", function () {

    let requester;
    const baseURL = config.app.host + ":" + config.app.httpsPort;

    beforeEach(() => {
        requester = chai.request(baseURL).keepOpen();
    });

    it('should be able to initialise authentication', function () {
        return chai.expect(authentication.initAuthentication(app)).to.not.throw;
    });

    it('should pass the authentication check.', function () {
        let agent = chai.request.agent(baseURL);
        return agent.post("/login")
            .type("form")
            .send({
                    username: "test",
                    password: "test"
                }
            ).then(response => {
                return Promise.all([
                    chai.expect(response).to.redirectTo(baseURL + "/Homepage"),
                    //Could not find a better way to check cookies
                    chai.expect(response.request.cookies).to.have.include('projectAllocation')
                ]);
            }).finally(() => {
                agent.close();
            });
    });


    it('should only allow logged in users to access other resources.', function () {
        return requester.get("/TESTS/2019/dataDownload?dataType=staff").then(response => {
            return chai.expect(response).to.redirectTo(baseURL + "/login");
        });
    });


    it('should fail the authentication check.', function () {
        return requester.post("/login")
            .type("form")
            .send({
                    username: "error",
                    password: "error"
                }
            ).then(response => {
                return chai.expect(response).to.redirectTo(baseURL + "/login");
            });
    });

    afterEach(() => {
        requester.close();
    });

});


