-- Supabase SQL Schema for NCLEX Student Portal
-- Run this in Supabase SQL Editor to create all required tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    subscription_status TEXT DEFAULT 'free_trial' CHECK (subscription_status IN ('free_trial', 'paid', 'expired')),
    subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'annual')),
    subscription_end_date TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress (question attempts)
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    selected_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1
);

-- Practice sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    questions JSONB NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    current_question_index INTEGER DEFAULT 0,
    results JSONB
);

-- Question flags (for review later)
CREATE TABLE IF NOT EXISTS question_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Question notes
CREATE TABLE IF NOT EXISTS question_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Wellness logs
CREATE TABLE IF NOT EXISTS wellness_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),
    energy INTEGER CHECK (energy >= 1 AND energy <= 5),
    study_minutes INTEGER DEFAULT 0,
    breaks_taken INTEGER DEFAULT 0,
    notes TEXT,
    UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_question ON user_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_progress_attempted ON user_progress(attempted_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_flags_user ON question_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON question_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_user ON wellness_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_date ON wellness_logs(date);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
-- Note: Service role key bypasses RLS, so server-side queries will work

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON practice_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own flags" ON question_flags
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes" ON question_notes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wellness" ON wellness_logs
    FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notes_updated_at
    BEFORE UPDATE ON question_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
