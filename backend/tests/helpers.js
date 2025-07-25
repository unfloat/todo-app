const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Test database setup
const setupTestDatabase = () => {
  return new Promise((resolve, reject) => {
    // Create a unique database file for each test run to ensure complete isolation
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const testId = `${timestamp}-${randomId}`;
    const dbPath = path.join(__dirname, '..', 'test-db', `test-todo-${testId}.db`);
    
    // Store the path globally so the test server can use it
    global.testDbPath = dbPath;
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Disable foreign key constraints for testing
      db.run('PRAGMA foreign_keys = OFF', (err) => {
        if (err) {
          // Foreign keys might not be enabled, which is fine
        }

        // Create tables
        db.serialize(() => {
          // Users table
          db.run(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);

          // Todos table
          db.run(`
            CREATE TABLE IF NOT EXISTS todos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              title TEXT NOT NULL,
              description TEXT,
              completed BOOLEAN DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              reject(err);
            } else {
              // Store the database instance globally for the test server to use
              global.testDb = db;
              resolve(db);
            }
          });
        });
      });
    });
  });
};

// Clear test database
const clearTestDatabase = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Delete all data
      db.run('DELETE FROM todos', (err) => {
        if (err) {
          reject(err);
          return;
        }
        db.run('DELETE FROM users', (err) => {
          if (err) {
            reject(err);
            return;
          }
          
                      // Reset auto-increment counters
            db.run('DELETE FROM sqlite_sequence WHERE name="todos"', (err) => {
              if (err) {
                // Sequence might not exist, which is fine
              }
              db.run('DELETE FROM sqlite_sequence WHERE name="users"', (err) => {
                if (err) {
                  // Sequence might not exist, which is fine
                }
              
              // Force a VACUUM to reset the database
              db.run('VACUUM', (err) => {
                if (err) {
                  // VACUUM might fail, which is fine
                }
                
                                    resolve();
              });
            });
          });
        });
      });
    });
  });
};

// Create test user
const createTestUser = async (db, userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const user = { ...defaultUser, ...userData };
  const hashedPassword = await bcrypt.hash(user.password, 10);
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [user.username, user.email, hashedPassword],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...user
          });
        }
      }
    );
  });
};

// Generate JWT token for test user
const generateTestToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Create test todo
const createTestTodo = (db, userId, todoData = {}) => {
  const defaultTodo = {
    title: 'Test Todo',
    description: 'Test Description',
    completed: false
  };
  
  const todo = { ...defaultTodo, ...todoData };
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO todos (user_id, title, description, completed) VALUES (?, ?, ?, ?)',
      [userId, todo.title, todo.description, todo.completed ? 1 : 0],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            user_id: userId,
            ...todo
          });
        }
      }
    );
  });
};

// Close database connection
const closeDatabase = (db) => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  setupTestDatabase,
  clearTestDatabase,
  createTestUser,
  generateTestToken,
  createTestTodo,
  closeDatabase
}; 