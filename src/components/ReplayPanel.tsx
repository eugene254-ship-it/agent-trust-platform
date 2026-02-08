import type { ReplaySession, SimSnapshot } from '@/types/simulation';
import { Play, Square, Film, Trophy, Clock, Brain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReplayPanelProps {
  isRecording: boolean;
  sessions: ReplaySession[];
  replaySession: ReplaySession | null;
  replayIndex: number;
  isReplaying: boolean;
  currentSnapshot: SimSnapshot | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStartReplay: (session: ReplaySession) => void;
  onStopReplay: () => void;
  onSeek: (index: number) => void;
}

export function ReplayPanel({
  isRecording,
  sessions,
  replaySession,
  replayIndex,
  isReplaying,
  currentSnapshot,
  onStartRecording,
  onStopRecording,
  onStartReplay,
  onStopReplay,
  onSeek,
}: ReplayPanelProps) {
  return (
    <div className="space-y-2">
      {/* Record controls */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isRecording ? 'destructive' : 'secondary'}
          onClick={isRecording ? onStopRecording : onStartRecording}
          className="font-mono text-xs gap-1.5"
          disabled={isReplaying}
        >
          {isRecording ? (
            <>
              <Square className="w-3 h-3" />
              <span className="animate-pulse-glow">● REC</span>
            </>
          ) : (
            <>
              <Film className="w-3 h-3" />
              RECORD
            </>
          )}
        </Button>

        {isReplaying && (
          <Button size="sm" variant="secondary" onClick={onStopReplay} className="font-mono text-xs gap-1.5">
            <Square className="w-3 h-3" />
            STOP REPLAY
          </Button>
        )}
      </div>

      {/* Timeline scrubber during replay */}
      {isReplaying && replaySession && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-primary">REPLAY MODE</span>
            <span className="text-xs font-mono text-muted-foreground">
              Frame {replayIndex + 1} / {replaySession.snapshots.length}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={replaySession.snapshots.length - 1}
            value={replayIndex}
            onChange={e => onSeek(parseInt(e.target.value))}
            className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
          />
          {currentSnapshot && (
            <div className="flex gap-3 text-xs font-mono text-muted-foreground">
              <span>Tick: {currentSnapshot.tick}</span>
              <span>Failures: {currentSnapshot.activeFailures}</span>
              <span>Completion: {currentSnapshot.metrics.taskCompletionRate.toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Saved sessions */}
      {sessions.length > 0 && !isReplaying && (
        <div className="space-y-1">
          <span className="text-xs font-mono text-muted-foreground uppercase">Saved Sessions</span>
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => onStartReplay(session)}
              className="w-full rounded-md border border-border p-2 text-left hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={`w-3.5 h-3.5 ${session.score > 700 ? 'text-success' : session.score > 400 ? 'text-accent' : 'text-critical'}`} />
                  <span className="text-sm font-mono font-bold">{session.score}</span>
                  <span className="text-xs text-muted-foreground font-mono">pts</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {session.snapshots.length} frames
                </span>
              </div>
              <div className="flex gap-3 mt-1 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round((session.endTime - session.startTime) / 1000)}s
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  {session.totalDecisions} decisions
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {session.totalFailures} failures
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
