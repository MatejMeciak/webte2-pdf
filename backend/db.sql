-- SQL Script to create database schema for the PDF application

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS pdfdb;

-- Connect to the database
\c pdfdb;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE
);

-- Create pdf_operation_history table
CREATE TABLE IF NOT EXISTS pdf_operation_history (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    operation_type VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    source_type VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255),
    country VARCHAR(255),
    state VARCHAR(255),
    user_agent VARCHAR(255),
    request_details VARCHAR(1000)
);

-- Insert initial admin user (password is 'admin123' encrypted with BCrypt)
INSERT INTO users (first_name, last_name, email, password, role, enabled)
VALUES (
    'Admin', 
    'User', 
    'admin@example.com', 
    '$2a$10$rGZ0JfgDLYtNtYXNL3/QEOw.3XQp8LkgSNJOkdW7XyK2rW0vFpBDG', 
    'ADMIN',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_history_user_id ON pdf_operation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON pdf_operation_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_history_operation_type ON pdf_operation_history(operation_type);
CREATE INDEX IF NOT EXISTS idx_history_country ON pdf_operation_history(country);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comments
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE pdf_operation_history IS 'Tracks all PDF operations performed by users';
COMMENT ON COLUMN pdf_operation_history.source_type IS 'API or Frontend';
COMMENT ON COLUMN pdf_operation_history.request_details IS 'Details of the operation performed';