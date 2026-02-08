import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  SimulationState, FacilityCell, AgentState, Decision, FailureEvent, CellType, Position
} from '@/types/simulation';

const GRID_W = 20;
const GRID_H = 14;

const CELL_TEMPLATES: Record<string, CellType> = {};

function createFacility(): FacilityCell[][] {
  const grid: FacilityCell[][] = [];
  for (let y = 0; y < GRID_H; y++) {
    const row: FacilityCell[] = [];
    for (let x = 0; x < GRID_W; x++) {
      let type: CellType = 'floor';
      const temp = 20 + Math.random() * 15;

      // Walls around edges
      if (x === 0 || x === GRID_W - 1 || y === 0 || y === GRID_H - 1) {
        type = 'wall';
      }
      // Thermal zones
      else if ((x >= 3 && x <= 5 && y >= 2 && y <= 4) || (x >= 14 && x <= 16 && y >= 9 && y <= 11)) {
        type = 'thermal_zone';
      }
      // Energy units
      else if ((x === 8 && y === 3) || (x === 12 && y === 7) || (x === 5 && y === 10)) {
        type = 'energy_unit';
      }
      // Maintenance bays
      else if ((x >= 16 && x <= 18 && y >= 2 && y <= 3)) {
        type = 'maintenance_bay';
      }
      // Storage
      else if ((x >= 1 && x <= 2 && y >= 10 && y <= 12)) {
        type = 'storage';
      }
      // Transit corridors
      else if (y === 7 || x === 10) {
        type = 'transit';
      }
      // Random hazards
      else if (Math.random() < 0.04) {
        type = 'hazard';
      }

      row.push({
        type,
        temperature: type === 'thermal_zone' ? 60 + Math.random() * 35 : temp,
        blocked: false,
        degraded: Math.random() < 0.05,
      });
    }
    grid.push(row);
  }
  return grid;
}

function createAgents(): AgentState[] {
  return [
    {
      id: 'agent-inspector',
      name: 'SCOUT-1',
      role: 'inspector',
      position: { x: 2, y: 2 },
      energy: 95,
      health: 100,
      status: 'idle',
      currentTask: null,
      sensorAccuracy: 0.95,
      componentWear: 5,
    },
    {
      id: 'agent-maintenance',
      name: 'MAINT-7',
      role: 'maintenance',
      position: { x: 17, y: 2 },
      energy: 88,
      health: 97,
      status: 'idle',
      currentTask: null,
      sensorAccuracy: 0.9,
      componentWear: 12,
    },
    {
      id: 'agent-drone',
      name: 'ARIA-3',
      role: 'drone',
      position: { x: 10, y: 7 },
      energy: 100,
      health: 100,
      status: 'idle',
      currentTask: null,
      sensorAccuracy: 0.98,
      componentWear: 2,
    },
  ];
}

const TASKS = [
  'Inspect thermal unit Alpha-3',
  'Calibrate sensor array B-7',
  'Repair conduit junction 12',
  'Survey corridor integrity',
  'Check energy output variance',
  'Replace degraded relay switch',
  'Monitor thermal anomaly zone',
  'Recharge at maintenance bay',
  'Clear blocked transit path',
  'Run diagnostic on unit C-4',
];

const CONSTRAINTS = [
  'Elevated thermal variance in sector',
  'Energy reserves below optimal threshold',
  'Sensor accuracy degraded by 12%',
  'Competing high-priority task queued',
  'Path congestion near transit corridor',
  'Component wear approaching service limit',
  'Environmental hazard detected nearby',
  'Time constraint on mission objective',
];

const TRADEOFFS = [
  'Energy savings +9%. Failure risk −22%.',
  'Completion time +4min. Safety margin +31%.',
  'Efficiency −8%. Component longevity +15%.',
  'Coverage −12%. Energy reserves preserved for critical task.',
  'Speed −20%. Sensor accuracy maintained above threshold.',
  'Risk +5%. Task completion probability +28%.',
];

function generateDecision(agent: AgentState, tick: number): Decision {
  const task = TASKS[Math.floor(Math.random() * TASKS.length)];
  const numConstraints = 2 + Math.floor(Math.random() * 2);
  const constraints: string[] = [];
  for (let i = 0; i < numConstraints; i++) {
    const c = CONSTRAINTS[Math.floor(Math.random() * CONSTRAINTS.length)];
    if (!constraints.includes(c)) constraints.push(c);
  }
  const tradeoff = TRADEOFFS[Math.floor(Math.random() * TRADEOFFS.length)];
  const energyCost = Math.round(3 + Math.random() * 12);
  const riskDelta = Math.round((Math.random() * 40 - 20) * 10) / 10;

  const explanation = `${task} ${riskDelta < 0 ? 'delayed' : 'prioritized'} due to ${constraints[0].toLowerCase()}. ${tradeoff}`;

  return {
    id: `dec-${tick}-${agent.id}`,
    agentId: agent.id,
    agentName: agent.name,
    timestamp: Date.now(),
    action: task,
    constraints,
    tradeoff,
    alternatives: `Alternative: ${TASKS[Math.floor(Math.random() * TASKS.length)]} (rejected: higher energy cost)`,
    energyCost,
    riskDelta,
    explanation,
    priority: riskDelta < -15 ? 'critical' : riskDelta < -5 ? 'high' : riskDelta < 5 ? 'medium' : 'low',
  };
}

function generateFailure(tick: number, agents: AgentState[]): FailureEvent | null {
  if (Math.random() > 0.08) return null;
  const types: FailureEvent['type'][] = ['sensor_degradation', 'component_failure', 'path_blocked', 'thermal_spike', 'task_failure'];
  const type = types[Math.floor(Math.random() * types.length)];
  const severities: FailureEvent['severity'][] = ['minor', 'moderate', 'severe'];
  const severity = severities[Math.floor(Math.random() * 3)];
  const descriptions: Record<FailureEvent['type'], string> = {
    sensor_degradation: 'LiDAR calibration drift detected in sector B',
    component_failure: 'Actuator servo fault on joint assembly',
    path_blocked: 'Debris obstruction in transit corridor 7',
    thermal_spike: 'Thermal excursion +18°C above baseline in zone Alpha',
    task_failure: 'Inspection sequence aborted: data integrity check failed',
  };
  const agent = agents[Math.floor(Math.random() * agents.length)];
  return {
    id: `fail-${tick}`,
    timestamp: Date.now(),
    type,
    severity,
    description: descriptions[type],
    resolved: false,
    affectedAgentId: agent.id,
  };
}

function moveAgent(agent: AgentState, facility: FacilityCell[][]): Position {
  const dirs = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
  ];
  const validDirs = dirs.filter(d => {
    const nx = agent.position.x + d.x;
    const ny = agent.position.y + d.y;
    if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) return false;
    const cell = facility[ny][nx];
    return cell.type !== 'wall' && !cell.blocked;
  });
  if (validDirs.length === 0) return agent.position;
  const dir = validDirs[Math.floor(Math.random() * validDirs.length)];
  return { x: agent.position.x + dir.x, y: agent.position.y + dir.y };
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(() => ({
    tick: 0,
    running: false,
    speed: 1,
    facility: createFacility(),
    agents: createAgents(),
    decisions: [],
    metrics: {
      taskCompletionRate: 87.3,
      energyEfficiency: 91.2,
      meanRecoveryTime: 4.7,
      decisionLatency: 0.23,
      uptimePercent: 99.1,
      failuresHandled: 0,
      totalDecisions: 0,
    },
    failures: [],
    activeFailures: 0,
  }));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      const newTick = prev.tick + 1;

      // Move agents
      const newAgents = prev.agents.map(agent => {
        const newPos = agent.status !== 'critical' ? moveAgent(agent, prev.facility) : agent.position;
        const energyDrain = agent.role === 'drone' ? 0.3 : 0.5;
        const newEnergy = Math.max(0, agent.energy - energyDrain * (Math.random() * 0.5 + 0.75));
        const wearInc = Math.random() * 0.3;
        const newHealth = Math.max(0, agent.health - (Math.random() < 0.05 ? Math.random() * 3 : 0));

        let status = agent.status;
        if (newEnergy < 10) status = 'critical';
        else if (newEnergy < 25) status = 'recovering';
        else if (Math.random() < 0.3) status = 'working';
        else if (Math.random() < 0.5) status = 'moving';
        else status = 'idle';

        // Recharge in maintenance bay
        const cell = prev.facility[newPos.y]?.[newPos.x];
        const recharging = cell?.type === 'maintenance_bay';

        return {
          ...agent,
          position: newPos,
          energy: recharging ? Math.min(100, newEnergy + 5) : newEnergy,
          health: newHealth,
          status,
          componentWear: Math.min(100, agent.componentWear + wearInc),
          sensorAccuracy: Math.max(0.5, agent.sensorAccuracy - (Math.random() < 0.1 ? 0.01 : 0)),
          currentTask: TASKS[Math.floor(Math.random() * TASKS.length)],
        };
      });

      // Generate decisions (every few ticks)
      let newDecisions = [...prev.decisions];
      if (newTick % 3 === 0) {
        const agent = newAgents[Math.floor(Math.random() * newAgents.length)];
        const decision = generateDecision(agent, newTick);
        newDecisions = [decision, ...newDecisions].slice(0, 50);
      }

      // Failures
      let newFailures = [...prev.failures];
      const failure = generateFailure(newTick, newAgents);
      if (failure) {
        newFailures = [failure, ...newFailures].slice(0, 30);
      }

      // Resolve old failures
      newFailures = newFailures.map(f =>
        !f.resolved && Date.now() - f.timestamp > 8000 + Math.random() * 12000
          ? { ...f, resolved: true }
          : f
      );

      // Update thermal zones
      const newFacility = prev.facility.map(row =>
        row.map(cell => ({
          ...cell,
          temperature: cell.type === 'thermal_zone'
            ? cell.temperature + (Math.random() * 6 - 3)
            : cell.temperature + (Math.random() * 2 - 1),
          blocked: cell.type === 'transit' && Math.random() < 0.01 ? !cell.blocked : cell.blocked,
        }))
      );

      const activeFailures = newFailures.filter(f => !f.resolved).length;

      return {
        ...prev,
        tick: newTick,
        facility: newFacility,
        agents: newAgents,
        decisions: newDecisions,
        failures: newFailures,
        activeFailures,
        metrics: {
          taskCompletionRate: Math.max(60, Math.min(99, prev.metrics.taskCompletionRate + (Math.random() * 2 - 1))),
          energyEfficiency: Math.max(70, Math.min(99, prev.metrics.energyEfficiency + (Math.random() * 1.5 - 0.75))),
          meanRecoveryTime: Math.max(1, Math.min(12, prev.metrics.meanRecoveryTime + (Math.random() * 0.6 - 0.3))),
          decisionLatency: Math.max(0.05, Math.min(0.8, prev.metrics.decisionLatency + (Math.random() * 0.04 - 0.02))),
          uptimePercent: Math.max(90, Math.min(100, prev.metrics.uptimePercent + (Math.random() * 0.4 - 0.2))),
          failuresHandled: prev.metrics.failuresHandled + (failure ? 1 : 0),
          totalDecisions: prev.metrics.totalDecisions + (newTick % 3 === 0 ? 1 : 0),
        },
      };
    });
  }, []);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, running: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, running: false }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const injectFailure = useCallback(() => {
    setState(prev => {
      const agent = prev.agents[Math.floor(Math.random() * prev.agents.length)];
      const failure: FailureEvent = {
        id: `fail-manual-${prev.tick}`,
        timestamp: Date.now(),
        type: 'component_failure',
        severity: 'severe',
        description: `Manual injection: Critical system fault on ${agent.name}`,
        resolved: false,
        affectedAgentId: agent.id,
      };
      return {
        ...prev,
        failures: [failure, ...prev.failures].slice(0, 30),
        activeFailures: prev.activeFailures + 1,
      };
    });
  }, []);

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(tick, 1000 / state.speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.running, state.speed, tick]);

  return { state, start, pause, setSpeed, injectFailure };
}
