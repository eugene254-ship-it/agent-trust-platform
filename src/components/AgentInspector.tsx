import { useState, useMemo } from 'react';
import type { AgentState, Decision, EnergyDataPoint } from '@/types/simulation';
import { Battery, Heart, Eye, TrendingDown, Brain, Activity, X, ChevronRight, AlertTriangle, Zap, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface AgentInspectorProps {
  agent: AgentState;
  decisions: Decision[];
  energyHistory: EnergyDataPoint[];
  onClose: () => void;
}

const ROLE_COLOR: Record<string, string> = {
  inspector: 'hsl(185, 80%, 50%)',
  maintenance: 'hsl(38, 90%, 55%)',
  drone: 'hsl(155, 70%, 50%)',
};

export function AgentInspector({ agent, decisions, energyHistory, onClose }: AgentInspectorProps) {
  const [tab, setTab] = useState<'overview' | 'decisions' | 'charts'>('overview');

  const agentDecisions = useMemo(() =>
    decisions.filter(d => d.agentId === agent.id).slice(0, 20),
    [decisions, agent.id]
  );

  const constraintFreq = useMemo(() => {
    const freq: Record<string, number> = {};
    agentDecisions.forEach(d => d.constraints.forEach(c => {
      freq[c] = (freq[c] || 0) + 1;
    }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [agentDecisions]);

  const color = ROLE_COLOR[agent.role];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[700px] max-h-[85vh] rounded-lg border border-border bg-card overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-mono font-bold text-lg" style={{ color }}>{agent.name}</span>
            <span className="text-xs font-mono text-muted-foreground uppercase">{agent.role}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['overview', 'decisions', 'charts'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'overview' && (
            <div className="space-y-4">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Battery, label: 'Energy', value: `${agent.energy.toFixed(1)}%`, warn: agent.energy < 25 },
                  { icon: Heart, label: 'Health', value: `${agent.health.toFixed(1)}%`, warn: agent.health < 30 },
                  { icon: Eye, label: 'Sensors', value: `${(agent.sensorAccuracy * 100).toFixed(1)}%`, warn: agent.sensorAccuracy < 0.7 },
                  { icon: TrendingDown, label: 'Wear', value: `${agent.componentWear.toFixed(1)}%`, warn: agent.componentWear > 70 },
                  { icon: Brain, label: 'Decisions', value: `${agentDecisions.length}`, warn: false },
                  { icon: Activity, label: 'Status', value: agent.status.toUpperCase(), warn: agent.status === 'critical' },
                ].map(s => (
                  <div key={s.label} className={`rounded-lg border p-3 ${s.warn ? 'border-critical/50 bg-critical/5' : 'border-border'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <s.icon className={`w-3.5 h-3.5 ${s.warn ? 'text-critical' : 'text-muted-foreground'}`} />
                      <span className="text-xs text-muted-foreground font-mono">{s.label}</span>
                    </div>
                    <span className={`text-lg font-mono font-bold ${s.warn ? 'text-critical' : 'text-foreground'}`}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Current task */}
              {agent.currentTask && (
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs font-mono text-muted-foreground uppercase">Current Task</span>
                  <p className="text-sm font-mono mt-1">{agent.currentTask}</p>
                </div>
              )}

              {/* Constraint analysis */}
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs font-mono text-muted-foreground uppercase mb-2 block">Top Constraints (Frequency)</span>
                {constraintFreq.length === 0 && <p className="text-xs text-muted-foreground font-mono">No decisions yet</p>}
                <div className="space-y-1.5">
                  {constraintFreq.map(([constraint, count]) => (
                    <div key={constraint} className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${(count / (constraintFreq[0]?.[1] || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-6 text-right">{count}</span>
                      <span className="text-xs font-mono text-foreground/70 truncate max-w-[200px]">{constraint}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'decisions' && (
            <div className="space-y-1.5">
              {agentDecisions.length === 0 && (
                <p className="text-xs text-muted-foreground font-mono text-center py-8">No decisions recorded for this agent</p>
              )}
              {agentDecisions.map(dec => (
                <div key={dec.id} className={`rounded-md border border-border/50 p-2.5 ${dec.aiGenerated ? 'bg-primary/5 border-primary/20' : ''}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {dec.aiGenerated && <Brain className="w-3 h-3 text-primary" />}
                    <span className="text-xs font-mono font-medium text-foreground truncate">{dec.action}</span>
                  </div>
                  <p className="text-xs text-foreground/70 font-mono leading-relaxed">{dec.explanation}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Zap className="w-3 h-3" />−{dec.energyCost}%
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-mono ${dec.riskDelta < 0 ? 'text-success' : 'text-critical'}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {dec.riskDelta > 0 ? '+' : ''}{dec.riskDelta}%
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(dec.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'charts' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs font-mono text-muted-foreground uppercase mb-2 block">Energy & Health Over Time</span>
                <div className="h-[200px]">
                  {energyHistory.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={energyHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 16%)" />
                        <XAxis dataKey="tick" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
                        <Tooltip
                          contentStyle={{ background: 'hsl(222, 40%, 9%)', border: '1px solid hsl(222, 25%, 16%)', borderRadius: 6, fontSize: 11 }}
                          labelStyle={{ color: 'hsl(210, 20%, 90%)' }}
                        />
                        <Line type="monotone" dataKey="energy" stroke="hsl(185, 80%, 50%)" strokeWidth={2} dot={false} name="Energy" />
                        <Line type="monotone" dataKey="health" stroke="hsl(155, 70%, 45%)" strokeWidth={2} dot={false} name="Health" />
                        <Line type="monotone" dataKey="sensorAccuracy" stroke="hsl(38, 90%, 55%)" strokeWidth={1.5} dot={false} name="Sensors" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-mono">
                      Run simulation to collect data...
                    </div>
                  )}
                </div>
              </div>

              {/* Risk distribution */}
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs font-mono text-muted-foreground uppercase mb-2 block">Decision Risk Distribution</span>
                <div className="flex gap-1 h-[60px] items-end">
                  {agentDecisions.slice(0, 30).map((d, i) => (
                    <div
                      key={d.id}
                      className={`flex-1 min-w-[4px] rounded-t ${d.riskDelta < 0 ? 'bg-success/60' : 'bg-critical/60'}`}
                      style={{ height: `${Math.min(100, Math.abs(d.riskDelta) * 4)}%` }}
                      title={`${d.riskDelta > 0 ? '+' : ''}${d.riskDelta}%`}
                    />
                  ))}
                  {agentDecisions.length === 0 && (
                    <div className="flex items-center justify-center w-full text-xs text-muted-foreground font-mono">
                      No data yet
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs font-mono text-success">← Risk reduction</span>
                  <span className="text-xs font-mono text-critical">Risk increase →</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
