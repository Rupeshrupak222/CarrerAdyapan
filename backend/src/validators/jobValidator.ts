import Joi from 'joi';

export const createJobSchema = Joi.object({
  title: Joi.string().required().min(3).max(150),
  department: Joi.string().required(),
  description: Joi.string().required().min(20),
  requirements: Joi.string().allow('', null).optional(),
  responsibilities: Joi.string().allow('', null),
  type: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE').default('FULL_TIME'),
  experienceLevel: Joi.string().required(),
  salaryMin: Joi.number().optional().allow(null),
  salaryMax: Joi.number().optional().allow(null),
  location: Joi.string().required(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED').default('DRAFT'),
  interviewRounds: Joi.array().optional().allow(null),
  totalRounds: Joi.number().optional().allow(null),
});

export const updateJobSchema = createJobSchema.fork(
  ['title', 'department', 'description', 'requirements', 'experienceLevel', 'location', 'status', 'type', 'responsibilities', 'salaryMin', 'salaryMax', 'interviewRounds', 'totalRounds'],
  (schema) => schema.optional()
);
