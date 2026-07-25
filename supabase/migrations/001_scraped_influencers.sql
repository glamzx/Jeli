-- Run this in Supabase SQL Editor to enable persistent scraped influencer storage

CREATE TABLE IF NOT EXISTS scraped_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  profile_data JSONB NOT NULL,
  scraped_by UUID REFERENCES users(id) ON DELETE SET NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraped_influencers_username ON scraped_influencers(username);
CREATE INDEX IF NOT EXISTS idx_scraped_influencers_scraped_at ON scraped_influencers(scraped_at DESC);
