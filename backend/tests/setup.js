// Test setup file
const path = require('path');
const fs = require('fs');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Create test database directory if it doesn't exist
const testDbDir = path.join(__dirname, '..', 'test-db');
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}

// Set test database path
process.env.DB_PATH = path.join(testDbDir, 'test-todo.db');

// Global test timeout
jest.setTimeout(10000); 