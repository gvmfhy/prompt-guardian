import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Prompt, BeamSearchResult } from '@/types/beast';
import { transformPrompt, TRANSFORMATION_TYPES } from '@/utils/transformations';

const Index = () => {
  const [initialPrompt, setInitialPrompt] = useState('');
  const [results, setResults] = useState<BeamSearchResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runBeamSearch = async () => {
    if (!initialPrompt.trim()) return;
    
    setIsRunning(true);
    const maxIterations = 3;
    const beamWidth = 3;
    
    let currentPrompts: Prompt[] = [{
      text: initialPrompt,
      score: 0
    }];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const newCandidates: Prompt[] = [];

      // Generate transformations for each prompt in the beam
      for (const prompt of currentPrompts) {
        for (const type of TRANSFORMATION_TYPES) {
          const transformedText = transformPrompt(prompt.text, type);
          
          // In a real implementation, this would call the LLM API
          // For now, we'll simulate a response and scoring
          const mockScore = Math.random(); // Replace with real scoring logic
          const mockRefused = Math.random() > 0.7;

          newCandidates.push({
            text: transformedText,
            score: mockScore,
            refused: mockRefused
          });
        }
      }

      // Sort by score and keep top-k
      newCandidates.sort((a, b) => b.score - a.score);
      currentPrompts = newCandidates.slice(0, beamWidth);

      // Log the results
      setResults(prev => [...prev, {
        prompts: [...currentPrompts],
        iteration,
        timestamp: new Date().toISOString()
      }]);
    }

    setIsRunning(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">BEAST: Beam Search Attack Testing</h1>
      
      <Alert className="mb-4">
        <AlertDescription>
          This tool is for authorized security research only. Ensure you have proper permissions before testing any system.
        </AlertDescription>
      </Alert>

      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Initial Prompt</h2>
        <Textarea
          value={initialPrompt}
          onChange={(e) => setInitialPrompt(e.target.value)}
          placeholder="Enter your initial prompt..."
          className="mb-4"
        />
        <Button 
          onClick={runBeamSearch}
          disabled={isRunning || !initialPrompt.trim()}
        >
          {isRunning ? 'Running...' : 'Run Beam Search'}
        </Button>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        <ScrollArea className="h-[400px]">
          {results.map((result, i) => (
            <div key={i} className="mb-6">
              <h3 className="font-medium mb-2">Iteration {result.iteration + 1}</h3>
              {result.prompts.map((prompt, j) => (
                <div key={j} className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="mb-1"><strong>Prompt:</strong> {prompt.text}</p>
                  <p className="text-sm text-gray-600">Score: {prompt.score.toFixed(2)}</p>
                  {prompt.refused && (
                    <p className="text-sm text-red-500">Model refused to respond</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Index;
