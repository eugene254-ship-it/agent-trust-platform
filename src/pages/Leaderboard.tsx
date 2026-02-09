import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Trophy, ArrowLeft, Brain, AlertTriangle, Clock, Zap, TrendingUp, Activity } from 'lucide-react';
import type { SimMetrics } from '@/types/simulation';

interface LeaderboardEntry {
  id: string;
  sessionId: string;
  score: number;
  totalDecisions: number;
  totalFailures: number;
  startTime: number;
  endTime: number;
  finalMetrics: SimMetrics;
  createdAt: string;
}

const MEDAL_COLORS = ['text-accent', 'text-muted-foreground', 'text-accent/60'];

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('replay_sessions')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (error) { console.warn('Leaderboard load error:', error); return; }
      if (data) {
        setEntries(data.map((row: any) => ({
          id: row.id,
          sessionId: row.session_id,
          score: row.score,
          totalDecisions: row.total_decisions,
          totalFailures: row.total_failures,
          startTime: Number(row.start_time),
          endTime: Number(row.end_time),
          finalMetrics: row.final_metrics as SimMetrics,
          createdAt: row.created_at,
        })));
      }
    } catch (e) {
      console.warn('Leaderboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  const maxScore = entries.length > 0 ? Math.max(...entries.map(e => e.score)) : 1000;

  return (
    <div className="min-h-screen bg-background grid-overlay">
      <div className="fixed inset-0 scanline pointer-events-none z-50" />

      {/* Header */}
      <header className="border-b border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-mono font-bold text-sm tracking-widest text-primary text-glow-primary">
            SANCTUM-SIM
          </h1>
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">LEADERBOARD</span>
        </div>
        <Link to="/" className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO SIM
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-accent" />
          <h2 className="font-mono font-bold text-lg sm:text-xl text-foreground">Session Rankings</h2>
          <span className="text-xs font-mono text-muted-foreground ml-auto">{entries.length} sessions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-sm font-mono text-muted-foreground animate-pulse-glow">Loading sessions...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-mono text-muted-foreground">No sessions recorded yet</p>
            <Link to="/" className="text-xs font-mono text-primary hover:underline">Start a simulation →</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Leaderboard list */}
            <div className="flex-1 space-y-1.5">
              {entries.map((entry, i) => {
                const duration = Math.round((entry.endTime - entry.startTime) / 1000);
                const isSelected = selected?.id === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelected(isSelected ? null : entry)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className="w-8 text-center flex-shrink-0">
                        {i < 3 ? (
                          <Trophy className={`w-4 h-4 mx-auto ${MEDAL_COLORS[i]}`} />
                        ) : (
                          <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
                        )}
                      </div>

                      {/* Score + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-lg font-mono font-bold text-foreground">{entry.score}</span>
                          <span className="text-xs font-mono text-muted-foreground">pts</span>
                        </div>
                        <ScoreBar value={entry.score} max={maxScore} color="bg-primary/60" />
                      </div>

                      {/* Quick stats */}
                      <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground flex-shrink-0">
                        <span className="flex items-center gap-1">
                          <Brain className="w-3 h-3" />{entry.totalDecisions}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />{entry.totalFailures}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{duration}s
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="lg:w-[320px] rounded-lg border border-border bg-card p-4 space-y-4 lg:sticky lg:top-4 self-start">
                <div className="flex items-center gap-2">
                  <Trophy className={`w-5 h-5 ${selected.score > 700 ? 'text-success' : selected.score > 400 ? 'text-accent' : 'text-critical'}`} />
                  <span className="text-2xl font-mono font-bold text-foreground">{selected.score}</span>
                  <span className="text-xs font-mono text-muted-foreground">points</span>
                </div>

                <div className="text-xs font-mono text-muted-foreground">
                  {new Date(selected.createdAt).toLocaleString()}
                </div>

                {/* Metric breakdown */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Performance Breakdown</h3>

                  {[
                    { icon: TrendingUp, label: 'Task Completion', value: selected.finalMetrics.taskCompletionRate, unit: '%', max: 100, color: 'bg-primary/60' },
                    { icon: Zap, label: 'Energy Efficiency', value: selected.finalMetrics.energyEfficiency, unit: '%', max: 100, color: 'bg-success/60' },
                    { icon: Activity, label: 'Uptime', value: selected.finalMetrics.uptimePercent, unit: '%', max: 100, color: 'bg-info/60' },
                    { icon: Clock, label: 'Mean Recovery', value: selected.finalMetrics.meanRecoveryTime, unit: 's', max: 12, color: 'bg-accent/60' },
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs font-mono text-foreground/70">
                          <metric.icon className="w-3 h-3" />
                          {metric.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-foreground">
                          {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}{metric.unit}
                        </span>
                      </div>
                      <ScoreBar value={typeof metric.value === 'number' ? metric.value : 0} max={metric.max} color={metric.color} />
                    </div>
                  ))}
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div className="rounded-md border border-border p-2">
                    <span className="text-xs font-mono text-muted-foreground block">Decisions</span>
                    <span className="text-lg font-mono font-bold text-foreground">{selected.totalDecisions}</span>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <span className="text-xs font-mono text-muted-foreground block">Failures</span>
                    <span className="text-lg font-mono font-bold text-foreground">{selected.totalFailures}</span>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <span className="text-xs font-mono text-muted-foreground block">Duration</span>
                    <span className="text-lg font-mono font-bold text-foreground">
                      {Math.round((selected.endTime - selected.startTime) / 1000)}s
                    </span>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <span className="text-xs font-mono text-muted-foreground block">Latency</span>
                    <span className="text-lg font-mono font-bold text-foreground">
                      {typeof selected.finalMetrics.decisionLatency === 'number' ? selected.finalMetrics.decisionLatency.toFixed(2) : '—'}s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
