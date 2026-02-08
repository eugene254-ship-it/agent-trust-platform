import { Play, Pause, Zap, Gauge, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimControlsProps {
  running: boolean;
  speed: number;
  tick: number;
  onStart: () => void;
  onPause: () => void;
  onSetSpeed: (s: number) => void;
  onInjectFailure: () => void;
}

export function SimControls({ running, speed, tick, onStart, onPause, onSetSpeed, onInjectFailure }: SimControlsProps) {
  return (
    <div className="flex items-center gap-3">
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

      <Button
        size="sm"
        variant="destructive"
        onClick={onInjectFailure}
        className="font-mono text-xs gap-1.5"
      >
        <Zap className="w-3.5 h-3.5" />
        INJECT FAILURE
      </Button>

      <span className="text-xs font-mono text-muted-foreground ml-auto">
        TICK {tick.toString().padStart(5, '0')}
      </span>
    </div>
  );
}
