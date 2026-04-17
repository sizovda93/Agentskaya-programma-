-- Manager numbers: unique code managers share with agents during recruitment
CREATE SEQUENCE IF NOT EXISTS manager_number_seq START WITH 100;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manager_number INT UNIQUE;

-- Assign numbers to existing managers
UPDATE profiles
SET manager_number = nextval('manager_number_seq')
WHERE role = 'manager' AND manager_number IS NULL;

-- Auto-assign on future manager creation (handled in app code, but default for safety)
