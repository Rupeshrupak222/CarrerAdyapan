export const createJobSlug = (title = '', company = '') => {
  const base = `${title} ${company}`.trim().toLowerCase();
  const slug = base
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const randomHash = Math.random().toString(36).substring(2, 7);
  return `${slug}-${randomHash}`;
};

export default createJobSlug;
