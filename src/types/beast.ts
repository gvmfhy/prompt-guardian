export interface Prompt {
  text: string;
  score: number;
  response?: string;
  refused?: boolean;
}

export interface TransformationResult {
  originalPrompt: string;
  transformedPrompt: string;
  type: string;
}

export interface BeamSearchResult {
  prompts: Prompt[];
  iteration: number;
  timestamp: string;
}