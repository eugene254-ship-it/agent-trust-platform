import type { FacilityCell, AgentState } from '@/types/simulation';

const GRID_W = 20;
const GRID_H = 14;

const CELL_COLORS: Record<string, string> = {
  floor: 'hsl(222 40% 11%)',
  wall: 'hsl(222 30% 18%)',
  thermal_zone: 'hsl(0 60% 25%)',
  hazard: 'hsl(38 80% 20%)',
  energy_unit: 'hsl(185 60% 20%)',
  storage: 'hsl(222 30% 14%)',
  maintenance_bay: 'hsl(155 50% 18%)',
  transit: 'hsl(222 35% 13%)',
};

const AGENT_COLORS: Record<string, string> = {
  inspector: 'hsl(185, 80%, 50%)',
  maintenance: 'hsl(38, 90%, 55%)',
  drone: 'hsl(155, 70%, 50%)',
};

interface FacilityMapProps {
  facility: FacilityCell[][];
  agents: AgentState[];
}

export function FacilityMap({ facility, agents }: FacilityMapProps) {
  const cellSize = 100 / GRID_W;
  const cellH = 100 / GRID_H;

  return (
    <div className="relative w-full aspect-[20/14] rounded-lg overflow-hidden border border-border bg-card">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none z-10 opacity-50" />
      
      {/* Facility cells */}
      <svg viewBox={`0 0 ${GRID_W} ${GRID_H}`} className="w-full h-full" preserveAspectRatio="none">
        {facility.map((row, y) =>
          row.map((cell, x) => {
            const isHot = cell.type === 'thermal_zone' && cell.temperature > 80;
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={CELL_COLORS[cell.type] || CELL_COLORS.floor}
                opacity={cell.degraded ? 0.6 : 1}
                stroke="hsl(222, 25%, 14%)"
                strokeWidth={0.03}
              >
                {isHot && (
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
                )}
              </rect>
            );
          })
        )}

        {/* Transit corridors - dashed center lines */}
        {facility.map((row, y) =>
          row.map((cell, x) => {
            if (cell.type !== 'transit') return null;
            return (
              <line
                key={`transit-${x}-${y}`}
                x1={x + 0.2}
                y1={y + 0.5}
                x2={x + 0.8}
                y2={y + 0.5}
                stroke="hsl(185, 60%, 30%)"
                strokeWidth={0.04}
                strokeDasharray="0.1 0.08"
                opacity={0.5}
              />
            );
          })
        )}

        {/* Agents */}
        {agents.map(agent => (
          <g key={agent.id}>
            {/* Glow */}
            <circle
              cx={agent.position.x + 0.5}
              cy={agent.position.y + 0.5}
              r={0.45}
              fill={AGENT_COLORS[agent.role]}
              opacity={0.15}
            >
              <animate attributeName="r" values="0.35;0.5;0.35" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Agent body */}
            <circle
              cx={agent.position.x + 0.5}
              cy={agent.position.y + 0.5}
              r={agent.role === 'drone' ? 0.2 : 0.25}
              fill={AGENT_COLORS[agent.role]}
              stroke={agent.status === 'critical' ? 'hsl(0, 75%, 55%)' : 'hsl(222, 40%, 6%)'}
              strokeWidth={0.06}
            />
            {/* Agent label */}
            <text
              x={agent.position.x + 0.5}
              y={agent.position.y + 0.1}
              textAnchor="middle"
              fontSize={0.22}
              fill="hsl(210, 20%, 90%)"
              fontFamily="'JetBrains Mono', monospace"
            >
              {agent.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-3 text-xs font-mono">
        {[
          { label: 'Thermal', color: 'bg-critical/40' },
          { label: 'Energy', color: 'bg-info/40' },
          { label: 'Maint Bay', color: 'bg-success/40' },
          { label: 'Hazard', color: 'bg-accent/40' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-sm ${item.color}`} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
