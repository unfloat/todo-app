# Todo App with Authentication

A full-stack todo application built with React, Express.js, and SQLite. Features user authentication, CRUD operations for todos, and comprehensive testing with Cypress (E2E) and Jest (API).

## Features

- 🔐 User authentication (register/login)
- ✅ Create, read, update, and delete todos
- 🎯 Mark todos as complete/incomplete
- 📝 Add descriptions to todos
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 JWT-based authentication
- 💾 SQLite database for data persistence
- ⚡ Fast development with Vite
- 🧪 Comprehensive testing (E2E + API)

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios  
**Backend:** Node.js, Express.js, SQLite3, bcryptjs, jsonwebtoken, CORS  
**Testing:** Cypress (E2E), Jest + Supertest (API)

## Project Structure

```
todo-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   └── App.jsx         # Main app component
│   ├── cypress/            # E2E tests
│   └── package.json
├── backend/                 # Express API server
│   ├── tests/              # API tests
│   ├── server.js           # Main server
│   └── package.json
└── package.json            # Root package.json
```

## Quick Start

### Prerequisites

- Node.js **v22.x**

### Installation

```bash
cd todo-app
npm run install:all
```

### Run Application

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 5173) servers.

### Open Browser

Navigate to `http://localhost:5173`

## Development

### Individual Commands

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Build for production
npm run build
```

## Testing

### Frontend E2E Tests (Cypress)

```bash
# Run all E2E tests
npm run test:e2e

# Open Cypress test runner
npm run test:e2e:open

# Run E2E tests with dev servers
npm run test:e2e:dev
```

### Frontend Unit Tests (Vitest + React Testing Library)

```bash
# Run all unit tests
npm run test:frontend

# Run tests in watch mode with UI
npm run test:frontend:ui

# Run tests with coverage
npm run test:frontend:coverage

# Run tests with coverage UI
npm run test:frontend:coverage:ui
```

### Backend API Tests (Jest + Supertest)

```bash
# Run all API tests
npm run test:api

# Run API tests in watch mode
npm run test:api:watch

# Run API tests with coverage
npm run test:api:coverage

# Generate HTML coverage report
npm run test:api:coverage:html

# Open coverage report in browser
npm run test:api:coverage:open
```

### Test Coverage

- **E2E Tests:** Authentication, Todo CRUD operations, End-to-end workflows
- **API Tests:** Authentication endpoints, Todo CRUD endpoints, Error handling
- **Unit Tests:** React component testing with Vitest + React Testing Library
- **Total:** 50+ API tests + 4 E2E test suites + 20+ unit tests

## API Endpoints

**Authentication:**

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

**Todos (protected):**

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/toggle` - Toggle completion

## Usage

1. **Register/Login** at `http://localhost:5173/register`
2. **Create todos** using the form
3. **Manage todos** with checkbox, edit, and delete buttons
4. **Track progress** with completion counter

## Database

SQLite database (`todo.db`) created automatically with:

- `users` table - User accounts
- `todos` table - Todo items

## Security

- Password hashing (bcryptjs)
- JWT authentication
- Protected routes
- Input validation
- SQL injection prevention

## Environment Variables

For production:

- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both E2E and API tests)
5. Ensure coverage meets 80% threshold
6. Submit a pull request

## License

MIT License
