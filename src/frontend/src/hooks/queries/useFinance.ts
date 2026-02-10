import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { MicroLoanRequest, DPSRequest } from '../../backend';
import { toast } from 'sonner';
import { t } from '../../i18n';

export function useMyMicroLoanRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MicroLoanRequest[]>({
    queryKey: ['myMicroLoanRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyMicroLoanRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRequestMicroLoan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amountCents, purpose, repaymentMonths }: { amountCents: bigint; purpose: string; repaymentMonths: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestMicroLoan(amountCents, purpose, repaymentMonths);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMicroLoanRequests'] });
      toast.success(t('finance.loanSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.message || t('finance.loanError'));
    },
  });
}

export function useMyDPSRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DPSRequest[]>({
    queryKey: ['myDPSRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyDPSRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRequestDPS() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amountCents, termMonths, purpose }: { amountCents: bigint; termMonths: bigint; purpose: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestDPS(amountCents, termMonths, purpose);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDPSRequests'] });
      toast.success(t('finance.dpsSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.message || t('finance.dpsError'));
    },
  });
}
