-- Add matching fields to users table
ALTER TABLE `users` 
ADD COLUMN `latitude` DECIMAL(10, 8) NULL,
ADD COLUMN `longitude` DECIMAL(11, 8) NULL,
ADD COLUMN `personalityTraits` JSON NULL DEFAULT (CAST('[]' AS JSON)),
ADD COLUMN `matchPreferences` JSON NULL DEFAULT (CAST('{"maxDistance": 10, "personalityTraits": [], "availabilityPreference": {}, "weights": {"distance": 0.3, "experience": 0.2, "rating": 0.2, "personality": 0.3}}' AS JSON)); 