import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { UserBan } from '../../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useBanStatus() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserBan | null>({
    queryKey: ['banStatus', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const principal = identity.getPrincipal();
      return actor.getBanStatus(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      reason,
      banType,
    }: {
      user: Principal;
      reason: string;
      banType: { __kind__: 'permanent'; permanent: null } | { __kind__: 'temporary'; temporary: bigint };
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.banUser(user, reason, banType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banStatus'] });
    },
  });
}

export function useUnbanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unbanUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banStatus'] });
    },
  });
}
