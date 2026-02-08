import type { SimMetrics } from '@/types/simulation';
import { TrendingUp, Zap, Clock, Activity, Shield, Brain } from 'lucide-react';

interface MetricsPanelProps {
  metrics: SimMetrics;
  activeFailures: number;
}

export function MetricsPanel({ metrics, activeFailures }: MetricsPanelProps) {
  const items = [
    {
      icon: TrendingUp,
      label: 'Task Completion',
      value: `${metrics.taskCompletionRate.toFixed(1)}%`,
      color: metrics.taskCompletionRate > 85 ? 'text-success' : 'text-accent',
    },
    {
      icon: Zap,
      label: 'Energy Efficiency',
      value: `${metrics.energyEfficiency.toFixed(1)}%`,
      color: metrics.energyEfficiency > 85 ? 'text-success' : 'text-accent',
    },
    {
      icon: Clock,
      label: 'Mean Recovery',
      value: `${metrics.meanRecoveryTime.toFixed(1)}s`,
      color: metrics.meanRecoveryTime < 6 ? 'text-success' : 'text-critical',
    },
    {
      icon: Brain,
      label: 'Decision Latency',
      value: `${(metrics.decisionLatency * 1000).toFixed(0)}ms`,
      color: 'text-primary',
    },
    {
      icon: Shield,
      label: 'Uptime',
      value: `${metrics.uptimePercent.toFixed(1)}%`,
      color: metrics.uptimePercent > 97 ? 'text-success' : 'text-critical',
    },
    {
      icon: Activity,
      label: 'Active Failures',
      value: `${activeFailures}`,
      color: activeFailures === 0 ? 'text-success' : activeFailures > 2 ? 'text-critical' : 'text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(item => (
        <div key={item.label} className="rounded-lg border border-border bg-card p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            <span className="text-xs text-muted-foreground font-mono">{item.label}</span>
          </div>
          <span className={`text-lg font-mono font-bold ${item.color}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
