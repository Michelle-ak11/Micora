ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Accounts that exist today count as verified
UPDATE users SET email_verified = TRUE;