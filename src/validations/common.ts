import Joi from "joi";

const objectId = Joi.string()
  .length(36);

export default objectId;
