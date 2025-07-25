describe('Todo Management Tests', () => {
  beforeEach(() => {
    // Register and login before each test
    cy.fixture('users').then((users) => {
      const timestamp = Date.now()
      const username = 'todouser' + timestamp
      const email = 'todo' + timestamp + '@example.com'
      
      // Store credentials for later use
      cy.wrap({ username, email, password: users.validUser.password }).as('userCredentials')
      
      // Register a new user
      cy.visit('/register')
      cy.get('input[name="username"]').type(username)
      cy.get('input[name="email"]').type(email)
      cy.get('input[name="password"]').type(users.validUser.password)
      cy.get('input[name="confirmPassword"]').type(users.validUser.password)
      cy.get('[data-testid="register-button"]').click()
      
      // Wait for registration to complete
      cy.wait(2000)
      cy.url().should('not.include', '/register')
      cy.get('h2').should('contain', 'My Todos')
    })
  })

  describe('Creating Todos', () => {
    it('should create a simple todo without description', () => {
      cy.fixture('todos').then((todos) => {
        cy.createTodo(todos.simpleTodo.title)
        
        // Assert todo was created
        cy.todoShouldExist(todos.simpleTodo.title)
        cy.get('p').contains('0 of 1 completed').should('be.visible')
      })
    })

    it('should create a todo with description', () => {
      cy.fixture('todos').then((todos) => {
        cy.createTodo(todos.sampleTodo.title, todos.sampleTodo.description)
        
        // Assert todo was created with description
        cy.todoShouldExist(todos.sampleTodo.title)
        cy.contains(todos.sampleTodo.description).should('be.visible')
      })
    })

    it('should create multiple todos', () => {
      cy.fixture('todos').then((todos) => {
        cy.createTodo('First Todo', 'First description')
        cy.createTodo('Second Todo', 'Second description')
        cy.createTodo('Third Todo', 'Third description')
        
        // Assert all todos were created
        cy.todoShouldExist('First Todo')
        cy.todoShouldExist('Second Todo')
        cy.todoShouldExist('Third Todo')
        cy.get('p').contains('0 of 3 completed').should('be.visible')
      })
    })

    it('should not create todo with empty title', () => {
      cy.get('[data-testid="todo-input"]').type('   ')
      cy.get('[data-testid="add-todo-button"]').should('be.disabled')
    })

    it('should handle long todo titles and descriptions', () => {
      cy.fixture('todos').then((todos) => {
        cy.createTodo(todos.longTodo.title, todos.longTodo.description)
        
        // Assert long todo was created
        cy.todoShouldExist(todos.longTodo.title)
        cy.contains(todos.longTodo.description).should('be.visible')
      })
    })

    it('should handle special characters in todo', () => {
      cy.fixture('todos').then((todos) => {
        cy.createTodo(todos.specialCharsTodo.title, todos.specialCharsTodo.description)
        
        // Assert special characters are handled properly
        cy.todoShouldExist(todos.specialCharsTodo.title)
        cy.contains(todos.specialCharsTodo.description).should('be.visible')
      })
    })

    it('should expand form when input is focused', () => {
      cy.get('[data-testid="todo-input"]').focus()
      cy.get('textarea[placeholder="Add description (optional)"]').should('be.visible')
    })
  })

  describe('Editing Todos', () => {
    beforeEach(() => {
      // Create a todo to edit
      cy.fixture('todos').then((todos) => {
        cy.createTodo(todos.editTodo.originalTitle, 'Original description')
      })
    })

    it('should edit todo title', () => {
      cy.fixture('todos').then((todos) => {
        cy.editTodo(todos.editTodo.originalTitle, todos.editTodo.newTitle)
        
        // Assert todo was updated
        cy.todoShouldExist(todos.editTodo.newTitle)
        cy.todoShouldNotExist(todos.editTodo.originalTitle)
      })
    })

    it('should edit todo description', () => {
      cy.fixture('todos').then((todos) => {
        cy.editTodo(todos.editTodo.originalTitle, todos.editTodo.originalTitle, todos.editTodo.newDescription)
        
        // Assert description was updated
        cy.contains(todos.editTodo.newDescription).should('be.visible')
      })
    })

    it('should edit both title and description', () => {
      cy.fixture('todos').then((todos) => {
        cy.editTodo(todos.editTodo.originalTitle, todos.editTodo.newTitle, todos.editTodo.newDescription)
        
        // Assert both were updated
        cy.todoShouldExist(todos.editTodo.newTitle)
        cy.contains(todos.editTodo.newDescription).should('be.visible')
      })
    })

    it('should clear description when editing', () => {
      cy.fixture('todos').then((todos) => {
        cy.editTodo(todos.editTodo.originalTitle, todos.editTodo.originalTitle, '')
        
        // Assert description was cleared
        cy.contains('Original description').should('not.exist')
      })
    })

    it('should not save empty title', () => {
      cy.fixture('todos').then((todos) => {
        cy.contains(todos.editTodo.originalTitle).parent().parent().find('[data-testid="edit-todo-button"]').click()
        cy.get('input[placeholder="Todo title"]').clear()
        cy.get('button').contains('Save').should('be.disabled')
      })
    })

    it('should cancel edit and restore original values', () => {
      cy.fixture('todos').then((todos) => {
        cy.contains(todos.editTodo.originalTitle).parent().parent().find('[data-testid="edit-todo-button"]').click()
        cy.get('input[placeholder="Todo title"]').clear().type('Temporary Title')
        cy.get('textarea[placeholder="Description (optional)"]').clear().type('Temporary description')
        cy.get('button').contains('Cancel').click()
        
        // Assert original values are restored
        cy.todoShouldExist(todos.editTodo.originalTitle)
        cy.contains('Original description').should('be.visible')
      })
    })
  })

  describe('Deleting Todos', () => {
    beforeEach(() => {
      // Create multiple todos to delete
      cy.createTodo('Todo to Delete', 'This will be deleted')
      cy.createTodo('Another Todo', 'This will stay')
      
      // Wait for todos to be created and verify they exist
      cy.wait(1000)
      cy.todoShouldExist('Todo to Delete')
      cy.todoShouldExist('Another Todo')
    })

    it('should delete a specific todo', () => {
      cy.deleteTodo('Todo to Delete')
      
      // Wait for deletion to complete
      cy.wait(1000)
      
      // Assert todo was deleted
      cy.todoShouldNotExist('Todo to Delete')
      cy.todoShouldExist('Another Todo')
    })

    it('should update completion counter after deletion', () => {
      // Complete one todo first
      cy.toggleTodo('Todo to Delete')
      cy.get('p').contains('1 of 2 completed').should('be.visible')
      
      // Delete the completed todo
      cy.deleteTodo('Todo to Delete')
      cy.get('p').contains('0 of 1 completed').should('be.visible')
    })

    it('should handle deletion of last todo', () => {
      // First verify the todos exist before deleting
      cy.todoShouldExist('Another Todo')
      cy.todoShouldExist('Todo to Delete')
      
      // Delete the todos
      cy.deleteTodo('Another Todo')
      cy.wait(1000)
      cy.deleteTodo('Todo to Delete')
      
      // Wait for deletion to complete and check for empty state
      cy.wait(3000)
      
      // Check if completion counter is gone (indicating no todos)
      cy.get('body').then(($body) => {
        if ($body.find('p').text().includes('completed')) {
          cy.log('Completion counter still exists, todos not deleted')
        } else {
          cy.log('Completion counter gone, todos deleted')
        }
      })
      
      // Assert empty state - try multiple approaches
      cy.get('body').then(($body) => {
        if ($body.find('p').text().includes('No todos yet')) {
          cy.log('Empty state message found')
          cy.contains('No todos yet. Create your first todo!').should('be.visible')
        } else {
          cy.log('Empty state message not found, checking for other indicators')
          // If the message isn't found, check if there are no todo items
          cy.get('[data-testid="todo-item"]').should('not.exist')
          cy.get('.todo-item').should('not.exist')
        }
      })
      
      cy.get('p').contains('completed').should('not.exist')
    })
  })

  describe('Todo Completion', () => {
    beforeEach(() => {
      // Create todos to test completion
      cy.createTodo('Incomplete Todo', 'This is incomplete')
      cy.createTodo('Complete Todo', 'This will be completed')
      
      // Wait for todos to be created and verify they exist
      cy.wait(1000)
      cy.todoShouldExist('Incomplete Todo')
      cy.todoShouldExist('Complete Todo')
    })

    it('should mark todo as complete', () => {
      cy.toggleTodo('Complete Todo')
      
      // Assert todo is completed
      cy.todoShouldBeCompleted('Complete Todo')
      cy.get('p').contains('1 of 2 completed').should('be.visible')
    })

    it('should mark todo as incomplete', () => {
      // First complete the todo
      cy.toggleTodo('Complete Todo')
      cy.todoShouldBeCompleted('Complete Todo')
      
      // Then uncomplete it
      cy.toggleTodo('Complete Todo')
      cy.todoShouldNotBeCompleted('Complete Todo')
      cy.get('p').contains('0 of 2 completed').should('be.visible')
    })

    it('should handle multiple completion toggles', () => {
      cy.toggleTodo('Complete Todo')
      cy.toggleTodo('Incomplete Todo')
      
      // Assert both are completed
      cy.todoShouldBeCompleted('Complete Todo')
      cy.todoShouldBeCompleted('Incomplete Todo')
      cy.get('p').contains('2 of 2 completed').should('be.visible')
    })

    it('should maintain completion status after edit', () => {
      // Complete a todo
      cy.toggleTodo('Complete Todo')
      cy.todoShouldBeCompleted('Complete Todo')
      
      // Edit the completed todo
      cy.editTodo('Complete Todo', 'Edited Complete Todo', 'New description')
      
      // Assert it's still completed
      cy.todoShouldBeCompleted('Edited Complete Todo')
    })
  })

  describe('Data Persistence', () => {
    it('should persist todos after page refresh', () => {
      cy.fixture('todos').then((todos) => {
        cy.createTodo(todos.sampleTodo.title, todos.sampleTodo.description)
        cy.toggleTodo(todos.sampleTodo.title)
        
        // Refresh the page
        cy.reload()
        
        // Assert todo still exists and is completed
        cy.todoShouldExist(todos.sampleTodo.title)
        cy.todoShouldBeCompleted(todos.sampleTodo.title)
        cy.get('p').contains('1 of 1 completed').should('be.visible')
      })
    })

    it('should persist todos after logout and login', () => {
      cy.fixture('todos').then((todos) => {
        // Get the stored credentials
        cy.get('@userCredentials').then((credentials) => {
          // Create a todo
          cy.createTodo(todos.sampleTodo.title, todos.sampleTodo.description)
          
          // Logout
          cy.get('[data-testid="logout-button"]').click()
          cy.url().should('include', '/login')
          
          // Login with the same credentials
          cy.get('[data-testid="email-input"]').type(credentials.email)
          cy.get('[data-testid="password-input"]').type(credentials.password)
          cy.get('[data-testid="login-button"]').click()
          
          // Wait for login to complete
          cy.wait(2000)
          cy.url().should('not.include', '/login')
          cy.get('h2').should('contain', 'My Todos')
          
          // Assert todo still exists
          cy.todoShouldExist(todos.sampleTodo.title)
        })
      })
    })
  })

  describe('UI/UX Elements', () => {
    it('should display empty state when no todos exist', () => {
      cy.contains('No todos yet. Create your first todo!').should('be.visible')
    })

    it('should show completion counter', () => {
      cy.createTodo('First Todo')
      cy.createTodo('Second Todo')
      cy.get('p').contains('0 of 2 completed').should('be.visible')
      
      cy.toggleTodo('First Todo')
      cy.get('p').contains('1 of 2 completed').should('be.visible')
    })

    it('should display todo timestamps', () => {
      cy.createTodo('Timestamp Test Todo')
      
      // Assert timestamp is displayed
      cy.contains('Created:').should('be.visible')
    })

    it('should show edit and delete buttons on hover', () => {
      cy.createTodo('Hover Test Todo')
      
      // Hover over the todo item
      cy.contains('Hover Test Todo').parent().parent().trigger('mouseover')
      
      // Assert buttons are visible
      cy.get('[data-testid="edit-todo-button"]').should('be.visible')
      cy.get('[data-testid="delete-todo-button"]').should('be.visible')
    })
  })
}) 