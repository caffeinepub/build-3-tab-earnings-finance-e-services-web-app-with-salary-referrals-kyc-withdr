import { useState } from 'react';
import { useStartTask, useSubmitTaskCompletion } from '../../hooks/queries/useTasks';
import { useBanStatus } from '../../hooks/queries/useBanStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Task } from '../../backend';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
}

export function TaskDetail({ task, onBack }: TaskDetailProps) {
  const [proof, setProof] = useState('');
  
  const { data: banStatus } = useBanStatus();
  const startTask = useStartTask();
  const submitCompletion = useSubmitTaskCompletion();

  const isBanned = banStatus !== null;

  const handleStart = async () => {
    if (isBanned) return;
    await startTask.mutateAsync(task.id);
  };

  const handleSubmit = async () => {
    if (isBanned) return;

    if (!proof.trim()) {
      return;
    }

    await submitCompletion.mutateAsync({ taskId: task.id, proof });
    setProof('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tasks
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-[oklch(0.75_0.20_85)] to-[oklch(0.80_0.18_85)] text-lg px-4 py-2">
              ${(Number(task.rewardCents) / 100).toFixed(2)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isBanned && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your account is banned. You cannot complete tasks.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <h4 className="font-semibold mb-2">How to complete:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click "Start Task" to begin</li>
              <li>Complete the required action</li>
              <li>Provide proof of completion</li>
              <li>Submit to receive your reward</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="proof">Proof of Completion</Label>
              <Input
                id="proof"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="Enter proof (e.g., screenshot URL, confirmation code)"
                disabled={isBanned}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide evidence that you completed the task
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleStart}
                variant="outline"
                disabled={startTask.isPending || isBanned}
                className="flex-1"
              >
                {startTask.isPending ? 'Starting...' : 'Start Task'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!proof.trim() || submitCompletion.isPending || isBanned}
                className="flex-1 bg-gradient-to-r from-[oklch(0.55_0.25_264)] to-[oklch(0.75_0.20_85)]"
              >
                {submitCompletion.isPending ? 'Submitting...' : 'Submit Completion'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
