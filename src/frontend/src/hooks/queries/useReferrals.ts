import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Referral } from '../../backend';
import { toast } from 'sonner';

export function useMyReferralCode() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['myReferralCode'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getMyReferralCode();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMyReferrals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Referral[]>({
    queryKey: ['myReferrals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyReferrals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRegisterReferral() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (referrerCode: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerReferral(referrerCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReferrals'] });
      toast.success('Referral registered successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register referral');
    },
  });
}
