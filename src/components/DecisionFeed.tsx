import type { Decision } from '@/types/simulation';
import { ChevronRight, AlertTriangle, Zap, Clock } from 'lucide-react';

const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: 'bg-muted/50', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  medium: { bg: 'bg-primary/5', text: 'text-foreground', dot: 'bg-primary' },
  high: { bg: 'bg-accent/5', text: 'text-accent', dot: 'bg-accent' },
  critical: { bg: 'bg-critical/5', text: 'text-critical', dot: 'bg-critical' },
};

interface DecisionFeedProps {
  decisions: Decision[];
}

export function DecisionFeed({ decisions }: DecisionFeedProps) {
  return (
    <div className="space-y-1.5 max-h-full overflow-y-auto pr-1">
      {decisions.length === 0 && (
        <p className="text-xs text-muted-foreground font-mono text-center py-8">
          Awaiting agent decisions...
        </p>
      )}
      {decisions.map((dec, i) => {
        const style = PRIORITY_STYLES[dec.priority];
        return (
          <div
            key={dec.id}
            className={`rounded-md border border-border/50 p-2.5 ${style.bg} ${i === 0 ? 'animate-slide-in' : ''}`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-mono font-semibold text-primary">{dec.agentName}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className={`text-xs font-mono font-medium ${style.text} truncate`}>
                    {dec.action}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 font-mono leading-relaxed">
                  {dec.explanation}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Zap className="w-3 h-3" />−{dec.energyCost}%
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-mono ${dec.riskDelta < 0 ? 'text-success' : 'text-critical'}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {dec.riskDelta > 0 ? '+' : ''}{dec.riskDelta}% risk
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono ml-auto">
                    <Clock className="w-3 h-3" />
                    {new Date(dec.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
