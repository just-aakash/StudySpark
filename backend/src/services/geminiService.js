import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-1.5-flash for speed + cost efficiency
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

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: config,
  });

  return result.response.text();
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

  const result = await model.generateContent({
    contents,
    generationConfig: config,
  });

  return result.response.text();
}

export default { generateText, generateJSON, generateChat };
