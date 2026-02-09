import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Task, TaskCompletion } from '../../backend';
import { toast } from 'sonner';

export function useTaskCatalog() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['taskCatalog'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskCatalog();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMyCompletedTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TaskCompletion[]>({
    queryKey: ['myCompletedTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyCompletedTasks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useStartTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.startTask(taskId);
    },
    onSuccess: () => {
      toast.success('Task started!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start task');
    },
  });
}

export function useSubmitTaskCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, proof }: { taskId: string; proof: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitTaskCompletion(taskId, proof);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCompletedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['myBalance'] });
      toast.success('Task completed! Reward added to your balance.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit task completion');
    },
  });
}
