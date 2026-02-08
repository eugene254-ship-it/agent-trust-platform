import type { AgentState } from '@/types/simulation';
import { Battery, Heart, Eye, Wrench, Cpu, Crosshair } from 'lucide-react';

const ROLE_STYLES: Record<string, { border: string; text: string; icon: typeof Cpu }> = {
  inspector: { border: 'border-primary/50', text: 'text-primary', icon: Crosshair },
  maintenance: { border: 'border-accent/50', text: 'text-accent', icon: Wrench },
  drone: { border: 'border-success/50', text: 'text-success', icon: Eye },
};

const STATUS_STYLES: Record<string, string> = {
  idle: 'bg-muted-foreground/20 text-muted-foreground',
  moving: 'bg-primary/20 text-primary',
  working: 'bg-success/20 text-success',
  recovering: 'bg-accent/20 text-accent',
  critical: 'bg-critical/20 text-critical',
};

interface AgentCardProps {
  agent: AgentState;
}

export function AgentCard({ agent }: AgentCardProps) {
  const style = ROLE_STYLES[agent.role];
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border ${style.border} bg-card p-3 space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${style.text}`} />
          <span className={`font-mono font-semibold text-sm ${style.text}`}>{agent.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase ${STATUS_STYLES[agent.status]}`}>
          {agent.status}
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-1.5">
        <StatBar icon={Battery} label="Energy" value={agent.energy} color="primary" />
        <StatBar icon={Heart} label="Health" value={agent.health} color="success" />
        <StatBar icon={Eye} label="Sensors" value={agent.sensorAccuracy * 100} color="info" />
      </div>

      {agent.currentTask && (
        <p className="text-xs text-muted-foreground font-mono truncate mt-1">
          → {agent.currentTask}
        </p>
      )}

      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>Wear: {agent.componentWear.toFixed(0)}%</span>
        <span>Pos: ({agent.position.x},{agent.position.y})</span>
      </div>
    </div>
  );
}

function StatBar({ icon: Icon, label, value, color }: {
  icon: typeof Battery;
  label: string;
  value: number;
  color: string;
}) {
  const isCritical = value < 25;
  const barColor = isCritical ? 'bg-critical' : `bg-${color}`;
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3 h-3 ${isCritical ? 'text-critical' : `text-${color}`}`} />
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
      <span className={`text-xs font-mono w-8 text-right ${isCritical ? 'text-critical' : 'text-muted-foreground'}`}>
        {value.toFixed(0)}
      </span>
    </div>
  );
}
