import { supabase } from '@/integrations/supabase/client';
import type { AgentState, FailureEvent, Decision } from '@/types/simulation';

interface AgentEnvironment {
  nearbyThermal: number;
  pathBlocked: boolean;
  maintenanceDist: number;
}

export async function fetchAIDecision(
  agent: AgentState,
  environment: AgentEnvironment,
  failures: FailureEvent[],
  currentTask: string | null
): Promise<Decision | null> {
  try {
    const { data, error } = await supabase.functions.invoke('agent-decision', {
      body: { agent, environment, failures: failures.filter(f => !f.resolved), currentTask },
    });

    if (error) {
      console.warn('AI decision fallback:', error.message);
      return null;
    }

    if (data?.error) {
      console.warn('AI decision error:', data.error);
      return null;
    }

    if (data?.decision) {
      const dec = data.decision;
      return {
        id: `ai-dec-${Date.now()}-${agent.id}`,
        agentId: agent.id,
        agentName: agent.name,
        timestamp: Date.now(),
        action: dec.action || 'Evaluate situation',
        constraints: dec.constraints || [],
        tradeoff: dec.tradeoff || '',
        alternatives: dec.alternatives || '',
        energyCost: dec.energyCost || 5,
        riskDelta: dec.riskDelta || 0,
        explanation: dec.explanation || 'AI-generated decision',
        priority: dec.priority || 'medium',
        aiGenerated: true,
      };
    }
    return null;
  } catch (e) {
    console.warn('AI decision fetch failed:', e);
    return null;
  }
}
