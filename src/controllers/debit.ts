import { Request, Response } from "express";
import { errorResponse, successResponse, handleError } from "../utils/responses";
import db from "../config/database";
import { IUser } from "../utils/interface";

// let knex_populate = require("knex-populate");

/**
 * @class AdmintransactionController
 * @description create transaction, get all transactions, get a transaction, delete a transaction
 * @exports AdminController
 */
export default class AdminDebitController {
  /**
     * @param {object} req - The user request object
     * @param {object} res - The user response object
     * @returns {object} Success message
     */
  static async sendMoney(req: Request, res: Response): Promise<object> {
    try {
      const { id } = req.user;
      const { amount, email } = req.body;
      if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
        return errorResponse(res, 422, "Invalid amount.");
      }

      const user: IUser = await db("users").first().where({ id });
      if (!user) return errorResponse(res, 400, "user does not exist");

      const receiver: IUser = await db("users").first().where({ email });
      if (!receiver) return errorResponse(res, 400, "Receiver account does not exist");

      if (user.balance < amount) return errorResponse(res, 409, "Insufficient funds.");

      const reference = (Math.random() + 1).toString(36).substring(7);
      await db("credits").insert({
        amount,
        type: "transfer",
        owner: id,
        sender: id,
        status: "success",
        reference
      });
      await db("debits").insert({
        amount,
        type: "transfer",
        owner: receiver.id,
        sender: id,
        status: "successful"
      });

      await db("users").where({
        id
      }).increment("balance", -amount);
      await db("users").where({
        id: receiver.id
      }).increment("balance", amount);
      return successResponse(res, 200, "Money transfered successfully.");
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error.");
    }
  }

  /**
     * @param {object} req - The user request object
     * @param {object} res - The user response object
     * @returns {object} Success message
     */
  static async getDebitTransactions(req: Request, res: Response): Promise<object> {
    try {
      const { id } = req.user;
      const transactions = await db("debits").where({ owner: id });
      return successResponse(res, 200, "Successfully retrived all Debit Transactions.", transactions);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error.");
    }
  }

  /**
     * @param {object} req - The user request object
     * @param {object} res - The user response object
     * @returns {object} Success message
     */
  static async getDebitTransactionById(req: Request, res: Response): Promise<object> {
    try {
      const { debitId } = req.params;
      const { id } = req.user;
      const transaction = await db("debits").first().where({ id: debitId, owner: id });
      if (!transaction) return errorResponse(res, 404, "Transaction not found");
      return successResponse(res, 200, "Successfully retrived Transaction.", transaction);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Resource not found.");
    }
  }

  /**
     * @param {object} req - The user request object
     * @param {object} res - The user response object
     * @returns {object} Success message
     */
  static async deleteDebitTransaction(req: Request, res: Response): Promise<object> {
    try {
      const { debitId } = req.params;
      const { id } = req.user;
      const transaction = await db("debits").first().where({ id: debitId, owner: id });
      if (!transaction) return errorResponse(res, 404, "Transaction not found.");
      await db("debits").where({ id: debitId }).del();
      return successResponse(res, 200, "Successfully Deleted transaction.");
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Resource not found.");
    }
  }

  /**
     * @param {object} req - The user request object
     * @param {object} res - The user response object
     * @returns {object} Success message
     */
  static async requestWithdrawal(req: Request, res: Response): Promise<object> {
    try {
      const { id } = req.user;
      const { accountId, amount } = req.body;
      const user = await db("users").first().where({ id });
      if (!user) return errorResponse(res, 404, "User does not exist.");
      const account = await db("accounts").first().where({ id: accountId });
      if (!account) return errorResponse(res, 404, "Account does not exist kindly add your bank details.");
      if (amount > user.balance) return errorResponse(res, 409, "Insufficient funds.");
      await db("users").where({ id }).increment("balance", -amount);
      await db("debits").insert({
        owner: id, amount, type: "withdrawal", status: "successful"
      });
      return successResponse(res, 200, "Withdrawal request sent successfully.", { amount, account });
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Resource not found.");
    }
  }
}
