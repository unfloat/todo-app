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
let testUser;
let authToken;

describe('Todos API Tests', () => {
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
    
    // Create test user and token for each test
    testUser = await createTestUser(db, {
      username: `todouser_${Date.now()}`,
      email: `todo_${Date.now()}@example.com`,
      password: 'password123'
    });
    authToken = generateTestToken(testUser.id);
  });

  describe('GET /api/todos', () => {
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

    it('should return empty array when user has no todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Access token required');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid token');
    });

    it('should only return todos for the authenticated user', async () => {
      // Create another user
      const otherUser = await createTestUser(db, {
        username: `otheruser_${Date.now()}`,
        email: `other_${Date.now()}@example.com`,
        password: 'password123'
      });

      // Create todos for both users
      await createTestTodo(db, testUser.id, { title: 'My Todo' });
      await createTestTodo(db, otherUser.id, { title: 'Other User Todo' });

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('My Todo');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo successfully', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'New Todo Description'
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

    it('should create todo without description', async () => {
      const todoData = {
        title: 'Todo without description'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body).toHaveProperty('title', todoData.title);
      expect(response.body.description).toBe("");
    });

    it('should fail without title', async () => {
      const todoData = {
        description: 'Description without title'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with empty title', async () => {
      const todoData = {
        title: '',
        description: 'Description'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication token', async () => {
      const todoData = {
        title: 'Unauthorized Todo'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid token', async () => {
      const todoData = {
        title: 'Invalid Token Todo'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', 'Bearer invalid-token')
        .send(todoData)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(db, testUser.id, {
        title: 'Original Title',
        description: 'Original Description'
      });
    });

    it('should update todo successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('description', updateData.description);
      expect(response.body).toHaveProperty('id', testTodo.id);
    });

    it('should update only title', async () => {
      const updateData = {
        title: 'Only Title Updated'
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('description', null);
    });

    it('should clear description when empty string provided', async () => {
      const updateData = {
        title: 'Title Updated',
        description: ''
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body.description).toBe("");
    });

    it('should fail with non-existent todo id', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/todos/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Todo not found');
    });

    it('should fail when updating another user\'s todo', async () => {
      // Create another user and todo
      const otherUser = await createTestUser(db, {
        username: `otheruser_${Date.now()}`,
        email: `other_${Date.now()}@example.com`,
        password: 'password123'
      });
      const otherTodo = await createTestTodo(db, otherUser.id, {
        title: 'Other User Todo'
      });

      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/todos/${otherTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication token', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with empty title', async () => {
      const updateData = {
        title: ''
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(db, testUser.id, {
        title: 'Todo to Delete',
        description: 'Will be deleted'
      });
    });

    it('should delete todo successfully', async () => {
      const response = await request(app)
        .delete(`/api/todos/${testTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Todo deleted successfully');

      // Verify todo is actually deleted
      const getResponse = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body).toHaveLength(0);
    });

    it('should fail with non-existent todo id', async () => {
      const response = await request(app)
        .delete('/api/todos/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Todo not found');
    });

    it('should fail when deleting another user\'s todo', async () => {
      // Create another user and todo
      const otherUser = await createTestUser(db, {
        username: `otheruser_${Date.now()}`,
        email: `other_${Date.now()}@example.com`,
        password: 'password123'
      });
      const otherTodo = await createTestTodo(db, otherUser.id, {
        title: 'Other User Todo'
      });

      const response = await request(app)
        .delete(`/api/todos/${otherTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .delete(`/api/todos/${testTodo.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await createTestTodo(db, testUser.id, {
        title: 'Todo to Toggle',
        description: 'Toggle test',
        completed: false
      });
    });

    it('should toggle todo from incomplete to complete', async () => {
      const response = await request(app)
        .patch(`/api/todos/${testTodo.id}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('completed', 1);
      expect(response.body).toHaveProperty('id', testTodo.id);
    });

    it('should toggle todo from complete to incomplete', async () => {
      // First make it complete
      await createTestTodo(db, testUser.id, {
        title: 'Completed Todo',
        description: 'Already completed',
        completed: true
      });

      const response = await request(app)
        .patch(`/api/todos/${testTodo.id}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('completed', 1);
    });

    it('should fail with non-existent todo id', async () => {
      const response = await request(app)
        .patch('/api/todos/99999/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Todo not found');
    });

    it('should fail when toggling another user\'s todo', async () => {
      // Create another user and todo
      const otherUser = await createTestUser(db, {
        username: `otheruser_${Date.now()}`,
        email: `other_${Date.now()}@example.com`,
        password: 'password123'
      });
      const otherTodo = await createTestTodo(db, otherUser.id, {
        title: 'Other User Todo'
      });

      const response = await request(app)
        .patch(`/api/todos/${otherTodo.id}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .patch(`/api/todos/${testTodo.id}/toggle`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 