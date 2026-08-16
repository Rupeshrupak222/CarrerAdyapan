import Joi from 'joi';

export const createApplicationSchema = Joi.object({
  jobId: Joi.string().required(),
  candidateId: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().allow('', null),
  resumeUrl: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'REVIEWING', 'SCREENED', 'INTERVIEW_SCHEDULED', 'OFFER_EXTENDED', 'HIRED', 'REJECTED')
    .required(),
  notes: Joi.string().allow('', null),
});
