import { useState, useCallback, useRef } from 'react';
import type { SimSnapshot, ReplaySession, SimulationState } from '@/types/simulation';

function calculateScore(session: Omit<ReplaySession, 'score'>): number {
  const fm = session.finalMetrics;
  const completionScore = fm.taskCompletionRate * 2;
  const efficiencyScore = fm.energyEfficiency * 1.5;
  const uptimeScore = fm.uptimePercent * 1.5;
  const recoveryScore = Math.max(0, (10 - fm.meanRecoveryTime) * 10);
  const failurePenalty = session.totalFailures * 3;
  const decisionBonus = Math.min(session.totalDecisions * 0.5, 30);
  return Math.round(Math.max(0, Math.min(1000, completionScore + efficiencyScore + uptimeScore + recoveryScore - failurePenalty + decisionBonus)));
}

export function useReplay() {
  const [isRecording, setIsRecording] = useState(false);
  const [sessions, setSessions] = useState<ReplaySession[]>([]);
  const [replaySession, setReplaySession] = useState<ReplaySession | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const snapshotsRef = useRef<SimSnapshot[]>([]);
  const startTimeRef = useRef(0);
  const failureCountRef = useRef(0);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(() => {
    snapshotsRef.current = [];
    startTimeRef.current = Date.now();
    failureCountRef.current = 0;
    setIsRecording(true);
  }, []);

  const recordSnapshot = useCallback((state: SimulationState) => {
    if (!isRecording) return;
    // Record every 5 ticks to keep it manageable
    if (state.tick % 5 !== 0) return;
    snapshotsRef.current.push({
      tick: state.tick,
      timestamp: Date.now(),
      agents: JSON.parse(JSON.stringify(state.agents)),
      metrics: { ...state.metrics },
      activeFailures: state.activeFailures,
      decisionCount: state.decisions.length,
    });
    failureCountRef.current = state.metrics.failuresHandled;
  }, [isRecording]);

  const stopRecording = useCallback((finalState: SimulationState) => {
    setIsRecording(false);
    if (snapshotsRef.current.length === 0) return;

    const partial = {
      id: `session-${Date.now()}`,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      snapshots: [...snapshotsRef.current],
      finalMetrics: { ...finalState.metrics },
      totalDecisions: finalState.metrics.totalDecisions,
      totalFailures: finalState.metrics.failuresHandled,
      score: 0,
    };
    partial.score = calculateScore(partial);
    setSessions(prev => [partial as ReplaySession, ...prev].slice(0, 10));
  }, []);

  const startReplay = useCallback((session: ReplaySession) => {
    setReplaySession(session);
    setReplayIndex(0);
    setIsReplaying(true);
  }, []);

  const stopReplay = useCallback(() => {
    setIsReplaying(false);
    setReplaySession(null);
    setReplayIndex(0);
    if (replayTimerRef.current) clearInterval(replayTimerRef.current);
  }, []);

  const seekReplay = useCallback((index: number) => {
    if (!replaySession) return;
    setReplayIndex(Math.max(0, Math.min(index, replaySession.snapshots.length - 1)));
  }, [replaySession]);

  const currentSnapshot = replaySession?.snapshots[replayIndex] ?? null;

  return {
    isRecording,
    sessions,
    replaySession,
    replayIndex,
    isReplaying,
    currentSnapshot,
    startRecording,
    recordSnapshot,
    stopRecording,
    startReplay,
    stopReplay,
    seekReplay,
  };
}
