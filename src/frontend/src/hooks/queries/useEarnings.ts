import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';

export function useMyBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['myBalance'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getMyBalance();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useReferralBonus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['referralBonus'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.calculateReferralBonus();
    },
    enabled: !!actor && !actorFetching,
  });
}
