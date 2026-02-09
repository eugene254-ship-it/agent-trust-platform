import { useState, useCallback, useRef } from 'react';
import type { AgentState, DelegationEvent, Position } from '@/types/simulation';

const ROLE_CAPABILITIES: Record<string, Record<string, number>> = {
  inspector: { inspect: 1.0, survey: 0.9, calibrate: 0.7, repair: 0.3, monitor: 0.8, clear: 0.4, diagnostic: 0.8, recharge: 0.5 },
  maintenance: { inspect: 0.4, survey: 0.3, calibrate: 0.6, repair: 1.0, monitor: 0.4, clear: 0.8, diagnostic: 0.5, recharge: 0.6 },
  drone: { inspect: 0.7, survey: 1.0, calibrate: 0.5, repair: 0.2, monitor: 0.9, clear: 0.3, diagnostic: 0.6, recharge: 0.4 },
};

function distance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function taskKeyword(task: string): string {
  const lower = task.toLowerCase();
  if (lower.includes('inspect')) return 'inspect';
  if (lower.includes('survey') || lower.includes('corridor')) return 'survey';
  if (lower.includes('calibrat')) return 'calibrate';
  if (lower.includes('repair') || lower.includes('replace')) return 'repair';
  if (lower.includes('monitor') || lower.includes('thermal')) return 'monitor';
  if (lower.includes('clear') || lower.includes('blocked')) return 'clear';
  if (lower.includes('diagnostic') || lower.includes('check')) return 'diagnostic';
  if (lower.includes('recharge') || lower.includes('maintenance bay')) return 'recharge';
  return 'inspect';
}

function capabilityScore(role: string, task: string): number {
  const keyword = taskKeyword(task);
  return ROLE_CAPABILITIES[role]?.[keyword] ?? 0.5;
}

export function useCoordination() {
  const [delegations, setDelegations] = useState<DelegationEvent[]>([]);
  const [enabled, setEnabled] = useState(false);
  const tickRef = useRef(0);

  const evaluateDelegation = useCallback((agents: AgentState[], tick: number): DelegationEvent | null => {
    if (!enabled) return null;
    tickRef.current = tick;

    // Only evaluate every 8 ticks
    if (tick % 8 !== 0) return null;

    // Find agent struggling most (low energy, high wear, or mismatched task)
    let worstAgent: AgentState | null = null;
    let worstScore = Infinity;

    for (const agent of agents) {
      if (!agent.currentTask) continue;
      const cap = capabilityScore(agent.role, agent.currentTask);
      const energyFactor = agent.energy / 100;
      const healthFactor = agent.health / 100;
      const score = cap * energyFactor * healthFactor;
      if (score < worstScore && score < 0.5) {
        worstScore = score;
        worstAgent = agent;
      }
    }

    if (!worstAgent || !worstAgent.currentTask) return null;

    // Find best candidate to take over
    let bestCandidate: AgentState | null = null;
    let bestCandidateScore = 0;

    for (const agent of agents) {
      if (agent.id === worstAgent.id) continue;
      if (agent.status === 'critical') continue;
      if (agent.energy < 20) continue;

      const cap = capabilityScore(agent.role, worstAgent.currentTask!);
      const dist = distance(agent.position, worstAgent.position);
      const proxFactor = Math.max(0, 1 - dist / 30);
      const energyFactor = agent.energy / 100;
      const score = cap * 0.5 + proxFactor * 0.3 + energyFactor * 0.2;

      if (score > bestCandidateScore) {
        bestCandidateScore = score;
        bestCandidate = agent;
      }
    }

    if (!bestCandidate || bestCandidateScore < 0.4) return null;

    const dist = distance(worstAgent.position, bestCandidate.position);
    const fromCap = capabilityScore(worstAgent.role, worstAgent.currentTask);
    const toCap = capabilityScore(bestCandidate.role, worstAgent.currentTask);

    // Only delegate if the candidate is meaningfully better
    if (toCap <= fromCap + 0.15) return null;

    const reasons: string[] = [];
    if (fromCap < 0.5) reasons.push(`${worstAgent.name} has low capability (${(fromCap * 100).toFixed(0)}%) for this task`);
    if (worstAgent.energy < 30) reasons.push(`${worstAgent.name} energy critically low (${worstAgent.energy.toFixed(0)}%)`);
    if (toCap > fromCap) reasons.push(`${bestCandidate.name} has ${(toCap * 100).toFixed(0)}% capability vs ${(fromCap * 100).toFixed(0)}%`);
    if (dist < 8) reasons.push(`Proximity advantage: ${dist} cells apart`);

    const delegation: DelegationEvent = {
      id: `deleg-${tick}-${worstAgent.id}`,
      tick,
      timestamp: Date.now(),
      fromAgentId: worstAgent.id,
      fromAgentName: worstAgent.name,
      toAgentId: bestCandidate.id,
      toAgentName: bestCandidate.name,
      task: worstAgent.currentTask,
      reason: reasons.join('. '),
      proximityDist: dist,
      capabilityScore: bestCandidateScore,
      accepted: Math.random() > 0.15, // 85% acceptance rate
    };

    return delegation;
  }, [enabled]);

  const addDelegation = useCallback((event: DelegationEvent) => {
    setDelegations(prev => [event, ...prev].slice(0, 30));
  }, []);

  return { delegations, enabled, setEnabled, evaluateDelegation, addDelegation };
}
