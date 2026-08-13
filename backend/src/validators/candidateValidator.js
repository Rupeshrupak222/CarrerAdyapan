import Joi from 'joi';

export const createCandidateSchema = Joi.object({
  firstName: Joi.string().required().min(1).max(50),
  lastName: Joi.string().required().min(1).max(50),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
  resumeUrl: Joi.string().allow('', null),
  totalExperience: Joi.number().optional().allow(null),
  currentCompany: Joi.string().allow('', null),
  currentPosition: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  linkedin: Joi.string().allow('', null),
  portfolio: Joi.string().allow('', null),
  skills: Joi.array().items(Joi.string()).default([]),
});

export const updateCandidateSchema = createCandidateSchema.fork(
  ['firstName', 'lastName', 'email'],
  (schema) => schema.optional()
);
