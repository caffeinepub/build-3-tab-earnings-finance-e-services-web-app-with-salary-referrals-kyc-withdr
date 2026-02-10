import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { TapToEarnState } from '../../backend';
import { toast } from 'sonner';
import { useTapBatching } from '../useTapBatching';
import { t } from '../../i18n';

export function useGetTapToEarnState() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TapToEarnState>({
    queryKey: ['tapToEarnState'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTapToEarnState();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: false,
  });
}

export function useRegisterTap() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (arg: null) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerTap(arg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tapToEarnState'] });
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.tapError'));
    },
  });
}

export function useBatchedTapToEarn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const batching = useTapBatching({
    flushInterval: 2000,
    maxBatchSize: 100,
    onFlush: async (count: number) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerTaps(BigInt(count));
    },
    onError: (error: Error) => {
      console.error('Batch flush error:', error);
      toast.error(error.message || t('errors.tapError'));
    },
  });

  const tap = () => {
    batching.enqueueTap();
  };

  const getEffectiveState = (): TapToEarnState | null => {
    const serverState = queryClient.getQueryData<TapToEarnState>(['tapToEarnState']);
    return serverState || null;
  };

  return {
    tap,
    flush: batching.flush,
    getPendingCount: batching.getPendingCount,
    getEffectiveState,
    isFlushingRef: batching.isFlushingRef,
  };
}

export function useClaimTapToEarnCoins() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (arg: null) => {
      if (!actor) throw new Error('Actor not available');
      const creditedCents = await actor.claimTapToEarnCoins(arg);
      return creditedCents;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tapToEarnState'] });
      queryClient.invalidateQueries({ queryKey: ['myBalance'] });
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.claimError'));
    },
  });
}
