const request = require('supertest');
const path = require('path');

// Import test helpers
const {
  setupTestDatabase,
  clearTestDatabase,
  createTestUser,
  generateTestToken,
  createTestTodo,
  closeDatabase
} = require('./helpers');

let app;
let db;

describe('Basic API Tests', () => {
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

  describe('Authentication', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
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
    });

    it('should login successfully with valid credentials', async () => {
      // First register a user
      const userData = {
        username: 'logintestuser',
        email: 'login@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Then login
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should fail login with invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('Todos', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      // Create test user and token for each test
      testUser = await createTestUser(db, {
        username: 'todouser',
        email: 'todo@example.com',
        password: 'password123'
      });
      authToken = generateTestToken(testUser.id);
    });

    it('should create a new todo successfully', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body).toHaveProperty('title', todoData.title);
      expect(response.body).toHaveProperty('description', todoData.description);
      expect(response.body).toHaveProperty('completed', 0);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('user_id', testUser.id);
    });

    it('should get all todos for authenticated user', async () => {
      // Create some test todos
      const todo1 = await createTestTodo(db, testUser.id, { title: 'Todo 1', description: 'Description 1' });
      const todo2 = await createTestTodo(db, testUser.id, { title: 'Todo 2', description: 'Description 2' });

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      
      // Check that both todos exist, regardless of order
      const todoTitles = response.body.map(todo => todo.title);
      expect(todoTitles).toContain('Todo 1');
      expect(todoTitles).toContain('Todo 2');
    });

    it('should update a todo successfully', async () => {
      // Create a todo first
      const todo = await createTestTodo(db, testUser.id, {
        title: 'Original Title',
        description: 'Original Description'
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/todos/${todo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('description', updateData.description);
      expect(response.body).toHaveProperty('id', todo.id);
    });

    it('should delete a todo successfully', async () => {
      // Create a todo first
      const todo = await createTestTodo(db, testUser.id, {
        title: 'Todo to Delete',
        description: 'Will be deleted'
      });

      const response = await request(app)
        .delete(`/api/todos/${todo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Todo deleted successfully');
    });

    it('should toggle todo completion', async () => {
      // Create a todo first
      const todo = await createTestTodo(db, testUser.id, {
        title: 'Todo to Toggle',
        description: 'Toggle test',
        completed: false
      });

      const response = await request(app)
        .patch(`/api/todos/${todo.id}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('completed', 1);
      expect(response.body).toHaveProperty('id', todo.id);
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Access token required');
    });
  });
}); 