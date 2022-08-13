import Joi from "joi";

export const validateSignup = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(20).required(),
    lastName: Joi.string().min(2).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(16),
    phone: Joi.string().required().min(11).max(14),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export const validateLogin = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export const validateAccount = {
  body: Joi.object({
    bankName: Joi.string().required(),
    accountNo: Joi.string().required(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export const profileValidation = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(26),
    lastName: Joi.string().min(3).max(26),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};
