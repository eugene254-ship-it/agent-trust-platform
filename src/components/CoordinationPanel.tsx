import type { DelegationEvent } from '@/types/simulation';
import { ArrowRight, Check, X, Users, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoordinationPanelProps {
  delegations: DelegationEvent[];
  enabled: boolean;
  onToggle: () => void;
}

export function CoordinationPanel({ delegations, enabled, onToggle }: CoordinationPanelProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={enabled ? 'default' : 'secondary'}
          onClick={onToggle}
          className={`font-mono text-xs gap-1.5 ${enabled ? 'glow-primary' : ''}`}
        >
          <Users className="w-3.5 h-3.5" />
          COORD {enabled ? 'ON' : 'OFF'}
        </Button>
        {enabled && delegations.length > 0 && (
          <span className="text-xs font-mono text-muted-foreground">
            {delegations.length} delegations
          </span>
        )}
      </div>

      {enabled && (
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {delegations.length === 0 && (
            <p className="text-xs text-muted-foreground font-mono text-center py-4">
              Awaiting coordination events...
            </p>
          )}
          {delegations.map((d) => (
            <div
              key={d.id}
              className={`rounded-md border p-2 text-xs font-mono ${
                d.accepted
                  ? 'border-success/30 bg-success/5'
                  : 'border-critical/30 bg-critical/5'
              }`}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-primary font-semibold">{d.fromAgentName}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-accent font-semibold">{d.toAgentName}</span>
                {d.accepted ? (
                  <Check className="w-3 h-3 text-success ml-auto flex-shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-critical ml-auto flex-shrink-0" />
                )}
              </div>
              <p className="text-foreground/70 mt-1 leading-relaxed break-words">{d.task}</p>
              <p className="text-muted-foreground mt-0.5 leading-relaxed break-words">{d.reason}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3 h-3" />{d.proximityDist} cells
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="w-3 h-3" />{(d.capabilityScore * 100).toFixed(0)}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
