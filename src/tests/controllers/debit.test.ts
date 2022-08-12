import chai from "chai";
import chaiHttp from "chai-http";
import db from "../../models/index";
import { user4, user8 } from "./user-sign-in-test-data";
import { debit, debit2, debit3 } from "./debit-data";
import server from "../../app";
import { IDebit } from "../../utils/interface";

chai.should();

const { expect } = chai;
chai.use(chaiHttp);

describe("Add debit Transaction", () => {
  let userToken: string;
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
  it("should allow user with token send money", done => {
    chai
      .request(server)
      .post("/api/v1/debits")
      .set("Authorization", `Bearer ${userToken}`)
      .set("Accept", "application/json")
      .send(debit)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.message).to.equal("Amount has been sent successfully.");
        done();
      });
  });
  it("should not allow user send money with incomplete details", done => {
    chai
      .request(server)
      .post("/api/v1/debits")
      .set("Authorization", `Bearer ${userToken}`)
      .set("Accept", "application/json")
      .send(debit2)
      .end((err, res) => {
        expect(res).to.have.status(422);
        done();
      });
  });
  it("should not allow user without token send money", done => {
    chai
      .request(server)
      .post("/api/v1/debits")
      .send(debit3)
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("Delete debit Transaction", () => {
  beforeEach(async () => {
    await db.debit.deleteMany({});
    await db.debit.create({
      data: {
      id: "c375c640-81ff-405a-89a8-460ea2f71875",
      user: "1d809e97-e26e-4597-aff3-070d6bf4599d",
      amount: 10000,
      receiver: "1857f7f4-a3e0-4bd4-b1f3-b98c045b4ed2",
      type: "transfer"
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
  it("should allow User Delete a debit Transaction", done => {
    chai
      .request(server)
      .delete("/api/v1/debits/c375c640-81ff-405a-89a8-460ea2f71875")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal("Successfully Deleted transaction.");
        done();
      });
  });
  it("should not allow user delete a debit with invalid ID data type", done => {
    chai
      .request(server)
      .delete("/api/v1/debits/8d58")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal("Transaction not found.");
        done();
      });
  });
  it("returns 404 when deleting debit which is not in db", done => {
    chai
      .request(server)
      .delete("/api/v1/debits/8d585465-cd80-4030-b665-bdc3bbd3e578")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal("Transaction not found.");
        done();
      });
  });
});

describe("GET Debit Transactions api route", () => {
  beforeEach(async () => {
    await db.debit.deleteMany({});
    await db.debit.create({
      data: { 
      id: "c375c640-81ff-405a-89a8-460ea2f71875",
      user: "1d809e97-e26e-4597-aff3-070d6bf4599d",
      amount: 10000,
      receiver: "1857f7f4-a3e0-4bd4-b1f3-b98c045b4ed2",
      type: "transfer"
    }});
    await db.debit.create({
      data: {
      id: "a430e505-937b-4908-9422-7aa57044e5b8",
      user: "1d809e97-e26e-4597-aff3-070d6bf4599d",
      amount: 6000,
      receiver: "1857f7f4-a3e0-4bd4-b1f3-b98c045b4ed2",
      type: "transfer"
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
  it("returns all debits Transactions", done => {
    chai
      .request(server)
      .get("/api/v1/debits")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        const { body } = res;
        const { data } = body;
        expect(body.statusCode).to.equal(200);
        expect(body.message).to.equal("Successfully retrived all Debit Transactions.");

        data.forEach((debits: IDebit[]) => {
          expect(debits).to.have.property("id");
          expect(debits).to.have.property("user");
          expect(debits).to.have.property("amount");
          expect(debits).to.have.property("receiver");
          expect(debits).to.have.property("type");
        });

        expect(data).to.be.an("array");
        done();
      });
  });

  it("returns debit with specific id", done => {
    chai
      .request(server)
      .get("/api/v1/debits/a430e505-937b-4908-9422-7aa57044e5b8")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        const { body } = res;
        const { data } = body;
        expect(body.statusCode).to.equal(200);
        expect(body.message).to.equal("Successfully retrived Transaction.");
        expect(data).to.have.property("id");
        expect(data).to.have.property("user");
        expect(data).to.have.property("amount");
        expect(data).to.have.property("receiver");
        expect(data).to.have.property("type");

        expect(data).to.be.an("object");
        done();
      });
  });
});
