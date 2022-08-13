import fs from "fs";
import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../app";
import {
  user, user2, user3, profile, user4
} from "./user-sign-in-test-data";
import { IUser, IAccount } from "../../utils/interface";

const { expect } = chai;
chai.should();
chai.use(chaiHttp);
describe("Should test all users", async () => {
  describe("/api/v1/users/login should sign in a user", () => {
    it("it should sign in a user with complete details successfully", (done) => {
      chai
        .request(server)
        .post("/api/v1/users/login")
        .set("Accept", "application/json")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("message").eql("User Logged in Successfully.");
          done();
        });
    });
    it("it should not sign in a user with incomplete details", (done) => {
      chai
        .request(server)
        .post("/api/v1/users/login")
        .set("Accept", "application/json")
        .send(user2)
        .end((err, res) => {
          res.should.have.status(422);
          done();
        });
    });
    it("it should not sign in a user without a registered email", (done) => {
      chai
        .request(server)
        .post("/api/v1/users/login")
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
    before((done) => {
      chai
        .request(server)
        .post("/api/v1/users/login")
        .set("Accept", "application/json")
        .send(user4)
        .end((err, res) => {
          if (err) throw err;
          userToken = res.body.data.token;
          done();
        });
    });
    it("returns user details", (done) => {
      chai
        .request(server)
        .get("/api/v1/users/details")
        .set("Authorization", `Bearer ${userToken}`)
        .end((err, res) => {
          const { body } = res;
          const { data } = body;
          expect(body.statusCode).to.equal(200);
          expect(body.message).to.equal("User Details fetched successfully.");

          expect(data).to.have.property("id");
          expect(data).to.have.property("firstName");
          expect(data).to.have.property("lastName");
          expect(data).to.have.property("phone");
          expect(data).to.have.property("photo");
          expect(data).to.have.property("balance");

          expect(data).to.be.an("object");
          done();
        });
    });
    it("returns all user accounts", (done) => {
      chai
        .request(server)
        .get("/api/v1/users/account")
        .set("Authorization", `Bearer ${userToken}`)
        .end((err, res) => {
          const { body } = res;
          const { data } = body;
          expect(body.statusCode).to.equal(200);
          expect(body.message).to.equal("Account fetched successfully.");

          data.forEach((accounts: IAccount[]) => {
            expect(accounts).to.have.property("id");
            expect(accounts).to.have.property("owner");
            expect(accounts).to.have.property("bankName");
            expect(accounts).to.have.property("accountNo");
          });

          expect(data).to.be.an("array");
          done();
        });
    });

    it("returns all users", (done) => {
      chai
        .request(server)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${userToken}`)
        .end((err, res) => {
          const { body } = res;
          const { data } = body;
          expect(body.statusCode).to.equal(200);
          expect(body.message).to.equal("Successfully retrived all Users.");

          data.forEach((users: IUser[]) => {
            expect(users).to.have.property("id");
            expect(users).to.have.property("firstName");
            expect(users).to.have.property("lastName");
            expect(users).to.have.property("phone");
            expect(users).to.have.property("photo");
            expect(users).to.have.property("balance");
          });

          expect(data).to.be.an("array");
          done();
        });
    });
  });
});

describe("Add Account", () => {
  let userToken :string;
  before((done) => {
    chai
      .request(server)
      .post("/api/v1/users/login")
      .set("Accept", "application/json")
      .send(user)
      .end((err, res) => {
        if (err) throw err;
        userToken = res.body.data.token;
        done();
      });
  });
  it("should allow user add accounts", (done) => {
    chai
      .request(server)
      .post("/api/v1/users/account")
      .set("Authorization", `Bearer ${userToken}`)
      .set("Accept", "application/json")
      .send({ bankName: "Uba bank", accountNo: "201455853" })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal("Account details added successfully.");
        done();
      });
  });
  it("should not allow user without token add account", (done) => {
    chai
      .request(server)
      .post("/api/v1/users/account")
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("should handle single user's operation", () => {
  let userToken: string;
  before((done) => {
    chai
      .request(server)
      .post("/api/v1/users/login")
      .set("Accept", "application/json")
      .send(user)
      .end((err, res) => {
        if (err) throw err;
        userToken = res.body.data.token;
        done();
      });
  });
  it("it should not update a user profile who is not signed in", (done) => {
    chai
      .request(server)
      .patch("/api/v1/users/profile")
      .send(profile)
      .end((err, res) => {
        res.should.have.status(401);
        expect(res.body.error).to.equal("Authorization not found");
        done();
      });
  });
  it("it should update a logged in user's profile", (done) => {
    chai
      .request(server)
      .patch("/api/v1/users/profile")
      .set("Authorization", `Bearer ${userToken}`)
      .send(profile)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("Profile updated Successfully.");
        done();
      });
  });
  it("it should update a logged in users profile picture", (done) => {
    chai
      .request(server)
      .patch("/api/v1/users/profile-picture")
      .set("Authorization", `Bearer ${userToken}`)
      .set("content-type", "form-data")
      .attach("image", fs.readFileSync(`${__dirname}/file.jpg`), "file.jpg")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("message").eql("Picture uploaded Successfully.");
        done();
      });
  });
});
