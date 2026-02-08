import { Play, Pause, Zap, Gauge, Shuffle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimControlsProps {
  running: boolean;
  speed: number;
  tick: number;
  aiEnabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onSetSpeed: (s: number) => void;
  onInjectFailure: () => void;
  onRandomize: () => void;
  onToggleAI: () => void;
}

export function SimControls({ running, speed, tick, aiEnabled, onStart, onPause, onSetSpeed, onInjectFailure, onRandomize, onToggleAI }: SimControlsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="sm"
        variant={running ? "secondary" : "default"}
        onClick={running ? onPause : onStart}
        className="font-mono text-xs gap-1.5"
      >
        {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {running ? 'PAUSE' : 'START'}
      </Button>

      <div className="flex items-center gap-1 border border-border rounded-md px-2 py-1">
        <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
        {[1, 2, 4].map(s => (
          <button
            key={s}
            onClick={() => onSetSpeed(s)}
            className={`text-xs font-mono px-1.5 py-0.5 rounded ${speed === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {s}x
          </button>
        ))}
      </div>

      <Button size="sm" variant="destructive" onClick={onInjectFailure} className="font-mono text-xs gap-1.5">
        <Zap className="w-3.5 h-3.5" />INJECT FAILURE
      </Button>

      <Button size="sm" variant="secondary" onClick={onRandomize} className="font-mono text-xs gap-1.5">
        <Shuffle className="w-3.5 h-3.5" />RANDOMIZE
      </Button>

      <Button
        size="sm"
        variant={aiEnabled ? "default" : "secondary"}
        onClick={onToggleAI}
        className={`font-mono text-xs gap-1.5 ${aiEnabled ? 'glow-primary' : ''}`}
      >
        <Brain className="w-3.5 h-3.5" />
        AI {aiEnabled ? 'ON' : 'OFF'}
      </Button>

      <span className="text-xs font-mono text-muted-foreground ml-auto">
        TICK {tick.toString().padStart(5, '0')}
      </span>
    </div>
  );
}
