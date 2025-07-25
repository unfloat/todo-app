describe('End-to-End Todo App Workflow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should complete full user workflow: register, login, create, edit, complete, and delete todos', () => {
    const timestamp = Date.now()
    const testUser = {
      username: 'e2euser' + timestamp,
      email: 'e2e' + timestamp + '@example.com',
      password: 'password123'
    }

    const testTodos = [
      { title: 'Buy groceries', description: 'Milk, bread, eggs' },
      { title: 'Call dentist', description: 'Schedule annual checkup' },
      { title: 'Read book', description: 'Finish chapter 5' }
    ]

    // Step 1: Register new user
    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('[data-testid="register-button"]').click()

    // Wait for registration to complete
    cy.wait(2000)
    cy.url().should('not.include', '/register')
    cy.get('h2').should('contain', 'My Todos')

    // Step 2: Create multiple todos
    testTodos.forEach(todo => {
      cy.get('[data-testid="todo-input"]').type(todo.title)
      if (todo.description) {
        cy.get('textarea[placeholder="Add description (optional)"]').type(todo.description)
      }
      cy.get('[data-testid="add-todo-button"]').click()
      cy.wait(1000)
      cy.contains(todo.title).should('be.visible')
      if (todo.description) {
        cy.contains(todo.description).should('be.visible')
      }
    })

    // Assert all todos are created
    cy.get('p').contains('0 of 3 completed').should('be.visible')

    // Step 3: Edit a todo
    cy.contains('Buy groceries').parent().parent().parent().find('[data-testid="edit-todo-button"]').click()
    cy.get('input[placeholder="Todo title"]').clear().type('Buy groceries and snacks')
    cy.get('textarea[placeholder="Description (optional)"]').clear().type('Milk, bread, eggs, chips')
    cy.get('button').contains('Save').click()
    cy.wait(3000)
    // Check if the edit was successful by looking for the new title
    cy.contains('Buy groceries and snacks').should('be.visible')
    cy.contains('Milk, bread, eggs, chips').should('be.visible')
    // The old title might still be visible if edit didn't work, so we'll just check the new one exists

    // Step 4: Complete some todos
    cy.contains('Buy groceries and snacks').parent().parent().parent().find('[data-testid="todo-checkbox"]').click()
    cy.wait(1000)
    cy.contains('Call dentist').parent().parent().parent().find('[data-testid="todo-checkbox"]').click()
    cy.wait(1000)
    
    // Assert completion status - check for the opacity class on the todo container
    cy.contains('Buy groceries and snacks').closest('div.bg-white').should('have.class', 'opacity-75')
    cy.contains('Buy groceries and snacks').should('have.class', 'line-through')
    cy.contains('Call dentist').closest('div.bg-white').should('have.class', 'opacity-75')
    cy.contains('Call dentist').should('have.class', 'line-through')
    cy.contains('Read book').closest('div.bg-white').should('not.have.class', 'opacity-75')
    cy.get('p').contains('2 of 3 completed').should('be.visible')

    // Step 5: Delete a todo
    cy.contains('Call dentist').parent().parent().parent().find('[data-testid="delete-todo-button"]').click()
    cy.wait(1000)
    cy.contains('Call dentist').should('not.exist')
    cy.get('p').contains('1 of 2 completed').should('be.visible')

    // Step 6: Logout and login again
    cy.get('[data-testid="logout-button"]').click()
    cy.url().should('include', '/login')
    
    cy.get('[data-testid="email-input"]').type(testUser.email)
    cy.get('[data-testid="password-input"]').type(testUser.password)
    cy.get('[data-testid="login-button"]').click()
    cy.wait(2000)
    cy.url().should('not.include', '/login')
    cy.get('h2').should('contain', 'My Todos')

    // Step 7: Verify data persistence
    cy.contains('Buy groceries and snacks').should('be.visible')
    cy.contains('Read book').should('be.visible')
    cy.contains('Call dentist').should('not.exist')
    cy.contains('Buy groceries and snacks').closest('div.bg-white').should('have.class', 'opacity-75')
    cy.contains('Read book').closest('div.bg-white').should('not.have.class', 'opacity-75')
    cy.get('p').contains('1 of 2 completed').should('be.visible')

    // Step 8: Complete remaining todo and verify final state
    cy.contains('Read book').closest('div.bg-white').find('[data-testid="todo-checkbox"]').click()
    cy.wait(1000)
    cy.contains('Read book').closest('div.bg-white').should('have.class', 'opacity-75')
    cy.get('p').contains('2 of 2 completed').should('be.visible')

    // Step 9: Delete all todos and verify empty state
    cy.contains('Buy groceries and snacks').parent().parent().parent().find('[data-testid="delete-todo-button"]').click()
    cy.wait(1000)
    cy.contains('Read book').parent().parent().parent().find('[data-testid="delete-todo-button"]').click()
    cy.wait(2000)
    cy.contains('No todos yet. Create your first todo!').should('be.visible')
    cy.get('p').contains('completed').should('not.exist')
  })

  it('should handle error scenarios gracefully', () => {
    // Test invalid login
    cy.visit('/login')
    cy.get('[data-testid="email-input"]').type('nonexistent@example.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="login-button"]').click()
    cy.wait(2000)
    cy.get('.bg-red-50').should('be.visible')
    cy.get('.text-red-700').should('contain', 'Invalid credentials')

    // Test registration with existing email
    const timestamp = Date.now()
    const existingUser = {
      username: 'existinguser' + timestamp,
      email: 'existing' + timestamp + '@example.com',
      password: 'password123'
    }
    
    // First register a user
    cy.visit('/register')
    cy.get('input[name="username"]').type(existingUser.username)
    cy.get('input[name="email"]').type(existingUser.email)
    cy.get('input[name="password"]').type(existingUser.password)
    cy.get('input[name="confirmPassword"]').type(existingUser.password)
    cy.get('[data-testid="register-button"]').click()
    cy.wait(2000)
    cy.url().should('not.include', '/register')
    
    // Logout
    cy.get('[data-testid="logout-button"]').click()
    cy.url().should('include', '/login')
    
    // Try to register with the same email
    cy.visit('/register')
    cy.get('input[name="username"]').type('anotheruser')
    cy.get('input[name="email"]').type(existingUser.email)
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="confirmPassword"]').type('password123')
    cy.get('[data-testid="register-button"]').click()
    cy.wait(2000)
    cy.get('.bg-red-50').should('be.visible')
    cy.get('.text-red-700').should('contain', 'Username or email already exists')
  })

  it('should handle edge cases and boundary conditions', () => {
    const timestamp = Date.now()
    const testUser = {
      username: 'edgeuser' + timestamp,
      email: 'edge' + timestamp + '@example.com',
      password: 'password123'
    }

    // Register and login
    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('[data-testid="register-button"]').click()
    cy.wait(2000)
    cy.url().should('not.include', '/register')

    // Test creating todo with very long title
    const longTitle = 'A'.repeat(200)
    cy.get('[data-testid="todo-input"]').type(longTitle)
    cy.get('[data-testid="add-todo-button"]').click()
    cy.wait(1000)
    cy.contains(longTitle).should('be.visible')

    // Test creating todo with special characters
    const specialTitle = 'Todo with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
    cy.get('[data-testid="todo-input"]').type(specialTitle)
    cy.get('[data-testid="add-todo-button"]').click()
    cy.wait(1000)
    cy.contains(specialTitle).should('be.visible')

    // Test creating todo with empty title (should not work)
    cy.get('[data-testid="todo-input"]').clear()
    cy.get('[data-testid="add-todo-button"]').should('be.disabled')
    // The input doesn't have required attribute, the button is just disabled when empty
  })

  it('should maintain data integrity across sessions', () => {
    const timestamp = Date.now()
    const testUser = {
      username: 'integrityuser' + timestamp,
      email: 'integrity' + timestamp + '@example.com',
      password: 'password123'
    }

    // Register and login
    cy.visit('/register')
    cy.get('input[name="username"]').type(testUser.username)
    cy.get('input[name="email"]').type(testUser.email)
    cy.get('input[name="password"]').type(testUser.password)
    cy.get('input[name="confirmPassword"]').type(testUser.password)
    cy.get('[data-testid="register-button"]').click()
    cy.wait(2000)
    cy.url().should('not.include', '/register')

    // Create a todo
    cy.get('[data-testid="todo-input"]').type('Persistent Todo')
    cy.get('textarea[placeholder="Add description (optional)"]').type('This should persist')
    cy.get('[data-testid="add-todo-button"]').click()
    cy.wait(1000)
    cy.contains('Persistent Todo').should('be.visible')

    // Complete the todo
    cy.contains('Persistent Todo').parent().parent().parent().find('[data-testid="todo-checkbox"]').click()
    cy.wait(1000)
    cy.contains('Persistent Todo').parent().parent().parent().should('have.class', 'opacity-75')

    // Refresh the page
    cy.reload()
    cy.wait(2000)

    // Verify todo still exists and is completed
    cy.contains('Persistent Todo').should('be.visible')
    cy.contains('This should persist').should('be.visible')
    cy.contains('Persistent Todo').parent().parent().parent().should('have.class', 'opacity-75')
    cy.get('p').contains('1 of 1 completed').should('be.visible')

    // Logout and login again
    cy.get('[data-testid="logout-button"]').click()
    cy.url().should('include', '/login')
    
    cy.get('[data-testid="email-input"]').type(testUser.email)
    cy.get('[data-testid="password-input"]').type(testUser.password)
    cy.get('[data-testid="login-button"]').click()
    cy.wait(2000)
    cy.url().should('not.include', '/login')

    // Verify todo still exists and is completed
    cy.contains('Persistent Todo').should('be.visible')
    cy.contains('This should persist').should('be.visible')
    cy.contains('Persistent Todo').parent().parent().parent().should('have.class', 'opacity-75')
    cy.get('p').contains('1 of 1 completed').should('be.visible')
  })
}) 