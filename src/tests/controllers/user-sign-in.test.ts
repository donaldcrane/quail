import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../app";
import { user, user2, user3, user8 } from "./user-sign-in-test-data";
import { IUser } from "../../utils/interface";
import { user4 } from "./user-sign-in-test-data";

const { expect } = chai;
chai.should();
chai.use(chaiHttp);
describe("Should test all users", async () => {
  describe("/api/v1/users/signin should sign in a user", () => {
    it("it should sign in a user with complete details successfully", done => {
      chai
        .request(server)
        .post("/api/v1/users/signin")
        .set("Accept", "application/json")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("message").eql("User Logged in Successfully.");
          done();
        });
    });
    it("it should not sign in a user with incomplete details", done => {
      chai
        .request(server)
        .post("/api/v1/users/signin")
        .set("Accept", "application/json")
        .send(user2)
        .end((err, res) => {
          res.should.have.status(422);
          done();
        });
    });
    it("it should not sign in a user without a registered email", done => {
      chai
        .request(server)
        .post("/api/v1/users/signin")
        .set("Accept", "application/json")
        .send(user3)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property("error").eql("Email does not exist.");
          done();
        });
    });
  });

  describe("GET User api route", () => {
    let userToken: string;
    before(done => {
      chai
        .request(server)
        .post("/api/v1/users/signin")
        .set("Accept", "application/json")
        .send(user)
        .end((err, res) => {
          if (err) throw err;
          userToken = res.body.data.token;
          done();
        });
    });
    it("returns user beneficiaries", done => {
      chai
        .request(server)
        .get("/api/v1/users/beneficiaries")
        .set("Authorization", `Bearer ${userToken}`)
        .end((err, res) => {
          const { body } = res;
          const { data } = body;
          expect(body.statusCode).to.equal(200);
          expect(body.message).to.equal("Successfully retrived all beneficiaries");

          data.forEach((users: IUser[]) => {
            expect(users).to.have.property("id");
            expect(users).to.have.property("owner");
            expect(users).to.have.property("beneficiaryName");
            expect(users).to.have.property("beneficiaryEmail");
            expect(users).to.have.property("beneficiaryId");
          });

          expect(data).to.be.an("array");
          done();
        });
    });
  });
});

describe("Add beneficiary account", () => {
  let userToken :string ;
  before(done => {
    chai
      .request(server)
      .post("/api/v1/users/signin")
      .set("Accept", "application/json")
      .send(user8)
      .end((err, res) => {
        if (err) throw err;
        userToken = res.body.data.token;
        done();
      });
  });
  it("should allow user add beneficiary account", done => {
    chai
      .request(server)
      .post("/api/v1/users/beneficiary/1857f7f4-a3e0-4bd4-b1f3-b98c045b4ed2")
      .set("Authorization", `Bearer ${userToken}`)
      .set("Accept", "application/json")
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal("Successfully added beneficiary account.");
        done();
      });
  });
  it("should not allow user without token add his beneficiary account", done => {
    chai
      .request(server)
      .post("/api/v1/users/beneficiary/ae7025ad-65b6-44d7-97f0-daeb2db01a40")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});
