import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  company: Joi.string().required().min(2),
  role: Joi.string().valid('HR', 'ADMIN', 'RECRUITER').default('HR'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
