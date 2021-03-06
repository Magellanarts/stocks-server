const Joi = require('@hapi/joi');

// Registration Validation
const registrationValidation = data => {
  const schema = {
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .min(8)
      .required()
  };

  return Joi.validate(data, schema);
};

// Login Validation
const loginValidation = data => {
  const schema = {
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .min(8)
      .required()
  };

  return Joi.validate(data, schema);
};

// Get User Validation
const getUserValidation = data => {
  const schema = {
    userId: Joi.string().required()
  };

  return Joi.validate(data, schema);
};

// Add Stock Validation
const addStockValidation = data => {
  const schema = {
    symbol: Joi.required(),
    timestamp: Joi.required(),
    userId: Joi.string().required()
  };

  return Joi.validate(data, schema);
};

// Add Snapshot Validation
const addSnapshotValidation = data => {
  const schema = {
    snapshots: Joi.required(),
    userId: Joi.string().required()
  };

  return Joi.validate(data, schema);
};

module.exports.registrationValidation = registrationValidation;
module.exports.loginValidation = loginValidation;
module.exports.getUserValidation = getUserValidation;
module.exports.addStockValidation = addStockValidation;
module.exports.addSnapshotValidation = addSnapshotValidation;
