import { Request, Response } from "express";
import db from "../config/database";
import { errorResponse, successResponse, handleError } from "../utils/responses";
import Payment from "../middlewares/paystack";
import { IUser, ICredit } from "../utils/interface";

const { initializePayment } = Payment;

/**
 * @class creditController
 * @description create transaction, get all transactions, get a transaction, delete a transaction
 * @exports creditController
 */
export default class creditController {
  /**
   * @param {object} req - The user request object
   * @param {object} res - The user errorResponse object
   * @returns {object} Success message
   */
  static async addMoney(req: Request, res: Response) {
    try {
      const { id } = req.user;
      const { amount } = req.body;
      if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
        return errorResponse(res, 422, "Invalid amount.");
      }

      const user: IUser = await db("users").first().where({ id });
      if (!user) return errorResponse(res, 400, "user does not exist");
      const reference = (Math.random() + 1).toString(36).substring(7);
      await db("credits").insert({
        amount,
        type: "cardPayment",
        owner: user.id,
        sender: user.id,
        reference
      });
      const transaction = await db("credits").first().where({ reference });
      const paystack_data = {
        amount: amount * 100,
        email: user.email,
        metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          userId: user.id,
          transactionId: transaction.id,
        },
      };
      const paymentDetails = await initializePayment(paystack_data);

      return successResponse(res, 201, "Transaction Created", paymentDetails);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error.");
    }
  }

  /**
   * @param {object} req - The user request object
   * @param {object} res - The user errorResponse object
   * @returns {object} Success message
   */
  static async verify(req: Request, res: Response) {
    try {
      const { data } = req.body;
      // const { trxref } = req.query;
      // if (!trxref) return errorResponse(res, 404, "No transaction reference found.");

      // const resp: any = await verifyPayment(trxref as string);
      // const { data } = resp.data;
      const transaction: ICredit = await db("credits").first().where({ id: data.metadata.transactionId });

      if (!transaction) {
        return errorResponse(res, 404, "Transaction record not found, please contact support");
      }
      await db("credits").where({
        id: data.metadata.transactionId
      }).update({ reference: data.reference });

      if (transaction.status !== "pending" && transaction.status !== "failed") {
        return errorResponse(res, 400, "Transaction already settled");
      }
      if (["success", "successful"].includes(data.status)) {
        const amount = data.amount / 100;
        await db("users").where({
          id: transaction.owner
        }).increment("balance", amount);
        await db("credits").where({
          id: data.metadata.transactionId
        }).update({ status: data.status });
        const Transaction = await db("credits").first().where({ id: data.metadata.transactionId });
        return successResponse(res, 200, "Transaction verified Successfully.", Transaction);
      }
      return errorResponse(res, 400, "Transaction could not be verified, please try again");
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error.");
    }
  }

  /**
     * @param {object} req - The user request object
     * @param {object} res - The user errorResponse object
     * @returns {object} Success message
     */
  static async getUserCredits(req: Request, res: Response) {
    try {
      const { id } = req.user;
      const transactions = await db("credits").where({ owner: id });
      return successResponse(res, 200, "Successfully retrived all Credit Transactions.", transactions);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error.");
    }
  }

  /**
     * @param {object} req - The user request object
     * @param {object} res - The user errorResponse object
     * @returns {object} Success message
     */
  static async getUserCreditById(req: Request, res: Response) {
    try {
      const { creditId } = req.params;
      const { id } = req.user;
      const transaction = await db("credits").first().where({ id: creditId, owner: id });
      if (!transaction) return errorResponse(res, 404, "Transaction not found");
      return successResponse(res, 200, "Successfully retrived Transaction.", transaction,);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Resource not found.");
    }
  }

  /**
     * @param {object} req - The user request object
     * @param {object} res - The user errorResponse object
     * @returns {object} Success message
     */
  static async deleteCreditTransaction(req: Request, res: Response) {
    try {
      const { creditId } = req.params;
      const { id } = req.user;
      const transaction = await db("credits").first().where({ id: creditId, owner: id });
      if (!transaction) return errorResponse(res, 404, "Transaction not found.");
      await db("credits").where({ id: creditId }).del();
      return successResponse(res, 200, "Successfully Deleted transaction.");
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Resource not found.");
    }
  }
}
