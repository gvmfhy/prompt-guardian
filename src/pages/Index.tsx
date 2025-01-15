import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Prompt, BeamSearchResult } from '@/types/beast';
import { transformPrompt, TRANSFORMATION_TYPES } from '@/utils/transformations';
import { queryLLM } from '@/utils/api';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [initialPrompt, setInitialPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [results, setResults] = useState<BeamSearchResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runBeamSearch = async () => {
    if (!initialPrompt.trim() || !apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter both a prompt and an API key",
        variant: "destructive"
      });
      return;
    }
    
    setIsRunning(true);
    const maxIterations = 3;
    const beamWidth = 3;
    
    let currentPrompts: Prompt[] = [{
      text: initialPrompt,
      score: 0
    }];

    try {
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        const newCandidates: Prompt[] = [];

        for (const prompt of currentPrompts) {
          const apiResponse = await queryLLM(prompt.text, apiKey);
          
          if (!apiResponse.success) {
            toast({
              title: "API Error",
              description: apiResponse.error,
              variant: "destructive"
            });
            continue;
          }

          newCandidates.push({
            text: prompt.text,
            score: apiResponse.score || 0,
            response: apiResponse.response,
            refused: apiResponse.refused
          });

          for (const type of TRANSFORMATION_TYPES) {
            const transformedText = transformPrompt(prompt.text, type);
            const transformedResponse = await queryLLM(transformedText, apiKey);
            
            if (transformedResponse.success) {
              newCandidates.push({
                text: transformedText,
                score: transformedResponse.score || 0,
                response: transformedResponse.response,
                refused: transformedResponse.refused
              });
            }
          }
        }

        newCandidates.sort((a, b) => b.score - a.score);
        currentPrompts = newCandidates.slice(0, beamWidth);

        setResults(prev => [...prev, {
          prompts: [...currentPrompts],
          iteration,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during beam search",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
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
        <h2 className="text-xl font-semibold mb-2">Configuration</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1">Perplexity API Key</label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Perplexity API key..."
              className="mb-4"
            />
          </div>
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-1">Initial Prompt</label>
            <Textarea
              id="prompt"
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder="Enter your initial prompt..."
              className="mb-4"
            />
          </div>
          <Button 
            onClick={runBeamSearch}
            disabled={isRunning || !initialPrompt.trim() || !apiKey.trim()}
          >
            {isRunning ? 'Running...' : 'Run Beam Search'}
          </Button>
        </div>
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
                  <p className="mb-1"><strong>Response:</strong> {prompt.response}</p>
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