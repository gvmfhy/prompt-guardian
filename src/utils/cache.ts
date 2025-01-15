import { APIResponse } from '@/types/beast';

const promptCache = new Map<string, APIResponse>();

export function getCachedResponse(prompt: string): APIResponse | undefined {
  return promptCache.get(prompt);
}

export function setCachedResponse(prompt: string, response: APIResponse) {
  promptCache.set(prompt, response);
}