import chai from "chai";
import chaiHttp from "chai-http";
import db from "../../models/index";
import { user4 } from "./user-sign-in-test-data";
import { credit, credit2, credit3 } from "./credit-data";
import server from "../../app";
import { ICredit } from "../../utils/interface";

chai.should();

const { expect } = chai;
chai.use(chaiHttp);

describe("Add credit", () => {
  let userToken: string;
  before(done => {
    chai
      .request(server)
      .post("/api/v1/users/signin")
      .set("Accept", "application/json")
      .send(user4)
      .end((err, res) => {
        if (err) throw err;
        userToken = res.body.data.token;
        done();
      });
  });
  it("should allow user with token add money to his account", done => {
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
  it("should not allow user add money to his account with incomplete details", done => {
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
  it("should not allow user without token add money to his account", done => {
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
    await db.credit.deleteMany({});
    await db.credit.create({
      data: {
        id: "c375c640-81ff-405a-89a8-460ea2f71745",
        user: "1d809e97-e26e-4597-aff3-070d6bf4599d",
        amount: 40000,
        type: "card_payment",
        sender: "1d809e97-e26e-4597-aff3-070d6bf4599d",
        reference: "njskcc",
        status: "success"
      }
    });
  });
  let userToken: string;
  before(done => {
    chai
      .request(server)
      .post("/api/v1/users/signin")
      .set("Accept", "application/json")
      .send(user4)
      .end((err, res) => {
        if (err) throw err;
        userToken = res.body.data.token;
        done();
      });
  });
  it("should allow User Delete a credit Transaction", done => {
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
  it("should not allow user delete a credit with invalid ID data type", done => {
    chai
      .request(server)
      .delete("/api/v1/credits/8d58")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal("Transaction not found.");
        done();
      });
  });
  it("returns 404 when deleting credit which is not in db", done => {
    chai
      .request(server)
      .delete("/api/v1/credits/8d585465-cd80-4030-b665-bdc3bbd3e578")
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
    await db.credit.deleteMany({});
    await db.credit.create({
      data: {
        id: "c375c640-81ff-405a-89a8-460ea2f71757",
        user: "1d809e97-e26e-4597-aff3-070d6bf4599d",
        amount: 40000,
        type: "card_payment",
        sender: "1d809e97-e26e-4597-aff3-070d6bf4599d",
        reference: "njskcc",
        status: "success"
      }
    });
    await db.credit.create({
      data: {
        id: "5587d202-580b-46cb-a58f-37344694130a",
        user: "1d809e97-e26e-4597-aff3-070d6bf4599d",
        amount: 50000,
        type: "card_payment",
        sender: "1d809e97-e26e-4597-aff3-070d6bf4599d",
        reference: "njskcc",
        status: "success"
      }});
  });
  let userToken: string;
  before(done => {
    chai
      .request(server)
      .post("/api/v1/users/signin")
      .set("Accept", "application/json")
      .send(user4)
      .end((err, res) => {
        if (err) throw err;
        userToken = res.body.data.token;
        done();
      });
  });
  it("returns all credits", done => {
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
          expect(credits).to.have.property("user");
          expect(credits).to.have.property("amount");
          expect(credits).to.have.property("type");
          expect(credits).to.have.property("sender");
          expect(credits).to.have.property("reference");
          expect(credits).to.have.property("status");
        });

        expect(data).to.have.length(2);

        expect(data).to.be.an("array");
        done();
      });
  });

  it("returns credit with specific id", done => {
    chai
      .request(server)
      .get("/api/v1/credits/c375c640-81ff-405a-89a8-460ea2f71757")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        const { body } = res;
        const { data } = body;
        expect(body.statusCode).to.equal(200);
        expect(body.message).to.equal("Successfully retrived Transaction.");
        expect(data).to.have.property("id");
        expect(data).to.have.property("user");
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
