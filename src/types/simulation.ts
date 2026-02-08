// Simulation types for SANCTUM-SIM

export interface Position {
  x: number;
  y: number;
}

export type CellType = 'floor' | 'wall' | 'thermal_zone' | 'hazard' | 'energy_unit' | 'storage' | 'maintenance_bay' | 'transit';

export interface FacilityCell {
  type: CellType;
  temperature: number; // 0-100
  blocked: boolean;
  degraded: boolean;
}

export type AgentRole = 'inspector' | 'maintenance' | 'drone';

export interface AgentState {
  id: string;
  name: string;
  role: AgentRole;
  position: Position;
  energy: number; // 0-100
  health: number; // 0-100
  status: 'idle' | 'moving' | 'working' | 'recovering' | 'critical';
  currentTask: string | null;
  sensorAccuracy: number; // 0-1
  componentWear: number; // 0-100
}

export interface Decision {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: number;
  action: string;
  constraints: string[];
  tradeoff: string;
  alternatives: string;
  energyCost: number;
  riskDelta: number;
  explanation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SimMetrics {
  taskCompletionRate: number;
  energyEfficiency: number;
  meanRecoveryTime: number;
  decisionLatency: number;
  uptimePercent: number;
  failuresHandled: number;
  totalDecisions: number;
}

export interface FailureEvent {
  id: string;
  timestamp: number;
  type: 'sensor_degradation' | 'component_failure' | 'path_blocked' | 'thermal_spike' | 'task_failure';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  resolved: boolean;
  affectedAgentId?: string;
}

export interface SimulationState {
  tick: number;
  running: boolean;
  speed: number;
  facility: FacilityCell[][];
  agents: AgentState[];
  decisions: Decision[];
  metrics: SimMetrics;
  failures: FailureEvent[];
  activeFailures: number;
}
