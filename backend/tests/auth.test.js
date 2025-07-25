const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Import test helpers
const {
  setupTestDatabase,
  clearTestDatabase,
  createTestUser,
  generateTestToken,
  closeDatabase
} = require('./helpers');

let app;
let db;

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    // Set test environment variables first
    process.env.DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'test-db', 'test-todo.db');
    process.env.NODE_ENV = 'test';
    
    // Setup test database
    db = await setupTestDatabase();
    
    // Import test server after database is set up
    const testServer = require('../test-server');
    app = testServer.app;
    testServer.setTestDatabasePath(global.testDbPath);
  });

  afterAll(async () => {
    await closeDatabase(db);
  });

  beforeEach(async () => {
    await clearTestDatabase(db);
    // Add a small delay to ensure database is fully cleared
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const timestamp = Date.now();
      const userData = {
        username: `newuser_${timestamp}`,
        email: `newuser_${timestamp}@example.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with duplicate username', async () => {
      const timestamp = Date.now();
      // Create first user
      await createTestUser(db, {
        username: `duplicateuser_${timestamp}`,
        email: `user1_${timestamp}@example.com`,
        password: 'password123'
      });

      // Try to register with same username
      const userData = {
        username: `duplicateuser_${timestamp}`,
        email: `user2_${timestamp}@example.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Username or email already exists');
    });

    it('should fail with duplicate email', async () => {
      const timestamp = Date.now();
      // Create first user
      await createTestUser(db, {
        username: `user1_${timestamp}`,
        email: `duplicate_${timestamp}@example.com`,
        password: 'password123'
      });

      // Try to register with same email
      const userData = {
        username: `user2_${timestamp}`,
        email: `duplicate_${timestamp}@example.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Username or email already exists');
    });

    it('should fail with missing required fields', async () => {
      const timestamp = Date.now();
      const userData = {
        username: `incompleteuser_${timestamp}`
        // Missing email and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });


  });

  describe('POST /api/auth/login', () => {
    let loginUser;
    
    beforeEach(async () => {
      // Create a test user for login tests
      loginUser = await createTestUser(db, {
        username: `logintestuser_${Date.now()}`,
        email: `login_${Date.now()}@example.com`,
        password: 'password123'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: loginUser.email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should fail with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should fail with wrong password', async () => {
      const loginData = {
        email: loginUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should fail with missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with missing password', async () => {
      const loginData = {
        email: loginUser.email
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await createTestUser(db, {
        username: `profileuser_${Date.now()}`,
        email: `profile_${Date.now()}@example.com`,
        password: 'password123'
      });
      authToken = generateTestToken(testUser.id);
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Access token required');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid token');
    });

    it('should fail with malformed token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 