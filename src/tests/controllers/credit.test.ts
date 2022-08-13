import chai from "chai";
import chaiHttp from "chai-http";
import db from "../../config/database";
import { user4 } from "./user-sign-in-test-data";
import { credit, credit2, credit3 } from "./credit-data";
import server from "../../app";
import { ICredit } from "../../utils/interface";

chai.should();

const { expect } = chai;
chai.use(chaiHttp);

describe("Add credit", () => {
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
  it("should allow user with token add money to his account", (done) => {
    chai
      .request(server)
      .post("/api/v1/credits/paystack/initialize")
      .set("Authorization", `Bearer ${userToken}`)
      .set("Accept", "application/json")
      .send(credit)
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });
  it("should not allow user add money to his account with incomplete details", (done) => {
    chai
      .request(server)
      .post("/api/v1/credits/paystack/initialize")
      .set("Authorization", `Bearer ${userToken}`)
      .set("Accept", "application/json")
      .send(credit2)
      .end((err, res) => {
        expect(res).to.have.status(422);
        done();
      });
  });
  it("should not allow user without token add money to his account", (done) => {
    chai
      .request(server)
      .post("/api/v1/credits/paystack/initialize")
      .send(credit3)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("Delete credit Transaction", () => {
  beforeEach(async () => {
    await db("credits").del();
    await db("credits").insert({
      id: "c375c640-81ff-405a-89a8-460ea2f71745",
      owner: "3eb4baee-1a79-11ed-a1d4-1458d0166666",
      amount: 40000,
      type: "cardPayment",
      sender: "3eb4baee-1a79-11ed-a1d4-1458d0166666",
      reference: "njskcc",
      status: "success"
    });
  });
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
  it("should allow User Delete a credit Transaction", (done) => {
    chai
      .request(server)
      .delete("/api/v1/credits/c375c640-81ff-405a-89a8-460ea2f71745")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal("Successfully Deleted transaction.");
        done();
      });
  });
  it("should not allow user delete a credit with invalid ID data type", (done) => {
    chai
      .request(server)
      .delete("/api/v1/credits/8d58")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(422);
        done();
      });
  });
  it("returns 404 when deleting credit which is not in db", (done) => {
    chai
      .request(server)
      .delete("/api/v1/credits/8d222465-cd80-4030-b665-bdc3bbd3e578")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal("Transaction not found.");
        done();
      });
  });
});

describe("GET credit api route", () => {
  beforeEach(async () => {
    await db("credits").del();
    await db("credits").insert({
      id: "c375c640-81ff-405a-89a8-460ea2f71757",
      owner: "3eb4baee-1a79-11ed-a1d4-1458d0166666",
      amount: 40000,
      type: "cardPayment",
      sender: "3eb4baee-1a79-11ed-a1d4-1458d0166666",
      reference: "njskcc",
      status: "success"
    });
    await db("credits").insert({
      id: "5587d202-580b-46cb-a58f-37344694130a",
      owner: "3eb4baee-1a79-11ed-a1d4-1458d0166666",
      amount: 50000,
      type: "cardPayment",
      sender: "3eb4baee-1a79-11ed-a1d4-1458d0166666",
      reference: "njskcc",
      status: "success"
    });
  });
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
  it("returns all credits", (done) => {
    chai
      .request(server)
      .get("/api/v1/credits")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        const { body } = res;
        const { data } = body;
        expect(body.statusCode).to.equal(200);
        expect(body.message).to.equal("Successfully retrived all Credit Transactions.");

        data.forEach((credits: ICredit[]) => {
          expect(credits).to.have.property("id");
          expect(credits).to.have.property("owner");
          expect(credits).to.have.property("amount");
          expect(credits).to.have.property("type");
          expect(credits).to.have.property("sender");
          expect(credits).to.have.property("reference");
          expect(credits).to.have.property("status");
        });

        expect(data).to.be.an("array");
        done();
      });
  });

  it("returns credit with specific id", (done) => {
    chai
      .request(server)
      .get("/api/v1/credits/5587d202-580b-46cb-a58f-37344694130a")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        const { body } = res;
        const { data } = body;
        expect(body.statusCode).to.equal(200);
        expect(body.message).to.equal("Successfully retrived Transaction.");
        expect(data).to.have.property("id");
        expect(data).to.have.property("owner");
        expect(data).to.have.property("amount");
        expect(data).to.have.property("type");
        expect(data).to.have.property("sender");
        expect(data).to.have.property("reference");
        expect(data).to.have.property("status");

        expect(data).to.be.an("object");
        done();
      });
  });
});
