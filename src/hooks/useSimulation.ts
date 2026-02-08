import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  SimulationState, FacilityCell, AgentState, Decision, FailureEvent, CellType, Position, EnergyDataPoint
} from '@/types/simulation';
import { fetchAIDecision } from '@/lib/aiDecision';

const GRID_W = 20;
const GRID_H = 14;

function createFacility(randomize = false): FacilityCell[][] {
  const grid: FacilityCell[][] = [];
  for (let y = 0; y < GRID_H; y++) {
    const row: FacilityCell[] = [];
    for (let x = 0; x < GRID_W; x++) {
      let type: CellType = 'floor';
      const temp = 20 + Math.random() * 15;

      if (x === 0 || x === GRID_W - 1 || y === 0 || y === GRID_H - 1) {
        type = 'wall';
      } else if (randomize) {
        // Domain randomization
        const r = Math.random();
        if (r < 0.06) type = 'thermal_zone';
        else if (r < 0.09) type = 'hazard';
        else if (r < 0.11) type = 'energy_unit';
        else if (r < 0.14) type = 'maintenance_bay';
        else if (r < 0.17) type = 'storage';
        else if (r < 0.25) type = 'transit';
      } else {
        // Default layout
        if ((x >= 3 && x <= 5 && y >= 2 && y <= 4) || (x >= 14 && x <= 16 && y >= 9 && y <= 11)) {
          type = 'thermal_zone';
        } else if ((x === 8 && y === 3) || (x === 12 && y === 7) || (x === 5 && y === 10)) {
          type = 'energy_unit';
        } else if (x >= 16 && x <= 18 && y >= 2 && y <= 3) {
          type = 'maintenance_bay';
        } else if (x >= 1 && x <= 2 && y >= 10 && y <= 12) {
          type = 'storage';
        } else if (y === 7 || x === 10) {
          type = 'transit';
        } else if (Math.random() < 0.04) {
          type = 'hazard';
        }
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

function randomFloorPos(facility: FacilityCell[][]): Position {
  for (let i = 0; i < 100; i++) {
    const x = 1 + Math.floor(Math.random() * (GRID_W - 2));
    const y = 1 + Math.floor(Math.random() * (GRID_H - 2));
    if (facility[y][x].type !== 'wall' && facility[y][x].type !== 'hazard') {
      return { x, y };
    }
  }
  return { x: 2, y: 2 };
}

function createAgents(facility: FacilityCell[][], randomize = false): AgentState[] {
  const baseAgents = [
    { id: 'agent-inspector', name: 'SCOUT-1', role: 'inspector' as const, energy: 95, health: 100, sensorAccuracy: 0.95, componentWear: 5 },
    { id: 'agent-maintenance', name: 'MAINT-7', role: 'maintenance' as const, energy: 88, health: 97, sensorAccuracy: 0.9, componentWear: 12 },
    { id: 'agent-drone', name: 'ARIA-3', role: 'drone' as const, energy: 100, health: 100, sensorAccuracy: 0.98, componentWear: 2 },
  ];

  const defaultPositions: Position[] = [{ x: 2, y: 2 }, { x: 17, y: 2 }, { x: 10, y: 7 }];

  return baseAgents.map((a, i) => ({
    ...a,
    position: randomize ? randomFloorPos(facility) : defaultPositions[i],
    status: 'idle' as const,
    currentTask: null,
    energy: randomize ? 50 + Math.random() * 50 : a.energy,
    health: randomize ? 60 + Math.random() * 40 : a.health,
    sensorAccuracy: randomize ? 0.6 + Math.random() * 0.4 : a.sensorAccuracy,
    componentWear: randomize ? Math.random() * 40 : a.componentWear,
  }));
}

const TASKS = [
  'Inspect thermal unit Alpha-3', 'Calibrate sensor array B-7', 'Repair conduit junction 12',
  'Survey corridor integrity', 'Check energy output variance', 'Replace degraded relay switch',
  'Monitor thermal anomaly zone', 'Recharge at maintenance bay', 'Clear blocked transit path',
  'Run diagnostic on unit C-4',
];

const CONSTRAINTS = [
  'Elevated thermal variance in sector', 'Energy reserves below optimal threshold',
  'Sensor accuracy degraded by 12%', 'Competing high-priority task queued',
  'Path congestion near transit corridor', 'Component wear approaching service limit',
  'Environmental hazard detected nearby', 'Time constraint on mission objective',
];

const TRADEOFFS = [
  'Energy savings +9%. Failure risk −22%.', 'Completion time +4min. Safety margin +31%.',
  'Efficiency −8%. Component longevity +15%.', 'Coverage −12%. Energy reserves preserved for critical task.',
  'Speed −20%. Sensor accuracy maintained above threshold.', 'Risk +5%. Task completion probability +28%.',
];

function generateLocalDecision(agent: AgentState, tick: number): Decision {
  const task = TASKS[Math.floor(Math.random() * TASKS.length)];
  const constraints: string[] = [];
  for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
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
    aiGenerated: false,
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
  const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
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

function getEnvironment(agent: AgentState, facility: FacilityCell[][]): { nearbyThermal: number; pathBlocked: boolean; maintenanceDist: number } {
  let nearbyThermal = 0;
  let pathBlocked = false;
  let maintenanceDist = 99;

  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const y = agent.position.y + dy;
      const x = agent.position.x + dx;
      if (y >= 0 && y < GRID_H && x >= 0 && x < GRID_W) {
        const cell = facility[y][x];
        if (cell.type === 'thermal_zone') nearbyThermal++;
        if (cell.blocked && Math.abs(dx) <= 1 && Math.abs(dy) <= 1) pathBlocked = true;
        if (cell.type === 'maintenance_bay') {
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist < maintenanceDist) maintenanceDist = dist;
        }
      }
    }
  }
  return { nearbyThermal, pathBlocked, maintenanceDist };
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(() => {
    const facility = createFacility();
    return {
      tick: 0,
      running: false,
      speed: 1,
      facility,
      agents: createAgents(facility),
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
    };
  });

  const [aiEnabled, setAiEnabled] = useState(false);
  const [energyHistory, setEnergyHistory] = useState<Record<string, EnergyDataPoint[]>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiPendingRef = useRef(false);

  // AI decision fetcher — runs every 15 ticks for a random agent
  useEffect(() => {
    if (!aiEnabled || !state.running) return;
    if (state.tick % 15 !== 0 || state.tick === 0) return;
    if (aiPendingRef.current) return;

    const agent = state.agents[Math.floor(Math.random() * state.agents.length)];
    const env = getEnvironment(agent, state.facility);
    const activeFailures = state.failures.filter(f => !f.resolved);

    aiPendingRef.current = true;
    fetchAIDecision(agent, env, activeFailures, agent.currentTask).then(decision => {
      aiPendingRef.current = false;
      if (decision) {
        setState(prev => ({
          ...prev,
          decisions: [decision, ...prev.decisions].slice(0, 50),
          metrics: { ...prev.metrics, totalDecisions: prev.metrics.totalDecisions + 1 },
        }));
      }
    });
  }, [state.tick, state.running, aiEnabled]);

  const tick = useCallback(() => {
    setState(prev => {
      const newTick = prev.tick + 1;
      const newAgents = prev.agents.map(agent => {
        const newPos = agent.status !== 'critical' ? moveAgent(agent, prev.facility) : agent.position;
        const energyDrain = agent.role === 'drone' ? 0.3 : 0.5;
        const newEnergy = Math.max(0, agent.energy - energyDrain * (Math.random() * 0.5 + 0.75));
        const newHealth = Math.max(0, agent.health - (Math.random() < 0.05 ? Math.random() * 3 : 0));
        let status = agent.status;
        if (newEnergy < 10) status = 'critical';
        else if (newEnergy < 25) status = 'recovering';
        else if (Math.random() < 0.3) status = 'working';
        else if (Math.random() < 0.5) status = 'moving';
        else status = 'idle';
        const cell = prev.facility[newPos.y]?.[newPos.x];
        const recharging = cell?.type === 'maintenance_bay';
        return {
          ...agent,
          position: newPos,
          energy: recharging ? Math.min(100, newEnergy + 5) : newEnergy,
          health: newHealth,
          status,
          componentWear: Math.min(100, agent.componentWear + Math.random() * 0.3),
          sensorAccuracy: Math.max(0.5, agent.sensorAccuracy - (Math.random() < 0.1 ? 0.01 : 0)),
          currentTask: TASKS[Math.floor(Math.random() * TASKS.length)],
        };
      });

      let newDecisions = [...prev.decisions];
      if (newTick % 3 === 0) {
        const agent = newAgents[Math.floor(Math.random() * newAgents.length)];
        const decision = generateLocalDecision(agent, newTick);
        newDecisions = [decision, ...newDecisions].slice(0, 50);
      }

      let newFailures = [...prev.failures];
      const failure = generateFailure(newTick, newAgents);
      if (failure) newFailures = [failure, ...newFailures].slice(0, 30);
      newFailures = newFailures.map(f =>
        !f.resolved && Date.now() - f.timestamp > 8000 + Math.random() * 12000 ? { ...f, resolved: true } : f
      );

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

  // Track energy history per agent
  useEffect(() => {
    if (!state.running || state.tick % 5 !== 0) return;
    setEnergyHistory(prev => {
      const next = { ...prev };
      state.agents.forEach(agent => {
        const history = next[agent.id] || [];
        next[agent.id] = [...history, {
          tick: state.tick,
          energy: agent.energy,
          health: agent.health,
          sensorAccuracy: agent.sensorAccuracy * 100,
        }].slice(-60);
      });
      return next;
    });
  }, [state.tick, state.running]);

  const start = useCallback(() => setState(prev => ({ ...prev, running: true })), []);
  const pause = useCallback(() => setState(prev => ({ ...prev, running: false })), []);
  const setSpeed = useCallback((speed: number) => setState(prev => ({ ...prev, speed })), []);

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
      return { ...prev, failures: [failure, ...prev.failures].slice(0, 30), activeFailures: prev.activeFailures + 1 };
    });
  }, []);

  const randomize = useCallback(() => {
    const facility = createFacility(true);
    const agents = createAgents(facility, true);
    setState(prev => ({
      ...prev,
      tick: 0,
      facility,
      agents,
      decisions: [],
      failures: [],
      activeFailures: 0,
      metrics: {
        taskCompletionRate: 70 + Math.random() * 20,
        energyEfficiency: 75 + Math.random() * 20,
        meanRecoveryTime: 3 + Math.random() * 5,
        decisionLatency: 0.1 + Math.random() * 0.3,
        uptimePercent: 92 + Math.random() * 8,
        failuresHandled: 0,
        totalDecisions: 0,
      },
    }));
    setEnergyHistory({});
  }, []);

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(tick, 1000 / state.speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.running, state.speed, tick]);

  return { state, start, pause, setSpeed, injectFailure, randomize, aiEnabled, setAiEnabled, energyHistory };
}
