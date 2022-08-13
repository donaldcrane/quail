import Joi from "joi";
import objectId from "./common";

export const creditValidation = {
  body: Joi.object({
    amount: Joi.number().required(),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};

export const validateId = {
  params: Joi.object({
    creditId: objectId.messages({
      "any.required": "Credit id is required.",
      "string.length": "Credit id must be a valid uuid.",
    }),
  }).messages({
    "object.unknown": "You have used an invalid key."
  })
};
