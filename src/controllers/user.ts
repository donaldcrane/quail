import bcrypt from "bcrypt";
import { Request, Response } from "express";
import db from "../config/database";
import { errorResponse, successResponse, handleError } from "../utils/responses";
import { IUser } from "../utils/interface";
import jwtHelper from "../utils/jwt";

const { generateToken } = jwtHelper;
/**
 * @class UserController
 * @description create, verify and log in user
 * @exports UserController
 */
export default class UserController {
  /**
   * @param {object} req - The user request object
   * @param {object} res - The user response object
   * @returns {object} Success message
   */
  static async registerUser(req: Request, res: Response): Promise<object> {
    try {
      const {
        email, firstName, lastName, password, phone
      } = req.body;
      const Email = email.toLowerCase();
      const EmailExist: IUser = await db("users").first("*").where({ email });
      if (EmailExist) return errorResponse(res, 409, "Email already used by another user.");
      const hashedPassword = await bcrypt.hash(password, 10);
      await db("users").insert({
        email: Email, firstName, lastName, password: hashedPassword, phone
      });
      return successResponse(res, 201, "User created Successfuly, Kindly log in!");
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
  static async loginUser(req: Request, res: Response): Promise<object> {
    try {
      const { email, password } = req.body;
      const Email = email.toLowerCase();
      const user = await db("users").first("*").where({ email }) as IUser;
      if (!user) return errorResponse(res, 404, "Email does not exist.");
      const validpass = await bcrypt.compare(password, user.password);
      if (!validpass) return errorResponse(res, 400, "Password is not correct!.");
      let { firstName, lastName, id } = user;
      const token = await generateToken({
        id, firstName, lastName, email
      });
      const loggedUser = await db.from("users").first().select("id", "firstName", "lastName", "email", "phone", "photo").where({ email: Email });
      return successResponse(res, 200, "User Logged in Successfully.", { token, loggedUser });
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error.");
    }
  }

  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async getUsers(req: Request, res: Response): Promise<object> {
    try {
      const users = await db("users").select("id", "firstName", "lastName", "email", "phone", "photo", "balance");
      return successResponse(
        res,
        200,
        "Successfully retrived all Users.",
        users
      );
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }

  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async updateProfile(req: Request, res: Response): Promise<object> {
    try {
      const { id } = req.user;
      const { firstName, lastName } = req.body;
      await db("users").where({ id })
        .update({ firstName, lastName });
      const user = await db("users").first()
        .select("id", "firstName", "lastName", "email", "phone", "photo")
        .where({ id });
      return successResponse(
        res,
        200,
        "Profile updated Successfully.",
        user
      );
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }

  /**
   * @param {object} req - The reset request object
   * @param {object} res - The reset errorResponse object
   * @returns {object} Success message
   */
  static async uploadProfilePicture(req: Request, res: Response): Promise<object> {
    try {
      const { id } = req.user;
      await db("users").where({ id })
        .update({ photo: req.file?.path });
      const user = await db("users").first()
        .select("id", "firstName", "lastName", "email", "phone", "photo")
        .where({ id });
      return successResponse(res, 200, "Picture uploaded Successfully.", user);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error");
    }
  }

  /**
     * @param {object} req - The user request object
     * @param {object} res - The user response object
     * @returns {object} Success message
     */
  static async addAccount(req: Request, res: Response): Promise<object> {
    try {
      const { id } = req.user;
      const { bankName, accountNo } = req.body;
      await db("accounts").insert({ bankName, accountNo, owner: id });
      const account = await db("accounts").first().where({ owner: id });
      return successResponse(res, 201, "Account details added successfully.", account);
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
  static async getUserAccount(req: Request, res: Response): Promise<object> {
    try {
      const { id } = req.user;
      const account = await db("accounts").where({ owner: id });
      if (!account) return errorResponse(res, 404, "account does not exist");
      return successResponse(res, 200, "Account fetched successfully.", account);
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
  static async getUserDetails(req: Request, res: Response): Promise<object> {
    try {
      const { id } = req.user;
      const user = await db("users").first().where({ id });
      if (!user) return errorResponse(res, 404, "user does not exist");
      return successResponse(res, 200, "User Details fetched successfully.", user);
    } catch (error) {
      handleError(error, req);
      return errorResponse(res, 500, "Server error.");
    }
  }
}
