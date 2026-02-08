import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { agent, environment, failures, currentTask } = await req.json();

    const systemPrompt = `You are the decision engine for an autonomous infrastructure agent operating in a geothermal facility simulation called SANCTUM-SIM.

You must reason about trade-offs and output a JSON decision. You are NOT a chatbot. You are a planner.

Agent Profile:
- Name: ${agent.name}
- Role: ${agent.role}
- Energy: ${agent.energy.toFixed(1)}%
- Health: ${agent.health.toFixed(1)}%
- Sensor Accuracy: ${(agent.sensorAccuracy * 100).toFixed(1)}%
- Component Wear: ${agent.componentWear.toFixed(1)}%
- Position: (${agent.position.x}, ${agent.position.y})
- Current Status: ${agent.status}
${currentTask ? `- Current Task: ${currentTask}` : ''}

Environment:
- Active failures: ${failures.length}
${failures.map((f: any) => `  - ${f.severity.toUpperCase()}: ${f.description}`).join('\n')}
- Nearby thermal zones: ${environment.nearbyThermal}
- Path blocked: ${environment.pathBlocked}
- Nearest maintenance bay distance: ${environment.maintenanceDist} cells

DECISION RULES:
1. If energy < 15%, prioritize recharging over all other tasks
2. If health < 30%, seek maintenance bay
3. If there's a severe active failure affecting this agent, switch to recovery
4. Balance task completion against resource preservation
5. Always explain the trade-off numerically

Output a JSON object with these exact fields:
{
  "action": "string - what the agent should do next",
  "constraints": ["array of 2-3 active constraints being weighed"],
  "tradeoff": "string - quantified trade-off summary e.g. 'Energy savings +12%. Risk −18%.'",
  "alternatives": "string - what was considered but rejected and why",
  "energyCost": number (1-15),
  "riskDelta": number (-25 to +25, negative = risk reduction),
  "explanation": "string - 1-2 sentence human-readable explanation of the decision",
  "priority": "low|medium|high|critical"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Evaluate the current situation and produce your next decision as JSON.' },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited. Falling back to local decisions.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Using local decision engine.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response (might be wrapped in markdown)
    let decision;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      decision = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      decision = null;
    }

    if (!decision) {
      return new Response(JSON.stringify({ error: 'Failed to parse AI decision', raw: content }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ decision, aiGenerated: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('agent-decision error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
