import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { WithdrawRequest, WithdrawMethod } from '../../backend';
import { toast } from 'sonner';

export function useMyWithdrawalRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WithdrawRequest[]>({
    queryKey: ['myWithdrawalRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyWithdrawalRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRequestWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amountCents, method }: { amountCents: bigint; method: WithdrawMethod }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestWithdrawal(amountCents, method);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWithdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myBalance'] });
      toast.success('Withdrawal request submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit withdrawal request');
    },
  });
}
