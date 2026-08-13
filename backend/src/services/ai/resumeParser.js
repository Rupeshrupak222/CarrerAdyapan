import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const parseResume = async (resumeText) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser. Extract the following information in JSON format:
            - fullName
            - email
            - phone
            - skills (array)
            - workExperience (array of {company, position, duration, achievements})
            - education (array of {degree, institution, year})
            - totalExperience (in years)
            - currentCompany
            - currentPosition
            - location
            - linkedin
            - portfolio`
        },
        {
          role: "user",
          content: resumeText
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error('Resume parsing error:', error);
    throw new Error('Failed to parse resume');
  }
};