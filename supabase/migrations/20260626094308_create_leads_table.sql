CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  requirement TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for anon access (public lead submission)
CREATE POLICY "insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_leads" ON leads FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "update_leads" ON leads FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_leads_submitted_at ON leads(submitted_at DESC);