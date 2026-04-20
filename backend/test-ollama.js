import dotenv from 'dotenv';
dotenv.config();
import { generateJSON } from './src/services/geminiService.js';

async function test() {
  console.log('Testing generateJSON with USE_LOCAL_LLM =', process.env.USE_LOCAL_LLM);
  try {
    const res = await generateJSON('Return {"test": true}');
    console.log('Result:', res);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
