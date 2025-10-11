-- Address Collector Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create addresses table
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_number VARCHAR(20) NOT NULL,
  street VARCHAR(255) NOT NULL,
  full_address VARCHAR(300) NOT NULL,
  city VARCHAR(100),
  province VARCHAR(100),
  
  -- Sales tracking fields
  visited VARCHAR(10) DEFAULT 'No',
  visit_date DATE,
  status VARCHAR(50) DEFAULT 'Sin Contactar',
  interest_level VARCHAR(20),
  contact_info TEXT,
  notes TEXT,
  follow_up_date DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Create unique constraint to prevent duplicates
  UNIQUE(house_number, street, city)
);

-- Create index for faster searches
CREATE INDEX idx_addresses_street ON addresses(street);
CREATE INDEX idx_addresses_city ON addresses(city);
CREATE INDEX idx_addresses_status ON addresses(status);
CREATE INDEX idx_addresses_visited ON addresses(visited);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_addresses_updated_at 
    BEFORE UPDATE ON addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional, for multi-user support later)
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on addresses" ON addresses
    FOR ALL USING (true) WITH CHECK (true);
