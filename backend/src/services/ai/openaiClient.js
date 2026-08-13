import OpenAI from 'openai';
import config from '../../config/env.js';

let openai = null;

if (config.openaiApiKey) {
  openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });
}

export const getOpenAIInstance = () => openai;

export const generateAICompletion = async (prompt, systemPrompt = 'You are an AI Hiring Assistant.', jsonMode = false) => {
  if (!openai) {
    return null; // Return null so fallbacks trigger gracefully
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Completion Error:', error.message);
    return null;
  }
};

export default { getOpenAIInstance, generateAICompletion };
