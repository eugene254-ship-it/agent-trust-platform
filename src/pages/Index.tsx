import { useState, useEffect } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { useReplay } from '@/hooks/useReplay';
import { useCoordination } from '@/hooks/useCoordination';
import { FacilityMap } from '@/components/FacilityMap';
import { AgentCard } from '@/components/AgentCard';
import { DecisionFeed } from '@/components/DecisionFeed';
import { MetricsPanel } from '@/components/MetricsPanel';
import { FailureLog } from '@/components/FailureLog';
import { SimControls } from '@/components/SimControls';
import { AgentInspector } from '@/components/AgentInspector';
import { ReplayPanel } from '@/components/ReplayPanel';
import { CoordinationPanel } from '@/components/CoordinationPanel';
import { Shield, Radio, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { state, start, pause, setSpeed, injectFailure, randomize, aiEnabled, setAiEnabled, energyHistory } = useSimulation();
  const replay = useReplay();
  const coordination = useCoordination();
  const [inspectedAgentId, setInspectedAgentId] = useState<string | null>(null);

  // Record snapshots while recording
  useEffect(() => {
    if (replay.isRecording && state.running) {
      replay.recordSnapshot(state);
    }
  }, [state.tick]);

  // Coordination engine
  useEffect(() => {
    if (!state.running || !coordination.enabled) return;
    const delegation = coordination.evaluateDelegation(state.agents, state.tick);
    if (delegation) coordination.addDelegation(delegation);
  }, [state.tick, state.running, coordination.enabled]);

  const inspectedAgent = inspectedAgentId ? state.agents.find(a => a.id === inspectedAgentId) : null;

  const handleStopRecording = () => {
    replay.stopRecording(state);
  };

  return (
    <div className="min-h-screen bg-background grid-overlay">
      <div className="fixed inset-0 scanline pointer-events-none z-50" />

      {/* Header */}
      <header className="border-b border-border px-3 sm:px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-mono font-bold text-xs sm:text-sm tracking-widest text-primary text-glow-primary">
            SANCTUM-SIM
          </h1>
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
            v1.0.0 — Governed Autonomy Platform
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {aiEnabled && (
            <span className="text-xs font-mono text-primary animate-pulse-glow">AI ACTIVE</span>
          )}
          <Link to="/leaderboard" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-accent transition-colors">
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LEADERBOARD</span>
          </Link>
          <Radio className={`w-3.5 h-3.5 ${state.running ? 'text-success animate-pulse-glow' : 'text-muted-foreground'}`} />
          <span className={`text-xs font-mono ${state.running ? 'text-success' : 'text-muted-foreground'}`}>
            {replay.isReplaying ? 'REPLAY' : state.running ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
      </header>

      {/* Controls */}
      <div className="border-b border-border px-3 sm:px-4 py-2">
        <SimControls
          running={state.running}
          speed={state.speed}
          tick={state.tick}
          aiEnabled={aiEnabled}
          onStart={start}
          onPause={pause}
          onSetSpeed={setSpeed}
          onInjectFailure={injectFailure}
          onRandomize={randomize}
          onToggleAI={() => setAiEnabled(!aiEnabled)}
        />
      </div>

      {/* Main layout — responsive */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-0 lg:h-[calc(100vh-88px)]">
        {/* Left column */}
        <div className="flex flex-col lg:border-r border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Facility Overview</span>
            </div>
            <div className="overflow-x-auto">
              <FacilityMap facility={state.facility} agents={state.agents} />
            </div>
          </div>

          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Operations Metrics</span>
              <span className="text-xs font-mono text-primary ml-auto">{state.metrics.totalDecisions} decisions</span>
            </div>
            <MetricsPanel metrics={state.metrics} activeFailures={state.activeFailures} />
          </div>

          {/* Agent cards + Coordination + Replay */}
          <div className="p-3 flex-1 overflow-auto space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Agent Status</span>
                <span className="text-xs font-mono text-muted-foreground ml-auto hidden sm:inline">Click to inspect</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {state.agents.map(agent => (
                  <div key={agent.id} onClick={() => setInspectedAgentId(agent.id)} className="cursor-pointer hover:ring-1 hover:ring-primary/50 rounded-lg transition-all">
                    <AgentCard agent={agent} />
                  </div>
                ))}
              </div>
            </div>

            {/* Coordination panel */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Multi-Agent Coordination</span>
              </div>
              <CoordinationPanel
                delegations={coordination.delegations}
                enabled={coordination.enabled}
                onToggle={() => coordination.setEnabled(!coordination.enabled)}
              />
            </div>

            {/* Replay panel */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Scenario Replay</span>
              </div>
              <ReplayPanel
                isRecording={replay.isRecording}
                sessions={replay.sessions}
                replaySession={replay.replaySession}
                replayIndex={replay.replayIndex}
                isReplaying={replay.isReplaying}
                currentSnapshot={replay.currentSnapshot}
                onStartRecording={replay.startRecording}
                onStopRecording={handleStopRecording}
                onStartReplay={replay.startReplay}
                onStopReplay={replay.stopReplay}
                onSeek={replay.seekReplay}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Decision Feed</span>
              <span className="text-xs font-mono text-primary ml-auto">Explainable Autonomy</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DecisionFeed decisions={state.decisions} />
            </div>
          </div>

          <div className="border-t border-border p-3 h-[240px] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Failure Recovery Log</span>
              {state.activeFailures > 0 && (
                <span className="text-xs font-mono text-critical ml-auto animate-pulse-glow">
                  {state.activeFailures} ACTIVE
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <FailureLog failures={state.failures} />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Inspector modal */}
      {inspectedAgent && (
        <AgentInspector
          agent={inspectedAgent}
          decisions={state.decisions}
          energyHistory={energyHistory[inspectedAgent.id] || []}
          onClose={() => setInspectedAgentId(null)}
        />
      )}
    </div>
  );
};

export default Index;
