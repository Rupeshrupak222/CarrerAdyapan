import fs from 'fs';

export const extractTextFromResumeFile = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return '';
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (err) {
    console.error('Error reading resume file:', err.message);
    return '';
  }
};

export default extractTextFromResumeFile;
