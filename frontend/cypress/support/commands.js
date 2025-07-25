// ***********************************************************
// You can read more here:
// https://on.cypress.io/custom-commands
// ***********************************************************

// Custom command to wait for server to be ready
Cypress.Commands.add('waitForServer', () => {
  cy.request({
    url: 'http://localhost:5173',
    failOnStatusCode: false,
    timeout: 30000
  }).then((response) => {
    if (response.status !== 200) {
      cy.log('Server not ready, retrying...')
      cy.wait(2000)
      cy.waitForServer()
    }
  })
})

// Custom command to register a user
Cypress.Commands.add('register', (username, email, password) => {
  cy.visit('/register')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('input[name="confirmPassword"]').type(password)
  cy.get('[data-testid="register-button"]').click()
  
  // Wait for the API call to complete and check for errors
  cy.wait(2000)
  
  // Check if there's an error message
  cy.get('body').then(($body) => {
    if ($body.find('.bg-red-50').length > 0) {
      cy.get('.bg-red-50').should('be.visible')
      cy.log('Registration failed with error')
    } else {
      // Wait for redirect and check if we're on the home page
      cy.url().should('not.include', '/login')
      cy.url().should('not.include', '/register')
      cy.get('h2').should('contain', 'My Todos')
    }
  })
})

// Custom command to login a user
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  
  // Wait for the API call to complete and check for errors
  cy.wait(2000)
  
  // Check if there's an error message
  cy.get('body').then(($body) => {
    if ($body.find('.bg-red-50').length > 0) {
      cy.get('.bg-red-50').should('be.visible')
      cy.log('Login failed with error')
    } else {
      // Wait for redirect and check if we're on the home page
      cy.url().should('not.include', '/login')
      cy.url().should('not.include', '/register')
      cy.get('h2').should('contain', 'My Todos')
    }
  })
})

// Custom command to create a todo
Cypress.Commands.add('createTodo', (title, description = '') => {
  cy.get('[data-testid="todo-input"]').type(title)
  if (description) {
    cy.get('textarea[placeholder="Add description (optional)"]').type(description)
  }
  cy.get('[data-testid="add-todo-button"]').click()
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
  cy.get('h2').should('contain', 'Sign in to your account')
})

// Custom command to clear database (for testing)
Cypress.Commands.add('clearDatabase', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/test/clear-database`,
    failOnStatusCode: false
  })
})

// Custom command to create test user via API
Cypress.Commands.add('createTestUser', (userData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: userData,
    failOnStatusCode: false
  })
})

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('#root').should('be.visible')
})

// Custom command to check if todo exists
Cypress.Commands.add('todoShouldExist', (title) => {
  cy.contains(title).should('be.visible')
})

// Custom command to check if todo doesn't exist
Cypress.Commands.add('todoShouldNotExist', (title) => {
  cy.contains(title).should('not.exist')
})

// Custom command to edit todo
Cypress.Commands.add('editTodo', (oldTitle, newTitle, newDescription = '') => {
  cy.contains(oldTitle).parent().parent().parent().find('[data-testid="edit-todo-button"]').click()
  cy.get('input[placeholder="Todo title"]').clear().type(newTitle)
  if (newDescription !== undefined && newDescription !== '') {
    cy.get('textarea[placeholder="Description (optional)"]').clear().type(newDescription)
  } else if (newDescription === '') {
    cy.get('textarea[placeholder="Description (optional)"]').clear()
  }
  cy.get('button').contains('Save').click()
})

// Custom command to delete todo
Cypress.Commands.add('deleteTodo', (title) => {
  cy.contains(title).parent().parent().parent().find('[data-testid="delete-todo-button"]').click()
})

// Custom command to toggle todo completion
Cypress.Commands.add('toggleTodo', (title) => {
  cy.contains(title).parent().parent().parent().find('[data-testid="todo-checkbox"]').click()
})

// Custom command to check todo completion status
Cypress.Commands.add('todoShouldBeCompleted', (title) => {
  cy.contains(title).parent().parent().parent().should('have.class', 'opacity-75')
  cy.contains(title).should('have.class', 'line-through')
})

// Custom command to check todo is not completed
Cypress.Commands.add('todoShouldNotBeCompleted', (title) => {
  cy.contains(title).parent().parent().parent().should('not.have.class', 'opacity-75')
  cy.contains(title).should('not.have.class', 'line-through')
}) 