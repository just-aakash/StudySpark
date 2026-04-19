import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-2.5-flash as per user preference (caching will handle quota)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Send a prompt to Gemini and return the text response.
 * @param {string} prompt - The prompt to send.
 * @param {object} options - Optional generation config overrides.
 * @returns {Promise<string>} - The generated text.
 */
export async function generateText(prompt, options = {}) {
  const config = {
    temperature: 0.7,
    maxOutputTokens: 2048,
    ...options,
  };

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: config,
    });

    if (!result.response) {
      throw new Error('No response from Gemini');
    }

    return result.response.text();
  } catch (error) {
    // Check for quota/rate limit errors
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('AI_QUOTA_EXCEEDED');
    }
    throw error;
  }
}

/**
 * Send a prompt and parse the JSON response from Gemini.
 * Strips markdown code fences if present.
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<object>}
 */
export async function generateJSON(prompt, options = {}) {
  const text = await generateText(prompt, {
    temperature: 0.4,  // Lower temp for more deterministic JSON
    ...options,
  });

  // Strip markdown code blocks if Gemini wraps output in ```json ... ```
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 300)}`);
  }
}

/**
 * Handle a conversational sequence with Gemini.
 * @param {Array<{role: string, text: string}>} messages - Array of message objects.
 * @param {object} options - Optional generation config overrides.
 * @returns {Promise<string>} - The generated text response.
 */
export async function generateChat(messages, options = {}) {
  const config = {
    temperature: 0.7,
    maxOutputTokens: 2048,
    ...options,
  };

  // Convert generic role names to Gemini's expected 'user' | 'model' roles
  const rawContents = messages.map(msg => {
    const parts = [];
    if (msg.text) {
      parts.push({ text: msg.text });
    }
    if (msg.file && msg.file.data && msg.file.mimeType) {
      parts.push({
        inlineData: {
          data: msg.file.data,
          mimeType: msg.file.mimeType
        }
      });
    }
    if (parts.length === 0) {
      parts.push({ text: " " });
    }

    return {
      role: msg.role === 'ai' || msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts
    };
  });

  // Gemini requires strictly alternating roles (user -> model -> user)
  const contents = [];
  rawContents.forEach((msg) => {
    if (contents.length > 0 && contents[contents.length - 1].role === msg.role) {
      contents[contents.length - 1].parts.push(...msg.parts);
    } else {
      contents.push({ role: msg.role, parts: msg.parts });
    }
  });

  try {
    const result = await model.generateContent({
      contents,
      generationConfig: config,
    });

    if (!result.response) {
      throw new Error('No response from Gemini');
    }

    return result.response.text();
  } catch (error) {
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('AI_QUOTA_EXCEEDED');
    }
    throw error;
  }
}

export default { generateText, generateJSON, generateChat };
