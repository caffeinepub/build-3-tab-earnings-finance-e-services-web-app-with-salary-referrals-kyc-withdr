import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { ExternalBlob } from '../../backend';
import { toast } from 'sonner';

export function useMyDocuments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, string, boolean]>>({
    queryKey: ['myDocuments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDocuments();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUploadSensitiveDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentType, encryptedContent }: { documentType: string; encryptedContent: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadSensitiveDocument(documentType, encryptedContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDocuments'] });
      toast.success('Document uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload document');
    },
  });
}
