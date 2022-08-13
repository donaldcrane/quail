import Joi from "joi";
import objectId from "./common";

export const debitValidation = {
  body: Joi.object({
    amount: Joi.number().required(),
    email: Joi.string().email().required(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export const withdrawalValidation = {
  body: Joi.object({
    amount: Joi.number().required(),
    accountId: objectId.messages({
      "any.required": "Account id is required.",
      "string.length": "Account id must be a valid uuid.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export const validateId = {
  params: Joi.object({
    debitId: objectId.messages({
      "any.required": "Debit id is required.",
      "string.length": "Debit id must be a valid uuid.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};
