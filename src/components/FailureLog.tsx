import type { FailureEvent } from '@/types/simulation';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const SEVERITY_STYLES: Record<string, string> = {
  minor: 'border-accent/30 bg-accent/5',
  moderate: 'border-accent/50 bg-accent/10',
  severe: 'border-critical/50 bg-critical/10',
};

interface FailureLogProps {
  failures: FailureEvent[];
}

export function FailureLog({ failures }: FailureLogProps) {
  const recent = failures.slice(0, 12);

  return (
    <div className="space-y-1 overflow-y-auto max-h-full pr-1">
      {recent.length === 0 && (
        <p className="text-xs text-muted-foreground font-mono text-center py-4">No failures recorded</p>
      )}
      {recent.map(f => (
        <div key={f.id} className={`rounded-md border p-2 ${SEVERITY_STYLES[f.severity]} ${!f.resolved ? 'animate-slide-in' : ''}`}>
          <div className="flex items-start gap-2">
            {f.resolved ? (
              <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${f.severity === 'severe' ? 'text-critical' : 'text-accent'}`} />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-semibold uppercase ${f.resolved ? 'text-success' : f.severity === 'severe' ? 'text-critical' : 'text-accent'}`}>
                  {f.severity}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {f.type.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-foreground/70 font-mono mt-0.5">{f.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
