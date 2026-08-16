import createJobSlug from './slugGenerator.js';

export const prepareJobForPublish = (jobData, companyName = '') => {
  const slug = createJobSlug(jobData.title, companyName);
  return {
    ...jobData,
    slug,
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
  };
};

export default { prepareJobForPublish };
