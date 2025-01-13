-- Add new fields for smart matching
ALTER TABLE users
ADD COLUMN geolocation TEXT,
ADD COLUMN experience VARCHAR(255),
ADD COLUMN averageRating FLOAT DEFAULT 0,
ADD COLUMN hourlyRate FLOAT DEFAULT 0,
ADD COLUMN availability TEXT,
ADD COLUMN specialNeedsExperience BOOLEAN DEFAULT false,
ADD COLUMN preferences TEXT; 