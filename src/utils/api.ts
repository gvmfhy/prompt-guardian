import { APIResponse } from '@/types/beast';
import { calculateScore, isRefused } from './scoring';
import { getCachedResponse, setCachedResponse } from './cache';

const API_ENDPOINT = 'https://api.perplexity.ai/chat/completions';

export async function queryLLM(prompt: string, apiKey: string): Promise<APIResponse> {
  // Check cache first
  const cached = getCachedResponse(prompt);
  if (cached) {
    console.log(`[Cache Hit] Using cached response for prompt: "${prompt.substring(0, 50)}..."`);
    return cached;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
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
      const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
      console.error('API Error Response:', errorData);
      throw new Error(errorData.error || 'API request failed');
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    const scoredResponse: APIResponse = {
      success: true,
      response: responseText,
      score: calculateScore(responseText),
      refused: isRefused(responseText),
    };

    // Cache the response
    setCachedResponse(prompt, scoredResponse);
    console.log(`[Cache Miss] Caching new response for prompt: "${prompt.substring(0, 50)}..."`);

    return scoredResponse;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}