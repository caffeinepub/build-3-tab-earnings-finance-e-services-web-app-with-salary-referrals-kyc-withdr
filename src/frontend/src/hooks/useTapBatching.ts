import { useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { TapToEarnState } from '../backend';

interface TapBatchingOptions {
  flushInterval?: number;
  maxBatchSize?: number;
  onFlush: (count: number) => Promise<void>;
  onError?: (error: Error) => void;
}

export function useTapBatching({
  flushInterval = 2000,
  maxBatchSize = 100,
  onFlush,
  onError,
}: TapBatchingOptions) {
  const queryClient = useQueryClient();
  const pendingTapsRef = useRef(0);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFlushingRef = useRef(false);

  const flush = useCallback(async () => {
    if (isFlushingRef.current || pendingTapsRef.current === 0) return;

    const tapsToFlush = pendingTapsRef.current;
    pendingTapsRef.current = 0;
    isFlushingRef.current = true;

    // Clear any pending timer
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    try {
      await onFlush(tapsToFlush);
      // Reconcile with server state after successful flush
      await queryClient.invalidateQueries({ queryKey: ['tapToEarnState'] });
    } catch (error) {
      // On error, restore the pending taps and reconcile
      pendingTapsRef.current += tapsToFlush;
      await queryClient.invalidateQueries({ queryKey: ['tapToEarnState'] });
      if (onError) {
        onError(error as Error);
      }
    } finally {
      isFlushingRef.current = false;
    }
  }, [onFlush, onError, queryClient]);

  const enqueueTap = useCallback(() => {
    // Increment pending taps
    pendingTapsRef.current += 1;

    // Update optimistic state immediately
    queryClient.setQueryData<TapToEarnState>(['tapToEarnState'], (old) => {
      if (!old) return old;
      return {
        coinBalance: old.coinBalance + 1n,
        tapCount: old.tapCount + 1n,
      };
    });

    // Schedule flush if not already scheduled
    if (!flushTimerRef.current) {
      flushTimerRef.current = setTimeout(() => {
        flush();
      }, flushInterval);
    }

    // Force flush if we hit max batch size
    if (pendingTapsRef.current >= maxBatchSize) {
      flush();
    }
  }, [flush, flushInterval, maxBatchSize, queryClient]);

  const getPendingCount = useCallback(() => {
    return pendingTapsRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
      // Flush any remaining taps on unmount
      if (pendingTapsRef.current > 0) {
        flush();
      }
    };
  }, [flush]);

  return {
    enqueueTap,
    flush,
    getPendingCount,
    isFlushingRef,
  };
}
