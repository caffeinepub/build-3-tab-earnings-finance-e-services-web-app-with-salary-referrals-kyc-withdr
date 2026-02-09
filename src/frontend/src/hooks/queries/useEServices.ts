import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { EServiceRequest, EServiceType } from '../../backend';
import { toast } from 'sonner';

export function useMyEServiceRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<EServiceRequest[]>({
    queryKey: ['myEServiceRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyEServiceRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRequestEService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceType, requestDetails }: { serviceType: EServiceType; requestDetails: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestEService(serviceType, requestDetails);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEServiceRequests'] });
      toast.success('E-service request submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit e-service request');
    },
  });
}
