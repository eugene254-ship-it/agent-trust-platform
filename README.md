# SANCTUM-SIM

> **Autonomous infrastructure simulation for systems that must reason before they act.**

SANCTUM-SIM is a simulation-first platform for designing, evaluating, and operating autonomous agents in hostile infrastructure environments.

It demonstrates a simple but difficult proposition:

> **Autonomous systems can reason about trade-offs across time, risk, and resources — and justify those decisions — before touching real hardware.**

SANCTUM-SIM is not a robotics animation, pathfinding demo, or character simulator.

It is a **governed autonomy platform** where agents operate under finite resources, uncertainty, degraded conditions, competing objectives, and failure.

The system is built to answer a more important question than:

> *“Can the robot do the task?”*

It answers:

> *“Why did the system choose this action, what did it sacrifice, what risks did it accept, and what happened when reality changed?”*

---

## Table of Contents

* [Product Thesis](#product-thesis)
* [What SANCTUM-SIM Proves](#what-sanctum-sim-proves)
* [Core Product](#core-product)
* [System Boundary](#system-boundary)
* [Simulation World](#simulation-world)
* [Autonomous Agents](#autonomous-agents)
* [Decision Engine](#decision-engine)
* [Explainable Autonomy](#explainable-autonomy)
* [Failure and Recovery](#failure-and-recovery)
* [Architecture](#architecture)
* [System Data Flow](#system-data-flow)
* [Decision Lifecycle](#decision-lifecycle)
* [Metrics](#metrics)
* [Browser Experience](#browser-experience)
* [Scenario Engine](#scenario-engine)
* [Deterministic Replay](#deterministic-replay)
* [Domain Randomization](#domain-randomization)
* [Technology Stack](#technology-stack)
* [Repository Structure](#repository-structure)
* [Core Domain Model](#core-domain-model)
* [API Surface](#api-surface)
* [Event Model](#event-model)
* [Configuration](#configuration)
* [Local Development](#local-development)
* [Running the Simulation](#running-the-simulation)
* [Observability](#observability)
* [Security and Governance](#security-and-governance)
* [Testing Strategy](#testing-strategy)
* [Evaluation Framework](#evaluation-framework)
* [Demo Scenario](#demo-scenario)
* [Product Roadmap](#product-roadmap)
* [Why This Becomes a Company](#why-this-becomes-a-company)
* [Design Principles](#design-principles)
* [License](#license)

---

# Product Thesis

Modern autonomy systems often optimize for task execution:

```text
observe → plan → act
```

SANCTUM-SIM introduces another requirement:

```text
observe
   ↓
estimate state
   ↓
generate alternatives
   ↓
evaluate constraints
   ↓
score trade-offs
   ↓
select action
   ↓
explain decision
   ↓
act
   ↓
measure outcome
   ↓
adapt
```

The platform treats autonomous agents as **economic and ecological actors operating inside constrained environments**.

Every meaningful action consumes something.

Every action has an opportunity cost.

Every action carries some degree of failure risk.

Every failure changes the state of the world.

The agent therefore cannot simply reset and try again.

---

# What SANCTUM-SIM Proves

SANCTUM-SIM succeeds only when the system demonstrates all of the following:

### 1. Constraint-aware autonomy

Agents have finite:

* energy
* time
* operational capacity
* component health
* task bandwidth
* risk tolerance

### 2. Non-trivial trade-offs

The best action is not always:

* the fastest
* the shortest
* the safest
* the cheapest

The planner must balance competing objectives.

### 3. Explainable decisions

Every consequential decision produces a structured explanation.

### 4. Failure adaptation

The system changes behavior when:

* sensors degrade
* components fail
* routes become blocked
* thermal conditions change
* task execution fails

### 5. Operational metrics

The system reports metrics that can answer deployment questions.

### 6. Replayability

A scenario can be replayed deterministically and compared against previous runs.

---

# Core Product

SANCTUM-SIM consists of six major layers:

```text
┌──────────────────────────────────────────────┐
│                  UX / OPS                    │
│ Live Simulation · Decisions · Metrics       │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│                CONTROL LAYER                 │
│ Tasks · Agent Lifecycle · Message Bus       │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│               DECISION LAYER                 │
│ Planner · Costs · Risk · Arbitration         │
│ Explanation Engine                           │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│                AGENT RUNTIME                 │
│ State · Sensors · Actuation · Health         │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│              SIMULATION LAYER                │
│ Terrain · Thermal Field · Assets · Hazards  │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│             SCENARIO / REPLAY               │
│ Seeds · Faults · Randomization · Scoring    │
└──────────────────────────────────────────────┘
```

---

# System Boundary

## Explicitly In Scope

* simulation-first autonomy
* autonomous agent state
* uncertainty-aware decision making
* cost-based planning
* safety constraints
* task arbitration
* failure injection
* recovery behavior
* explainable decisions
* browser-visible telemetry
* operational metrics
* deterministic scenario replay
* domain randomization
* scenario scoring

## Explicitly Out of Scope

* physical robot integration
* high-fidelity hardware simulation
* production robot control
* anthropomorphic agent behavior
* character animation
* end-to-end ML training pipelines
* realistic mechanical rendering for its own sake

The simulator exists to test **decision realism**, not visual realism.

---

# Simulation World

## Geothermal + Logistics Facility

SANCTUM-SIM uses a hostile industrial environment as its reference world.

The environment contains:

* geothermal generation units
* thermal extraction zones
* energy storage
* maintenance buildings
* transit corridors
* inspection targets
* charging stations
* restricted areas
* degraded terrain

### Environmental state

Each simulation tick may update:

```json
{
  "ambient_temperature": 41.7,
  "thermal_variance": 0.18,
  "grid_load": 0.73,
  "path_congestion": 0.21,
  "visibility": 0.84,
  "sensor_noise": 0.11,
  "fault_rate": 0.06
}
```

---

# Hazards

The environment intentionally creates conditions where the optimal action changes over time.

Examples:

### Thermal hazard

A corridor becomes increasingly hot.

A robot may:

* continue directly
* detour
* wait for cooling
* request assistance

The shortest route may no longer be the cheapest route.

### Blocked path

A route becomes unavailable during a mission.

The agent must replan.

### Sensor degradation

A thermal sensor begins returning noisy readings.

The agent must reduce confidence and modify behavior.

### Component failure

A wheel, actuator, communication module, or inspection sensor begins degrading.

The agent must decide whether to:

* continue
* return to maintenance
* request another agent
* abandon the current task
* reprioritize the mission

---

# Autonomous Agents

SANCTUM-SIM initially supports three agent classes.

## Inspection Agent

Primary responsibilities:

* thermal inspection
* visual inspection
* anomaly detection
* routine patrols
* asset verification

State includes:

```text
energy
battery_health
sensor_health
mobility_health
temperature_exposure
task_load
current_task
risk_budget
location
confidence
```

---

## Maintenance Agent

Primary responsibilities:

* repair
* component servicing
* energy station support
* route clearing
* recovery assistance

Maintenance agents generally have:

* higher payload capability
* higher energy consumption
* longer task durations
* broader intervention capability

---

## Optional Observer Agent

Aerial or fixed observation agent.

Responsibilities:

* facility-wide monitoring
* telemetry
* camera observation
* route state estimation
* anomaly detection

The observer does not perform physical intervention.

---

# Agent Internal State

Each agent maintains a continuously updated state model.

```typescript
interface AgentState {
  id: string;

  position: Vector3;

  energy: number;
  maxEnergy: number;

  health: {
    mobility: number;
    sensors: number;
    communications: number;
    thermal: number;
  };

  confidence: {
    perception: number;
    localization: number;
    environment: number;
  };

  tasks: TaskRef[];

  currentTask?: TaskRef;

  riskBudget: number;

  mode:
    | "IDLE"
    | "EXECUTING"
    | "REPLANNING"
    | "RECOVERING"
    | "MAINTENANCE"
    | "RETURNING"
    | "FAILED";
}
```

---

# Decision Engine

This is the core of SANCTUM-SIM.

The planner does not simply select the first valid action.

It generates candidates and evaluates them.

## Planning Equation

A simplified action score:

```text
Score(action) =
    w_energy   × EnergyCost
  + w_time     × CompletionTime
  + w_risk     × FailureProbability
  + w_oppty    × OpportunityCost
  + w_health   × HealthImpact
  + w_uncert   × Uncertainty
```

Lower cost is better.

However, hard safety constraints are evaluated before scoring.

---

# Safety Floors

Safety rules are deterministic.

Examples:

```text
IF energy < reserve_threshold
    → prohibit non-essential tasks

IF thermal_exposure > safe_limit
    → prohibit route

IF sensor_confidence < minimum_confidence
    → require verification

IF mobility_health < critical_threshold
    → prohibit extended transit
```

Safety constraints cannot be overridden by preference.

This prevents a high-level planner from rationalizing unsafe behavior.

---

# Candidate Actions

A planner may generate:

```text
CONTINUE_TASK
DETOUR
WAIT
RETURN_TO_BASE
CHARGE
REQUEST_ASSISTANCE
ESCALATE
REASSIGN_TASK
INSPECT
REPAIR
ABORT_TASK
```

Each action is scored against the current world state.

---

# Opportunity Cost

SANCTUM-SIM explicitly models opportunity cost.

Example:

```text
Agent A can repair Asset X immediately.

Option 1:
Repair X
+ asset restored quickly
- consumes 31% energy
- unavailable for 11 minutes

Option 2:
Request Agent B
+ Agent A remains available
- repair delayed 6 minutes
+ lower fleet disruption

Option 3:
Defer repair
+ preserves resources
- increased probability of asset failure
```

The planner chooses based on current mission priorities and system state.

---

# Continuous Decision Loop

Every agent runs continuously:

```text
┌──────────────┐
│ Sense        │
└──────┬───────┘
       ↓
┌──────────────┐
│ Update State │
└──────┬───────┘
       ↓
┌───────────────┐
│ Generate      │
│ Alternatives  │
└──────┬────────┘
       ↓
┌───────────────┐
│ Apply Safety  │
│ Constraints   │
└──────┬────────┘
       ↓
┌───────────────┐
│ Score Actions │
└──────┬────────┘
       ↓
┌───────────────┐
│ Select Action │
└──────┬────────┘
       ↓
┌────────────────┐
│ Explain        │
│ Decision       │
└──────┬─────────┘
       ↓
┌───────────────┐
│ Execute       │
└──────┬────────┘
       ↓
┌───────────────┐
│ Observe       │
│ Outcome       │
└──────┬────────┘
       │
       └──────────→ next cycle
```

---

# Explainable Autonomy

Every consequential planner decision produces an explanation artifact.

This is a first-class data object.

It is **not merely a log message**.

## Explanation Schema

```typescript
interface DecisionExplanation {
  id: string;

  agentId: string;

  timestamp: number;

  action: {
    type: string;
    target?: string;
  };

  constraints: {
    name: string;
    impact: number;
    severity: "low" | "medium" | "high" | "critical";
  }[];

  tradeoffs: {
    selected: string;
    rejected: string[];
  };

  deltas: {
    metric: string;
    value: number;
    unit?: string;
    direction: "positive" | "negative" | "neutral";
  }[];

  confidence: number;

  rationale: string;

  stateSnapshotId: string;
}
```

---

# Example Explanation

```text
ACTION
Delay inspection of Turbine T-04

CONSTRAINTS
Thermal variance: HIGH
Energy reserve: MEDIUM
Sensor confidence: MEDIUM

TRADE-OFF
Waiting increases completion time by 6 minutes.
Continuing immediately increases failure exposure.

DELTA
Energy usage: -9%
Estimated failure risk: -22%
Completion time: +6 min

RATIONALE
Thermal readings became unstable near the inspection zone.
Waiting for a lower-variance window reduces exposure while
preserving sufficient energy for the return route.

CONFIDENCE
0.91
```

The UI should make this understandable to a human without requiring access to the planner source code.

---

# Explanation Generation

SANCTUM-SIM supports three modes.

## Deterministic

Template-generated explanations from planner state.

Advantages:

* auditable
* reproducible
* deterministic
* low latency

## LLM

An LLM converts structured planner state into natural-language explanations.

The LLM does not make the operational decision.

## Hybrid

Preferred architecture:

```text
planner
   ↓
structured rationale
   ↓
validation
   ↓
LLM wording
   ↓
schema validation
   ↓
human-readable explanation
```

The LLM is therefore a **reasoning narrator**, not the safety authority.

---

# Explanation Integrity

An explanation is considered invalid when it describes facts that do not exist in the planner state.

The system should therefore validate:

```text
claimed_energy_delta
        ↓
planner.energy_delta

claimed_risk
        ↓
planner.risk_estimate

claimed_constraint
        ↓
planner.constraint_set
```

This creates a separation between:

```text
Decision Truth
      ↓
Explanation Surface
```

---

# Failure as a First-Class Citizen

Failure is not an exception to the system.

Failure is part of the system.

SANCTUM-SIM deliberately injects failures during operation.

## Failure Types

### Sensor

* noisy readings
* missing values
* stale telemetry
* biased measurements
* partial sensor outage

### Mechanical

* mobility degradation
* actuator degradation
* overheating
* component failure

### Environmental

* thermal spike
* blocked path
* congestion
* visibility reduction

### Task

* inspection failure
* communication failure
* maintenance failure
* unavailable resource

---

# Recovery Model

The platform does not reset agents when a failure occurs.

Instead:

```text
failure
   ↓
detect
   ↓
classify
   ↓
estimate impact
   ↓
replan
   ↓
escalate if necessary
   ↓
execute recovery
   ↓
measure recovery
```

---

# Example Failure

```text
14:31:09
Inspection Agent A-02 detects sensor degradation.

14:31:10
Thermal confidence falls from 0.91 → 0.54.

14:31:11
Current inspection plan invalidated.

14:31:12
Planner evaluates:

- continue with uncertainty
- return to calibration
- request observer verification

14:31:13
Observer verification selected.

14:31:14
Inspection continues using external telemetry.

14:31:20
Task completes with 4.8% time penalty.

14:31:21
Recovery event recorded.
```

The demo should make moments like this visible.

---

# Agent-to-Agent Escalation

Agents can request assistance.

Example:

```json
{
  "type": "ASSISTANCE_REQUEST",
  "from": "inspection-02",
  "reason": "mobility_degradation",
  "location": [48.3, 12.1],
  "required_capability": "maintenance",
  "urgency": 0.72
}
```

Another agent evaluates whether accepting the request is itself worthwhile.

This creates fleet-level decision making.

---

# Fleet Coordination

At the fleet level, SANCTUM-SIM can model:

```text
global mission state
        ↓
task queue
        ↓
capability matching
        ↓
agent availability
        ↓
risk / energy evaluation
        ↓
task assignment
```

Task allocation should account for:

* current location
* battery state
* health
* capabilities
* projected travel time
* current commitments
* mission priority
* failure probability

---

# Architecture

```text
                        ┌─────────────────────┐
                        │   Browser / Web UI   │
                        │   React / Next.js   │
                        └──────────┬──────────┘
                                   │ WebSocket
                                   ▼
                        ┌─────────────────────┐
                        │      API / BFF      │
                        │ FastAPI / NestJS    │
                        └──────────┬──────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      ┌────────────┐       ┌─────────────┐      ┌──────────────┐
      │ Simulation │       │ Agent        │      │ Metrics /    │
      │ Runtime    │       │ Runtime     │      │ Event Store  │
      └─────┬──────┘       └──────┬──────┘      └──────┬───────┘
            │                     │                     │
            └──────────────┬──────┴─────────────────────┘
                           ▼
                  ┌──────────────────┐
                  │ Decision Engine  │
                  │                  │
                  │ Planner          │
                  │ Cost Engine      │
                  │ Risk Model       │
                  │ Task Arbitration │
                  │ Explanation      │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Message Bus       │
                  │ Redis / NATS      │
                  └──────────────────┘
```

---

# System Data Flow

```text
Simulation State
      ↓
Sensor Stream
      ↓
Agent State Estimator
      ↓
Planner
      ↓
Candidate Actions
      ↓
Safety Filter
      ↓
Cost / Risk Evaluation
      ↓
Selected Action
      ├──────────────→ Executor
      │
      └──────────────→ Explanation Engine
                              ↓
                         Decision Event
                              ↓
                   WebSocket / Event Stream
                              ↓
                           Browser
```

---

# Separation of Concerns

## Sensing

Answers:

> What do I currently observe?

## State Estimation

Answers:

> What do I believe is happening?

## Decision Layer

Answers:

> What should I do?

## Execution

Answers:

> Can I perform that action?

## Explanation

Answers:

> Why was this action chosen?

## Metrics

Answers:

> Did that decision work?

This separation makes the platform easier to audit and extend.

---

# Metrics

SANCTUM-SIM avoids vanity metrics.

Every metric must answer a real operational question.

## Task Completion Rate

```text
completed tasks
----------------
assigned tasks
```

Answers:

> Does the system reliably complete work?

---

## Energy Efficiency

```text
useful work
------------
energy consumed
```

Answers:

> How much resource does autonomy consume?

---

## Mean Recovery Time

```text
Σ recovery_duration
--------------------
number_of_failures
```

Answers:

> How quickly does the system recover from failure?

---

## Decision Latency

```text
decision_timestamp - observation_timestamp
```

Answers:

> Can the autonomy layer make decisions quickly enough?

---

## Explanation Confidence

Measures confidence in the generated explanation relative to the underlying structured planner state.

Answers:

> Can humans trust the rationale being shown?

---

# Additional Metrics

## Risk-Adjusted Completion

Measures successful completion while accounting for predicted failure exposure.

## Resource Reserve at Completion

Tracks remaining energy and operational margin.

## Replanning Frequency

Measures how often the world causes the agent to reconsider its plan.

## Avoided Failure Rate

Measures cases where an agent altered behavior early enough to prevent a predicted failure.

## Fleet Utilization

Measures active useful work across all agents.

## Cost of Recovery

Measures resources consumed recovering from failures.

---

# Browser Experience

The UI is a command center, not a dashboard graveyard.

A judge should understand the system within seconds.

---

# Main Screen

```text
┌──────────────────────────────────────────────────────────────┐
│ SANCTUM-SIM                                  RUN #004921     │
├───────────────────────┬──────────────────────────────────────┤
│                       │ SYSTEM HEALTH                        │
│                       │                                      │
│   LIVE SIMULATION     │ Completion      94.1%               │
│                       │ Energy Eff.     +17.4%              │
│   ● A-01              │ Recovery MTTR   42s                 │
│      ↘                │ Decision Lat.   81ms                │
│        ● T-04         │ Risk Exposure   LOW                │
│                       │                                      │
│   ● M-01              ├──────────────────────────────────────┤
│                       │ CURRENT DECISION                    │
│   thermal field       │ A-01 → WAIT                         │
│   terrain             │                                      │
│   logistics           │ “Thermal variance elevated...”      │
│                       │                                      │
│                       │ Energy −9%   Risk −22%              │
├───────────────────────┼──────────────────────────────────────┤
│ EVENT STREAM          │ ACTIVE TASKS                         │
│ 14:31:13 replanning   │ Inspect Turbine T-04                │
│ 14:31:14 assist req   │ Maintain Pump P-12                  │
│ 14:31:21 recovered    │ Survey Corridor C-07               │
└───────────────────────┴──────────────────────────────────────┘
```

---

# Required UI Modules

## Simulation View

Shows:

* agents
* terrain
* thermal fields
* infrastructure
* routes
* hazards
* blocked corridors

## Agent Inspector

Shows:

* energy
* health
* current task
* confidence
* action history
* active constraints

## Decision Stream

Streaming decision cards:

```text
A-02

DECISION
REQUEST ASSISTANCE

WHY
Mobility confidence dropped below threshold.

TRADE-OFF
+ Preserves agent safety
- Adds 4 min response time

IMPACT
Failure probability −31%
```

## Metrics Panel

Charts should focus on:

* energy
* risk
* completion
* recovery
* latency

## Event Timeline

Every important state transition is visible.

---

# Scenario Engine

Scenarios are declarative.

Example:

```yaml
scenario:
  id: geothermal-stress-01
  duration: 1800

environment:
  thermal_variance: 0.15
  path_block_probability: 0.08
  sensor_noise: 0.10

agents:
  inspection:
    count: 2

  maintenance:
    count: 1

tasks:
  - inspect: turbine-01
  - inspect: turbine-02
  - service: pump-03

faults:
  - at: 240
    type: sensor_degradation
    target: inspection-01

  - at: 510
    type: path_block
    target: corridor-07

  - at: 900
    type: component_failure
    target: maintenance-01
```

---

# Deterministic Replay

Every scenario is associated with:

```text
scenario_id
seed
simulation_version
planner_version
configuration_hash
```

This allows a run to be reproduced.

Example:

```bash
sanctum replay run_004921
```

The system should produce the same:

* environment evolution
* agent observations
* candidate actions
* decisions
* outcomes

when all deterministic parameters remain unchanged.

---

# Domain Randomization

Domain randomization changes environmental conditions while preserving the same mission structure.

Example parameters:

```text
thermal intensity
sensor noise
failure frequency
path availability
task density
energy consumption
travel cost
communication latency
```

Configuration:

```yaml
randomization:
  enabled: true

  thermal:
    min: 0.7
    max: 1.4

  sensor_noise:
    min: 0.05
    max: 0.25

  fault_rate:
    min: 0.01
    max: 0.15
```

This allows the system to answer:

> Does the policy remain effective when conditions change?

---

# Scenario Scoring

A scenario receives a composite operational score.

Example:

```text
Scenario Score

Task Completion            92
Energy Efficiency          88
Recovery Performance       95
Risk Management            91
Decision Latency            97
Explanation Integrity       94
──────────────────────────────
Operational Score           92.8
```

The score is for **scenario analysis**, not agent gamification.

---

# Technology Stack

A practical initial implementation:

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Three.js
* React Three Fiber
* Zustand
* WebSocket streaming

## Backend

* Python
* FastAPI
* Pydantic
* asyncio

## Decision Layer

* Python
* typed domain models
* deterministic planner
* configurable cost engine
* probabilistic risk model
* optional LLM interface

## Simulation

Start with a lightweight custom simulator.

Optional future adapters:

* Gazebo
* Isaac Sim
* Unity

The simulation interface should remain engine-agnostic.

## Messaging

Initial:

```text
WebSocket + asyncio
```

Scale-out:

```text
NATS / Redis Streams
```

## Storage

Development:

```text
SQLite
```

Production:

```text
PostgreSQL
TimescaleDB
```

## Observability

* OpenTelemetry
* Prometheus
* Grafana
* structured JSON logs

---

# Repository Structure

```text
sanctum-sim/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── simulation/
│   │   │   ├── agents/
│   │   │   ├── decisions/
│   │   │   ├── metrics/
│   │   │   └── scenarios/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── store/
│   │
│   └── api/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── websocket/
│       └── main.py
│
├── packages/
│   ├── domain/
│   │   ├── agents/
│   │   ├── tasks/
│   │   ├── environment/
│   │   ├── decisions/
│   │   ├── events/
│   │   └── metrics/
│   │
│   ├── decision-engine/
│   │   ├── planner/
│   │   ├── scoring/
│   │   ├── constraints/
│   │   ├── risk/
│   │   ├── arbitration/
│   │   └── explanations/
│   │
│   ├── simulation/
│   │   ├── world/
│   │   ├── physics/
│   │   ├── sensors/
│   │   ├── hazards/
│   │   ├── faults/
│   │   └── replay/
│   │
│   ├── orchestration/
│   │   ├── task-queue/
│   │   ├── fleet/
│   │   └── lifecycle/
│   │
│   └── contracts/
│       ├── events/
│       ├── api/
│       └── schemas/
│
├── scenarios/
│   ├── baseline/
│   ├── thermal-stress/
│   ├── cascading-failure/
│   └── randomized/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── simulation/
│   ├── planner/
│   ├── replay/
│   └── evaluation/
│
├── docs/
│   ├── architecture/
│   ├── decision-engine/
│   ├── scenarios/
│   ├── api/
│   └── research/
│
├── infra/
│   ├── docker/
│   ├── postgres/
│   ├── observability/
│   └── deployment/
│
├── scripts/
│   ├── seed-scenario.ts
│   ├── replay.ts
│   └── benchmark.py
│
├── docker-compose.yml
├── Makefile
├── package.json
├── pyproject.toml
├── .env.example
└── README.md
```

---

# Core Domain Model

## Task

```typescript
interface Task {
  id: string;

  type:
    | "INSPECT"
    | "MAINTAIN"
    | "TRANSPORT"
    | "SURVEY"
    | "RECOVER";

  priority: number;

  location: Vector3;

  deadline?: number;

  requiredCapabilities: string[];

  estimatedDuration: number;

  state:
    | "QUEUED"
    | "ASSIGNED"
    | "ACTIVE"
    | "BLOCKED"
    | "FAILED"
    | "COMPLETE";
}
```

---

# Decision

```typescript
interface Decision {
  id: string;

  agentId: string;

  timestamp: number;

  observationId: string;

  candidates: ActionCandidate[];

  selectedAction: ActionCandidate;

  safetyConstraints: ConstraintResult[];

  confidence: number;

  explanationId: string;
}
```

---

# Action Candidate

```typescript
interface ActionCandidate {
  action: string;

  estimatedEnergyCost: number;

  estimatedDuration: number;

  failureProbability: number;

  opportunityCost: number;

  healthImpact: number;

  uncertainty: number;

  totalScore: number;
}
```

---

# Event Model

Everything important becomes an event.

Examples:

```text
SIMULATION_STARTED
SIMULATION_PAUSED
SIMULATION_COMPLETED

AGENT_CREATED
AGENT_STATE_UPDATED
AGENT_FAILURE_DETECTED
AGENT_RECOVERY_STARTED
AGENT_RECOVERY_COMPLETED

TASK_CREATED
TASK_ASSIGNED
TASK_STARTED
TASK_BLOCKED
TASK_FAILED
TASK_COMPLETED

DECISION_CREATED
DECISION_EXECUTED
DECISION_REJECTED

EXPLANATION_CREATED
EXPLANATION_VALIDATED

FAULT_INJECTED
PATH_BLOCKED
SENSOR_DEGRADED
THERMAL_SPIKE_DETECTED
```

Example event:

```json
{
  "event": "DECISION_CREATED",
  "timestamp": 1780009123,
  "agent_id": "inspection-02",
  "decision_id": "dec-7821",
  "action": "REQUEST_ASSISTANCE",
  "confidence": 0.93
}
```

---

# API Surface

## Start Simulation

```http
POST /api/v1/simulations
```

```json
{
  "scenario": "thermal-stress",
  "seed": 98213
}
```

---

## Get Simulation State

```http
GET /api/v1/simulations/{simulationId}
```

---

## Stream Simulation

```text
WS /api/v1/simulations/{simulationId}/stream
```

---

## Get Agent

```http
GET /api/v1/agents/{agentId}
```

---

## Get Decisions

```http
GET /api/v1/agents/{agentId}/decisions
```

---

## Get Explanation

```http
GET /api/v1/decisions/{decisionId}/explanation
```

---

## Replay Scenario

```http
POST /api/v1/replay
```

---

## Score Run

```http
GET /api/v1/runs/{runId}/score
```

---

# Configuration

Example `.env`:

```bash
SANCTUM_ENV=development

API_HOST=0.0.0.0
API_PORT=8000

SIM_TICK_RATE=20

DATABASE_URL=postgresql://sanctum:sanctum@localhost:5432/sanctum

REDIS_URL=redis://localhost:6379

LLM_ENABLED=false
LLM_PROVIDER=
LLM_MODEL=

REPLAY_ENABLED=true
RANDOMIZATION_ENABLED=true
```

---

# Local Development

## Requirements

* Node.js 20+
* Python 3.11+
* Docker
* Docker Compose
* pnpm

---

## Install

```bash
git clone https://github.com/your-org/sanctum-sim.git

cd sanctum-sim

pnpm install

python -m venv .venv

source .venv/bin/activate

pip install -e .
```

---

# Start Infrastructure

```bash
docker compose up -d postgres redis
```

---

# Start API

```bash
make api
```

or:

```bash
uvicorn apps.api.main:app --reload --port 8000
```

---

# Start Web

```bash
pnpm --filter web dev
```

Open:

```text
http://localhost:3000
```

---

# Run Simulation

```bash
make sim
```

or:

```bash
python -m sanctum.simulation \
  --scenario scenarios/thermal-stress/default.yaml \
  --seed 98213
```

---

# Run Replay

```bash
make replay RUN=run_004921
```

---

# Run Benchmarks

```bash
make benchmark
```

---

# Observability

SANCTUM-SIM treats operational observability as a product feature.

Each run should expose:

```text
simulation latency
decision latency
event throughput
planner throughput
agent utilization
task throughput
failure frequency
recovery latency
```

Example Prometheus metrics:

```text
sanctum_decisions_total
sanctum_decision_latency_ms
sanctum_tasks_completed_total
sanctum_tasks_failed_total
sanctum_agent_energy_ratio
sanctum_recovery_duration_seconds
sanctum_explanation_validation_failures_total
```

---

# Security and Governance

Even though the system is simulation-first, the architecture should reflect real deployment concerns.

## Principle 1 — Safety overrides optimization

Safety constraints execute before cost optimization.

## Principle 2 — Decisions are auditable

Every decision references:

* state snapshot
* planner version
* configuration
* candidate actions
* selected action
* explanation

## Principle 3 — Explanations cannot rewrite reality

Human-readable explanations must remain grounded in structured planner state.

## Principle 4 — Deterministic replay

Important decisions must be reproducible.

## Principle 5 — Explicit uncertainty

The planner should expose confidence and uncertainty instead of pretending the world is fully observed.

---

# Testing Strategy

SANCTUM-SIM uses multiple layers of testing.

## Unit Tests

Validate:

* cost functions
* safety constraints
* risk calculations
* task assignment
* explanation generation

---

## Simulation Tests

Validate:

* thermal transitions
* component failures
* blocked routes
* degraded sensors
* energy depletion

---

## Planner Tests

For a fixed state:

```text
same input
→ same candidates
→ same constraints
→ same selected action
```

---

## Recovery Tests

Inject a failure and verify:

```text
failure
→ detection
→ replanning
→ recovery
→ mission continuation
```

---

## Explanation Tests

The system must reject explanations that contain unsupported claims.

Example:

```text
Planner:
energy_delta = -9%

LLM:
energy_delta = -27%

Result:
INVALID
```

---

## Replay Tests

A replay should produce equivalent:

* state transitions
* decisions
* metrics
* event sequence

within configured floating-point tolerances.

---

# Evaluation Framework

SANCTUM-SIM evaluates autonomy across five dimensions.

| Dimension      | Question                                                 |
| -------------- | -------------------------------------------------------- |
| Reliability    | Does the system complete assigned work?                  |
| Efficiency     | Does it use resources intelligently?                     |
| Resilience     | Does it recover from failure?                            |
| Explainability | Can humans understand why it acted?                      |
| Adaptability   | Does behavior change appropriately as conditions change? |

The system should not optimize these dimensions independently.

The point is to expose the trade-offs between them.

---

# Demo Scenario

## Scenario: Thermal Cascade

This is the canonical SANCTUM-SIM demo.

### Initial state

Three agents:

```text
Inspection A-01
Inspection A-02
Maintenance M-01
```

Mission:

```text
inspect four geothermal assets
maintain one pump
survey one logistics corridor
```

Initial environment:

```text
temperature: nominal
paths: available
sensors: healthy
energy: sufficient
```

---

## Event 1 — Thermal Drift

Asset T-04 begins producing elevated thermal variance.

A-01 detects the change.

Candidate decisions:

```text
continue
wait
detour
```

The system selects:

```text
WAIT
```

Explanation:

```text
Thermal variance increased beyond the preferred inspection threshold.

Waiting adds 6 minutes but reduces projected failure exposure by 22%
and reduces expected energy consumption by 9%.
```

---

## Event 2 — Sensor Degradation

A-02 experiences sensor degradation.

Confidence drops.

The planner invalidates the current strategy.

Options:

```text
continue independently
return for calibration
request observer verification
```

A-02 requests assistance.

The task remains active.

No reset occurs.

---

## Event 3 — Path Failure

A corridor becomes blocked.

M-01 is now 90 seconds away from an important maintenance objective.

It has enough energy to either:

```text
take the long route
```

or:

```text
assist A-02
```

The fleet coordinator evaluates the opportunity cost.

The selected plan changes.

---

## Event 4 — Component Failure

M-01 experiences mobility degradation.

The system:

```text
detects
→ reassesses
→ changes mission priority
→ requests assistance
→ preserves remaining energy
→ returns toward maintenance
```

Again:

**no reset.**

---

## Event 5 — Mission Recovery

The fleet completes its most important tasks.

Final dashboard:

```text
TASK COMPLETION          92%
ENERGY EFFICIENCY        +17%
FAILURE RECOVERY          41s
DECISION LATENCY          81ms
EXPLANATION VALIDITY      98%
```

The most important part of the demo is not the final number.

It is the visible chain:

```text
condition changed
      ↓
belief changed
      ↓
decision changed
      ↓
behavior changed
      ↓
mission adapted
```

---

# Product Modes

## Operator Mode

For live simulation observation.

Focus:

* current state
* alerts
* decisions
* mission status

---

## Analyst Mode

For evaluating runs.

Focus:

* decision history
* metrics
* trade-offs
* scenario comparison

---

## Replay Mode

For forensic analysis.

Focus:

* timeline
* state transitions
* fault injection
* planner decisions

---

## Benchmark Mode

For evaluating planner versions.

Focus:

* repeated runs
* standardized scenarios
* performance deltas
* regression detection

---

# Versioned Decision Engine

Planner versions are explicitly versioned.

Example:

```text
planner-v0.1
planner-v0.2
planner-v0.3
```

A scenario can be executed against multiple versions.

```text
Scenario 01
   ├── planner-v0.1
   ├── planner-v0.2
   └── planner-v0.3
```

This makes SANCTUM-SIM useful as an engineering validation system rather than a one-off showcase.

---

# Engineering Principles

## 1. Simulation before hardware

Test the intelligence before risking equipment.

## 2. State before storytelling

The system must know why it acted before explaining it.

## 3. Constraints before optimization

Safety floors are deterministic.

## 4. Failure before perfection

A system that has never failed has not demonstrated resilience.

## 5. Decisions before animations

The simulation exists to test reasoning.

## 6. Metrics before screenshots

Every product claim should be measurable.

## 7. Replay before trust

Important behavior must be reproducible.

---

# What SANCTUM-SIM Is Not

SANCTUM-SIM is not:

```text
❌ a robot game
❌ a pathfinding visualizer
❌ a chatbot attached to a simulator
❌ a scripted demo
❌ an LLM controlling motors directly
❌ a physics showcase
❌ a dashboard with moving dots
```

It is:

```text
✓ a governed autonomy simulator
✓ a decision evaluation platform
✓ a resilience testing environment
✓ an explainable planning system
✓ an operational validation harness
```

---

# Why This Becomes a Company

## Customer Pain

Real-world autonomy deployment is expensive.

Organizations need to answer:

* Will the system behave correctly under uncertainty?
* What happens when sensors fail?
* How much energy does autonomy consume?
* How does it recover?
* Can operators understand why it acted?
* Can two planner versions be compared?
* Can rare failure scenarios be tested repeatedly?

Physical testing answers these questions slowly and expensively.

SANCTUM-SIM moves this reasoning into software.

---

# Value Proposition

> **Test, train, and trust autonomous systems before deploying hardware.**

Potential markets include:

* energy infrastructure
* industrial inspection
* logistics
* mining
* utilities
* climate infrastructure
* autonomous fleet operations
* infrastructure maintenance
* warehouse robotics
* remote operations

---

# Product Expansion

The core platform can evolve from one simulated facility into a general autonomy validation layer.

```text
SANCTUM-SIM
     │
     ├── Energy
     │     ├── geothermal
     │     ├── solar
     │     └── grid infrastructure
     │
     ├── Industrial
     │     ├── inspection
     │     ├── maintenance
     │     └── asset management
     │
     ├── Logistics
     │     ├── fleet routing
     │     ├── warehouses
     │     └── remote logistics
     │
     └── Climate Infrastructure
           ├── environmental monitoring
           ├── water systems
           └── disaster response
```

---

# Roadmap

## Phase 1 — Core Simulation

* [ ] terrain engine
* [ ] geothermal facility
* [ ] thermal zones
* [ ] mobile agents
* [ ] energy model
* [ ] health model
* [ ] task system

## Phase 2 — Decision Intelligence

* [ ] candidate action generation
* [ ] deterministic safety layer
* [ ] cost engine
* [ ] risk model
* [ ] opportunity cost
* [ ] task arbitration

## Phase 3 — Explainability

* [ ] explanation schema
* [ ] deterministic templates
* [ ] explanation validation
* [ ] optional LLM narrator
* [ ] decision timeline

## Phase 4 — Failure and Recovery

* [ ] sensor faults
* [ ] mechanical faults
* [ ] environmental faults
* [ ] blocked paths
* [ ] escalation
* [ ] recovery metrics

## Phase 5 — Ops Platform

* [ ] browser command center
* [ ] real-time telemetry
* [ ] metrics
* [ ] alerting
* [ ] run history
* [ ] scenario management

## Phase 6 — Validation Harness

* [ ] deterministic replay
* [ ] domain randomization
* [ ] batch evaluation
* [ ] planner version comparison
* [ ] benchmark suites
* [ ] regression detection

## Phase 7 — Platform

* [ ] external scenario SDK
* [ ] simulator adapters
* [ ] organization accounts
* [ ] experiment management
* [ ] API access
* [ ] enterprise deployment

---

# Definition of Done

SANCTUM-SIM is considered successful when a first-time viewer can watch a run and observe:

```text
A hazard appears
        ↓
Agent detects uncertainty
        ↓
Agent evaluates alternatives
        ↓
Agent chooses a trade-off
        ↓
Agent explains the trade-off
        ↓
Environment changes
        ↓
Agent replans
        ↓
Agent fails or degrades
        ↓
Agent recovers
        ↓
Mission continues
```

The viewer should come away understanding:

> **The system is not merely following instructions. It is operating within a constrained world, evaluating consequences, adapting to changing conditions, and making its reasoning inspectable.**

---

# Final Product Standard

A weak demo causes the audience to say:

> “The robot is smart.”

A stronger system causes them to ask:

> “How did it decide that?”

SANCTUM-SIM should make the answer visible.

The goal is not to simulate a robot convincingly.

The goal is to make **autonomous decision-making measurable, replayable, governable, and understandable before real-world deployment.**

---

# Status

**Project:** SANCTUM-SIM
**Category:** Simulation-first autonomous infrastructure platform
**Primary Thesis:** Governed autonomy under uncertainty
**Current Target:** Geothermal + logistics infrastructure
**Architecture:** Simulation → Agent Runtime → Decision Engine → Ops Platform → Browser
**Deployment Philosophy:** Software-first validation before hardware exposure

---

# License

Choose a license appropriate to the intended commercial and open-source strategy.

Suggested options:

```text
Apache-2.0
MIT
AGPL-3.0
BUSL-1.1
Proprietary / Commercial
```

---

# Closing

```text
Observe.
Reason.
Trade off.
Explain.
Act.
Recover.
Learn.
Repeat.
```

**SANCTUM-SIM is infrastructure for making autonomy trustworthy before it becomes physical.**
