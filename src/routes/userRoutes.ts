import {Router} from "express";
import UserController from "../controllers/user";
import Authentication from "../middlewares/authenticate";
import validator from "../middlewares/validator";
import parser from "../middlewares/uploads";

import { validateSignup, validateLogin, validateAccount, profileValidation} from "../validations/user";

const router = Router();
const { verifyToken } = Authentication;
const {
  registerUser, loginUser, getUsers, updateProfile,
  uploadProfilePicture, getUserAccount, addAccount, getUserDetails
} = UserController;

router.post("/login",validator(validateLogin), loginUser);
router.post("/register",validator(validateSignup), registerUser);
router.post("/account", verifyToken,validator(validateAccount), addAccount);

router.get("/", verifyToken, getUsers);
router.get("/details", verifyToken, getUserDetails);
router.get("/account", verifyToken, getUserAccount);

router.patch("/profile", verifyToken, validator(profileValidation), updateProfile);
router.patch("/profile-picture", verifyToken, parser.single("image"), uploadProfilePicture);

export default router;
