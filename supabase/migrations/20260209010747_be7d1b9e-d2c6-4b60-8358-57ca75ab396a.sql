
-- Replay sessions table (public, no auth needed for this simulation tool)
CREATE TABLE public.replay_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  start_time BIGINT NOT NULL,
  end_time BIGINT NOT NULL,
  total_decisions INTEGER NOT NULL DEFAULT 0,
  total_failures INTEGER NOT NULL DEFAULT 0,
  final_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  snapshots JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.replay_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write (simulation tool, no auth)
CREATE POLICY "Anyone can read replay sessions"
  ON public.replay_sessions FOR SELECT USING (true);

CREATE POLICY "Anyone can insert replay sessions"
  ON public.replay_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete replay sessions"
  ON public.replay_sessions FOR DELETE USING (true);
