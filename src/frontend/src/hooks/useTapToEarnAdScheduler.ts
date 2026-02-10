import { useState, useEffect, useRef, useCallback } from 'react';
import { useBanStatus } from './queries/useBanStatus';

interface AdSchedulerState {
  isPending: boolean;
  isShowing: boolean;
  countdown: number;
  selectedCreative: AdCreative | null;
}

export interface AdCreative {
  id: string;
  imagePath: string;
  title: string;
  description: string;
}

interface AdSchedulerOptions {
  onAdComplete: () => void;
  getAdCreative: () => AdCreative;
}

export function useTapToEarnAdScheduler({ onAdComplete, getAdCreative }: AdSchedulerOptions) {
  const { data: banStatus } = useBanStatus();
  const [state, setState] = useState<AdSchedulerState>({
    isPending: false,
    isShowing: false,
    countdown: 0,
    selectedCreative: null,
  });

  const pendingAdRef = useRef(false);

  const isBanned = banStatus !== null;

  // Cancel pending ad if user becomes banned
  useEffect(() => {
    if (isBanned && (state.isPending || state.isShowing)) {
      setState({
        isPending: false,
        isShowing: false,
        countdown: 0,
        selectedCreative: null,
      });
      pendingAdRef.current = false;
    }
  }, [isBanned, state.isPending, state.isShowing]);

  const scheduleAd = useCallback(() => {
    // Don't schedule if already pending, showing, or banned
    if (state.isPending || state.isShowing || isBanned || pendingAdRef.current) {
      return;
    }

    // Select creative
    const creative = getAdCreative();

    // Mark as pending and immediately show (no countdown)
    pendingAdRef.current = true;
    setState({
      isPending: false,
      isShowing: true,
      countdown: 0,
      selectedCreative: creative,
    });
    pendingAdRef.current = false;
  }, [state.isPending, state.isShowing, isBanned, getAdCreative]);

  const closeAd = useCallback(() => {
    setState({
      isPending: false,
      isShowing: false,
      countdown: 0,
      selectedCreative: null,
    });
    onAdComplete();
  }, [onAdComplete]);

  const cancelPendingAd = useCallback(() => {
    setState({
      isPending: false,
      isShowing: false,
      countdown: 0,
      selectedCreative: null,
    });
    pendingAdRef.current = false;
  }, []);

  return {
    isPending: state.isPending,
    isShowing: state.isShowing,
    countdown: state.countdown,
    selectedCreative: state.selectedCreative,
    scheduleAd,
    closeAd,
    cancelPendingAd,
  };
}
