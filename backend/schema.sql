CREATE DATABASE IF NOT EXISTS golf_charity_platform;
USE golf_charity_platform;

-- If signup says unknown column (e.g. role): import fix_signup_unknown_column.sql
-- or drop/recreate this DB and re-import the full schema.
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  otp VARCHAR(64) NULL,
  otp_expiry DATETIME NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  plan ENUM('monthly', 'yearly') NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  start_date DATETIME NOT NULL,
  expiry_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stores payment attempts and results (simulation mode supported).
-- For real integrations (Stripe/Razorpay), `provider` and `provider_payment_id` will be used.
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('monthly', 'yearly') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  provider VARCHAR(30) NOT NULL DEFAULT 'simulation',
  payment_method VARCHAR(30) NOT NULL DEFAULT 'simulation',
  provider_payment_id VARCHAR(120) NULL,
  status ENUM('succeeded', 'failed', 'pending') NOT NULL DEFAULT 'succeeded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  value INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (value >= 1 AND value <= 45)
);

CREATE TABLE IF NOT EXISTS charities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  donation_percentage INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (donation_percentage >= 10 AND donation_percentage <= 100)
);

CREATE TABLE IF NOT EXISTS user_charities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  charity_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS draws (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draw_date DATETIME NOT NULL,
  numbers_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Denormalized table to simplify "latest draw" queries for the user experience.
-- We store the latest draw metadata here and reference the original `draws` row.
CREATE TABLE IF NOT EXISTS draw_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draw_id INT NOT NULL UNIQUE,
  draw_date DATETIME NOT NULL,
  numbers_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS draw_winners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draw_id INT NOT NULL,
  user_id INT NOT NULL,
  matched_count INT NOT NULL,
  prize ENUM('Jackpot', 'Second Prize', 'Third Prize') NOT NULL,
  matched_numbers_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
SHOW TABLES;
USE golf_charity_platform;
DESCRIBE USERS;

ALTER TABLE users 
ADD COLUMN otp VARCHAR(6),
ADD COLUMN otp_expiry DATETIME,
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

DESCRIBE users;
show tables;
