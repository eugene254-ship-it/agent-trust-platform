import { useSimulation } from '@/hooks/useSimulation';
import { FacilityMap } from '@/components/FacilityMap';
import { AgentCard } from '@/components/AgentCard';
import { DecisionFeed } from '@/components/DecisionFeed';
import { MetricsPanel } from '@/components/MetricsPanel';
import { FailureLog } from '@/components/FailureLog';
import { SimControls } from '@/components/SimControls';
import { Shield, Radio } from 'lucide-react';

const Index = () => {
  const { state, start, pause, setSpeed, injectFailure } = useSimulation();

  return (
    <div className="min-h-screen bg-background grid-overlay">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-50" />

      {/* Header */}
      <header className="border-b border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-mono font-bold text-sm tracking-widest text-primary text-glow-primary">
            SANCTUM-SIM
          </h1>
          <span className="text-xs font-mono text-muted-foreground">
            v0.9.1 — Autonomous Infrastructure Simulation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Radio className={`w-3.5 h-3.5 ${state.running ? 'text-success animate-pulse-glow' : 'text-muted-foreground'}`} />
          <span className={`text-xs font-mono ${state.running ? 'text-success' : 'text-muted-foreground'}`}>
            {state.running ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
      </header>

      {/* Controls bar */}
      <div className="border-b border-border px-4 py-2">
        <SimControls
          running={state.running}
          speed={state.speed}
          tick={state.tick}
          onStart={start}
          onPause={pause}
          onSetSpeed={setSpeed}
          onInjectFailure={injectFailure}
        />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-[1fr_340px] gap-0 h-[calc(100vh-88px)]">
        {/* Left column */}
        <div className="flex flex-col border-r border-border overflow-hidden">
          {/* Facility map */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Facility Overview</span>
            </div>
            <FacilityMap facility={state.facility} agents={state.agents} />
          </div>

          {/* Metrics */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Operations Metrics</span>
              <span className="text-xs font-mono text-primary ml-auto">{state.metrics.totalDecisions} decisions</span>
            </div>
            <MetricsPanel metrics={state.metrics} activeFailures={state.activeFailures} />
          </div>

          {/* Agent cards */}
          <div className="p-3 flex-1 overflow-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Agent Status</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {state.agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Decision feed + Failures */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 p-3 overflow-hidden flex flex-col">
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
    </div>
  );
};

export default Index;
