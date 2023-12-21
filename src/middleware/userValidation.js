const joi = require('joi');

const schemas = {
  register: joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().allow(null).optional(),
    profilePicture: joi.string().allow(null).optional(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    accessToken: joi.string().allow(null).optional(),
  }),
  update: joi.object({
    firstName: joi.string().optional(),
    lastName: joi.string().allow(null).optional(),
    profilePicture: joi.string().allow(null).optional(),
  }),
  change: joi.object({
    oldPassword: joi.string().min(8).required(),
    newPassword: joi.string().min(8).required(),
  }),
};

const userValidation = (data, operationType) => {
  const { error: validationError, value: validatedData } = schemas[operationType].validate(data);

  if (validationError) {
    const errorMessages = validationError.details.map(
      (detail) => detail.message,
    );
    throw new Error(
      JSON.stringify({
        status: 400,
        message: 'Validation error',
        error: errorMessages,
      }),
    );
  }

  return { ...validatedData };
};

module.exports = userValidation;
