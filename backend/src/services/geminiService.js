import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Helper for local ollama generate
async function ollamaGenerate(prompt, format = '') {
  const response = await fetch(`${process.env.LOCAL_LLM_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3',
      prompt: prompt,
      stream: false,
      format: format === 'json' ? 'json' : undefined
    })
  });
  if (!response.ok) throw new Error('Ollama connection failed');
  const data = await response.json();
  return data.response;
}

// Helper for local ollama chat
async function ollamaChat(messages) {
  const ollamaMessages = messages.map(msg => ({
    role: msg.role === 'ai' || msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
    content: msg.text || (msg.parts && msg.parts[0]?.text) || " "
  }));

  const response = await fetch(`${process.env.LOCAL_LLM_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama3',
      messages: ollamaMessages,
      stream: false
    })
  });
  if (!response.ok) throw new Error('Ollama connection failed');
  const data = await response.json();
  return data.message.content;
}

/**
 * Send a prompt to Gemini and return the text response.
 * @param {string} prompt - The prompt to send.
 * @param {object} options - Optional generation config overrides.
 * @returns {Promise<string>} - The generated text.
 */
export async function generateText(prompt, options = {}) {
  if (process.env.USE_LOCAL_LLM === 'true') {
    try {
      console.log(`[Ollama] Routing text generation to ${process.env.OLLAMA_MODEL}...`);
      return await ollamaGenerate(prompt);
    } catch (err) {
      console.warn(`[Ollama] Failed (${err.message}), falling back to Gemini...`);
    }
  }

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
  if (process.env.USE_LOCAL_LLM === 'true') {
    try {
      console.log(`[Ollama] Routing JSON generation to ${process.env.OLLAMA_MODEL}...`);
      const response = await ollamaGenerate(prompt, 'json');
      return JSON.parse(response);
    } catch (err) {
      console.warn(`[Ollama] Failed (${err.message}), falling back to Gemini JSON generation...`);
    }
  }

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
  if (process.env.USE_LOCAL_LLM === 'true') {
    try {
      console.log(`[Ollama] Routing chat to ${process.env.OLLAMA_MODEL}...`);
      return await ollamaChat(messages);
    } catch (err) {
      console.warn(`[Ollama] Failed (${err.message}), falling back to Gemini chat...`);
    }
  }

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
