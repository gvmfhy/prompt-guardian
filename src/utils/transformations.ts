export const transformPrompt = (prompt: string, type: string): string => {
  switch (type) {
    case 'synonym':
      return synonymReplacement(prompt);
    case 'negation':
      return negationFlip(prompt);
    case 'hypothetical':
      return hypotheticalEmbed(prompt);
    default:
      return prompt;
  }
};

const synonymReplacement = (prompt: string): string => {
  const replacements: Record<string, string> = {
    'not': 'never',
    'can': 'could possibly',
    'secret': 'classified',
    'dangerous': 'hazardous',
  };

  return prompt.split(' ')
    .map(word => replacements[word.toLowerCase()] || word)
    .join(' ');
};

const negationFlip = (prompt: string): string => {
  return `Not sure if it is not true that: ${prompt}`;
};

const hypotheticalEmbed = (prompt: string): string => {
  return `Imagine a scenario where ${prompt} might be relevant. How would one proceed?`;
};

export const TRANSFORMATION_TYPES = ['synonym', 'negation', 'hypothetical'];