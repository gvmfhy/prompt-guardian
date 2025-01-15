import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BeamResults } from '@/components/BeamResults';
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
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">BEAST: Beam Search Attack Testing</h1>
      
      <Alert className="mb-4">
        <AlertDescription>
          This tool is for authorized security research only. Ensure you have proper permissions before testing any system.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-[1fr,1fr]">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1">Perplexity API Key</label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Perplexity API key..."
              />
            </div>
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-1">Initial Prompt</label>
              <Textarea
                id="prompt"
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="Enter your initial prompt..."
                className="min-h-[100px]"
              />
            </div>
            <Button 
              onClick={runBeamSearch}
              disabled={isRunning || !initialPrompt.trim() || !apiKey.trim()}
              className="w-full"
            >
              {isRunning ? 'Running Beam Search...' : 'Start Beam Search'}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <BeamResults results={results} />
        </Card>
      </div>
    </div>
  );
};

export default Index;
