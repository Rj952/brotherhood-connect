-- ═══════════════════════════════════════════════════════════
-- BROTHERHOOD CONNECT — Database Schema
-- ═══════════════════════════════════════════════════════════
-- Run this in your Vercel Postgres dashboard or via db:setup

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  role          VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  invited_by    VARCHAR(255) DEFAULT 'Direct registration',
  reason        TEXT,
  first_login   BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at   TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(20) UNIQUE NOT NULL,
  created_by  VARCHAR(255) NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  used_by     VARCHAR(255),
  used_at     TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session tracking (optional, for analytics)
CREATE TABLE IF NOT EXISTS login_events (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address  VARCHAR(45)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
