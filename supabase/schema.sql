-- ============================================
-- SUBLEASY - Full Database Schema
-- Run this in your Supabase SQL editor
-- ============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences (search criteria)
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  market TEXT NOT NULL CHECK (market IN ('berkeley', 'seattle')),
  move_in_start DATE NOT NULL,
  move_in_end DATE NOT NULL,
  move_out_start DATE NOT NULL,
  move_out_end DATE NOT NULL,
  max_budget INTEGER NOT NULL,
  room_type TEXT CHECK (room_type IN ('private', 'shared', 'studio', 'any')) DEFAULT 'any',
  furnished_required BOOLEAN DEFAULT FALSE,
  utilities_required BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table (scraped + user-submitted)
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('craigslist', 'zillow', 'facebook_submit', 'apartments_com')),
  external_id TEXT,                 -- original listing ID from source
  market TEXT NOT NULL CHECK (market IN ('berkeley', 'seattle')),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,           -- monthly rent in dollars
  room_type TEXT CHECK (room_type IN ('private', 'shared', 'studio')),
  furnished BOOLEAN DEFAULT FALSE,
  utilities_included BOOLEAN DEFAULT FALSE,
  available_start DATE,
  available_end DATE,
  address TEXT,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  distance_to_anchor NUMERIC(4,1), -- miles to campus (Berkeley) or downtown (Seattle)
  url TEXT NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);

-- Alerts sent (prevent duplicate notifications)
CREATE TABLE alerts_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Waitlist (for early marketing)
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  market TEXT CHECK (market IN ('berkeley', 'seattle', 'both')),
  role TEXT CHECK (role IN ('renter', 'lister', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast matching queries
CREATE INDEX idx_listings_market ON listings(market);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_active ON listings(active);
CREATE INDEX idx_listings_dates ON listings(available_start, available_end);
CREATE INDEX idx_preferences_market ON preferences(market);
CREATE INDEX idx_preferences_active ON preferences(active);
