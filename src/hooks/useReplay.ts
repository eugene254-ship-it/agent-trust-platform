import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  // Load sessions from DB on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('replay_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) { console.warn('Failed to load sessions:', error); return; }
      if (data) {
        setSessions(data.map((row: any) => ({
          id: row.session_id,
          startTime: Number(row.start_time),
          endTime: Number(row.end_time),
          snapshots: row.snapshots as SimSnapshot[],
          finalMetrics: row.final_metrics as any,
          totalDecisions: row.total_decisions,
          totalFailures: row.total_failures,
          score: row.score,
        })));
      }
    } catch (e) { console.warn('Load sessions error:', e); }
  };

  const startRecording = useCallback(() => {
    snapshotsRef.current = [];
    startTimeRef.current = Date.now();
    failureCountRef.current = 0;
    setIsRecording(true);
  }, []);

  const recordSnapshot = useCallback((state: SimulationState) => {
    if (!isRecording) return;
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

  const stopRecording = useCallback(async (finalState: SimulationState) => {
    setIsRecording(false);
    if (snapshotsRef.current.length === 0) return;

    const sessionId = `session-${Date.now()}`;
    const partial = {
      id: sessionId,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      snapshots: [...snapshotsRef.current],
      finalMetrics: { ...finalState.metrics },
      totalDecisions: finalState.metrics.totalDecisions,
      totalFailures: finalState.metrics.failuresHandled,
      score: 0,
    };
    partial.score = calculateScore(partial);
    const session = partial as ReplaySession;
    setSessions(prev => [session, ...prev].slice(0, 10));

    // Persist to DB
    try {
      await supabase.from('replay_sessions').insert({
        session_id: session.id,
        score: session.score,
        start_time: session.startTime,
        end_time: session.endTime,
        total_decisions: session.totalDecisions,
        total_failures: session.totalFailures,
        final_metrics: session.finalMetrics as any,
        snapshots: session.snapshots as any,
      });
    } catch (e) { console.warn('Failed to save session:', e); }
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

  const deleteSession = useCallback(async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    try {
      await supabase.from('replay_sessions').delete().eq('session_id', sessionId);
    } catch (e) { console.warn('Failed to delete session:', e); }
  }, []);

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
    deleteSession,
  };
}
