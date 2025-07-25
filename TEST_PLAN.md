# Test Plan - React Todo Application

## 1. Overview

This document outlines the testing strategy for the React Todo Application, a full-stack web application built with React (frontend), Express.js (backend), and SQLite (database). The application provides user authentication and todo management functionality.

## 2. What is Being Tested

### 2.1 Frontend Components

- **Authentication Components**: Login and Register forms with validation
- **Todo Management Components**: TodoForm (creation), TodoItem (individual todo), TodoApp (main container)
- **Navigation Components**: Navbar with logout functionality
- **User Interface**: Form interactions, state management, error handling

### 2.2 Backend API Endpoints

- **Authentication Routes**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
- **Todo Routes**: `/api/todos` (CRUD operations), `/api/todos/:id/toggle`
- **Middleware**: JWT authentication, input validation, error handling
- **Database Operations**: SQLite queries, data persistence

### 2.3 End-to-End User Workflows

- **User Registration and Login**: Complete authentication flow
- **Todo Lifecycle**: Create, read, update, delete, and toggle todos
- **Data Persistence**: Verify data survives page refreshes and sessions
- **Error Scenarios**: Invalid inputs, network failures, authentication errors

## 3. Test Coverage Areas

### 3.1 Frontend Unit Tests (Vitest + React Testing Library)

**Coverage**: Reports generated (no minimum threshold enforced)

**Test Areas**:

- Component rendering and UI elements
- User interactions (clicks, form inputs, state changes)
- Form validation and error handling
- API integration with mocked responses
- Loading states and disabled conditions
- Component lifecycle and state management

**Files Tested**:

- `Login.jsx` - Authentication form and logic
- `TodoForm.jsx` - Todo creation form
- `TodoItem.jsx` - Individual todo management

### 3.2 Backend API Tests (Jest + Supertest)

**Coverage**: Reports generated (no minimum threshold enforced)

**Test Areas**:

- HTTP endpoint functionality
- Request/response validation
- Database operations and data integrity
- Authentication and authorization
- Error handling and edge cases
- Input validation and sanitization

**Endpoints Tested**:

- Authentication: Register, Login, Profile
- Todos: Create, Read, Update, Delete, Toggle

### 3.3 End-to-End Tests (Cypress)

**Test Areas**:

- Complete user workflows
- Cross-browser compatibility
- Real API integration
- UI responsiveness and interactions
- Data persistence across sessions

**Test Suites**:

- Authentication flow (register, login, logout)
- Todo management (CRUD operations)
- End-to-end workflows (full user journey)
- Error handling and edge cases

## 4. Tools Used and Why

### 4.1 Frontend Testing

- **Vitest**: Fast unit testing framework optimized for Vite projects
- **React Testing Library**: Promotes testing user behavior over implementation details
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: Realistic user interaction simulation
- **jsdom**: DOM environment for component testing

### 4.2 Backend Testing

- **Jest**: Comprehensive testing framework with built-in mocking
- **Supertest**: HTTP assertion library for API testing
- **SQLite3**: In-memory database for isolated test environments

### 4.3 End-to-End Testing

- **Cypress**: Modern E2E testing framework with real browser automation
- **wait-on**: Utility for waiting on server availability
- **concurrently**: Run multiple processes simultaneously

### 4.4 Coverage

- **@vitest/coverage-v8**: Code coverage for frontend tests
- **nyc**: Code coverage for backend tests

## 5. How to Run the Tests

### 5.1 Frontend Tests

```bash
# Run unit tests
npm run test:frontend

# Run tests with visual UI
npm run test:frontend:ui

# Run tests with coverage
npm run test:frontend:coverage

# Run tests with coverage UI
npm run test:frontend:coverage:ui
```

### 5.2 Backend Tests

```bash
# Run API tests
npm run test:api

# Run tests in watch mode
npm run test:api:watch

# Run tests with coverage
npm run test:api:coverage

# Generate HTML coverage report
npm run test:api:coverage:html
```

### 5.3 End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Open Cypress UI
npm run test:e2e:open

# Run E2E tests with dev servers
npm run test:e2e:dev
```

### 5.4 All Tests

```bash
# Install all dependencies
npm run install:all

# Run backend tests
npm run test:api

# Run frontend tests
npm run test:frontend

# Run E2E tests (requires servers running)
npm run test:e2e
```

## 6. Test Environment Setup

### 6.1 Prerequisites

- Node.js 22x
- npm 8.x or higher
- Git

### 6.2 Database Setup

- **Development**: SQLite database (`todo.db`) created automatically
- **Testing**: In-memory SQLite databases for isolated test runs

### 6.3 Environment Variables

```bash
# Backend
NODE_ENV=test
JWT_SECRET=test-secret-key
DB_PATH=./test-db/test.db

# Frontend
VITE_API_URL=http://localhost:5000
```

## 7. Assumptions and Limitations

### 7.1 Assumptions

- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Network**: Stable internet connection for API calls
- **Performance**: Tests run on development-grade hardware
- **Data**: Test data is isolated and doesn't affect production

### 7.2 Limitations

- **Visual Testing**: No automated visual regression testing
- **Mobile Testing**: Limited mobile device testing (desktop-focused)
- **Performance Testing**: No load or stress testing implemented
- **Security Testing**: Basic security testing only (no penetration testing)
- **Accessibility**: No automated accessibility testing

### 7.3 Known Issues

- **Test Isolation**: Some tests may have timing dependencies
- **Database Constraints**: Foreign key constraints disabled in test environment
- **Coverage Gaps**: Some utility functions and error boundaries not fully covered

## 8. Test Data Management

### 8.1 Test Fixtures

- **Users**: Predefined test users for authentication tests
- **Todos**: Sample todo items for CRUD operation tests
- **API Responses**: Mocked responses for frontend testing

### 8.2 Data Cleanup

- **Unit Tests**: Automatic cleanup after each test
- **E2E Tests**: Database reset between test runs
- **API Tests**: Isolated database instances per test file

## 10. Maintenance and Updates

### 10.1 Regular Tasks

- Update test dependencies quarterly
- Review and update test data as needed
- Monitor test execution times and optimize
- Update test documentation with new features

### 10.2 Test Maintenance

- Refactor tests when components change
- Add tests for new features
- Remove obsolete tests
- Update test selectors if UI changes

---

**Document Version**: 1.0  
**Last Updated**: July 2025
**Maintained By**: Development Team
