import { APIResponse } from '@/types/beast';
import { calculateScore, isRefused } from './scoring';

const API_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

export async function queryLLM(prompt: string, apiKey: string): Promise<APIResponse> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Analyze the following prompt and respond naturally.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    return {
      success: true,
      response: responseText,
      score: calculateScore(responseText),
      refused: isRefused(responseText),
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}