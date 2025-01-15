import { BeamSearchResult } from "@/types/beast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface BeamResultsProps {
  results: BeamSearchResult[];
}

export function BeamResults({ results }: BeamResultsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Beam Search Results</h2>
      <ScrollArea className="h-[500px] rounded-md border">
        {results.map((result) => (
          <div key={result.timestamp} className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">
                Iteration {result.iteration + 1}
              </h3>
              <span className="text-sm text-muted-foreground">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="w-[100px]">Score</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.prompts.map((prompt, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">
                      {prompt.text}
                    </TableCell>
                    <TableCell>
                      <Badge variant={prompt.score > 5 ? "destructive" : "secondary"}>
                        {prompt.score.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {prompt.refused ? (
                        <Badge variant="destructive">Refused</Badge>
                      ) : (
                        <Badge variant="success">Accepted</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[400px] whitespace-normal">
                      {prompt.response}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}