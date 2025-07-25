const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./todo.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Todos table
    db.run(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ 
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Todo routes

// Get all todos for a user
app.get('/api/todos', authenticateToken, (req, res) => {
  db.all('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, todos) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(todos);
  });
});

// Create a new todo
app.post('/api/todos', authenticateToken, (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)',
    [req.user.id, title, description || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating todo' });
      }

      db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, todo) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching created todo' });
        }
        res.status(201).json(todo);
      });
    }
  );
});

// Update a todo
app.put('/api/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  db.run(
    'UPDATE todos SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [title, description, completed ? 1 : 0, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating todo' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      db.get('SELECT * FROM todos WHERE id = ?', [id], (err, todo) => {
        if (err) {
          return res.status(500).json({ error: 'Error fetching updated todo' });
        }
        res.json(todo);
      });
    }
  );
});

// Delete a todo
app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting todo' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  });
});

// Toggle todo completion
app.patch('/api/todos/:id/toggle', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT completed FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id], (err, todo) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const newCompleted = todo.completed ? 0 : 1;

    db.run(
      'UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [newCompleted, id, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error updating todo' });
        }

        db.get('SELECT * FROM todos WHERE id = ?', [id], (err, updatedTodo) => {
          if (err) {
            return res.status(500).json({ error: 'Error fetching updated todo' });
          }
          res.json(updatedTodo);
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 