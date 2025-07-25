describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })

  describe('Login Functionality', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('should display login form', () => {
      cy.get('h2').should('contain', 'Sign in to your account')
      cy.get('[data-testid="email-input"]').should('be.visible')
      cy.get('[data-testid="password-input"]').should('be.visible')
      cy.get('[data-testid="login-button"]').should('contain', 'Sign in')
    })

    it('should login with valid credentials', () => {
      cy.fixture('users').then((users) => {
        const timestamp = Date.now()
        const username = 'loginuser' + timestamp
        const email = 'login' + timestamp + '@example.com'
        
        // First register a user with unique data
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
        
        // Logout
        cy.get('[data-testid="logout-button"]').click()
        cy.url().should('include', '/login')
        
        // Then login with the same credentials
        cy.get('[data-testid="email-input"]').type(email)
        cy.get('[data-testid="password-input"]').type(users.validUser.password)
        cy.get('[data-testid="login-button"]').click()
        
        // Wait for login to complete
        cy.wait(2000)
        cy.url().should('not.include', '/login')
        cy.get('h2').should('contain', 'My Todos')
        cy.get('nav').should('contain', username)
      })
    })

    it('should show error with invalid credentials', () => {
      cy.fixture('users').then((users) => {
        cy.get('[data-testid="email-input"]').type(users.invalidUser.email)
        cy.get('[data-testid="password-input"]').type(users.invalidUser.password)
        cy.get('[data-testid="login-button"]').click()
        
        // Assert error message
        cy.get('.bg-red-50').should('be.visible')
        cy.get('.text-red-700').should('contain', 'Invalid credentials')
      })
    })

    it('should show error with empty fields', () => {
      // Try to submit with empty fields - browser validation should prevent submission
      cy.get('[data-testid="login-button"]').click()
      
      // The form should not submit due to required fields, so we should still be on the login page
      cy.url().should('include', '/login')
      cy.get('[data-testid="email-input"]').should('have.attr', 'required')
      cy.get('[data-testid="password-input"]').should('have.attr', 'required')
    })

    it('should show error with invalid email format', () => {
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()
      
      // Browser should show validation error for invalid email
      cy.get('[data-testid="email-input"]').should('have.attr', 'type', 'email')
    })

    it('should navigate to register page', () => {
      cy.get('a').contains('create a new account').click()
      cy.url().should('include', '/register')
    })
  })

  describe('Registration Functionality', () => {
    beforeEach(() => {
      cy.visit('/register')
    })

    it('should display registration form', () => {
      cy.get('h2').should('contain', 'Create your account')
      cy.get('input[name="username"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="confirmPassword"]').should('be.visible')
      cy.get('[data-testid="register-button"]').should('contain', 'Create account')
    })

    it('should register with valid credentials', () => {
      cy.fixture('users').then((users) => {
        const timestamp = Date.now()
        const username = 'newuser' + timestamp
        const email = 'new' + timestamp + '@example.com'
        
        cy.get('input[name="username"]').type(username)
        cy.get('input[name="email"]').type(email)
        cy.get('input[name="password"]').type(users.newUser.password)
        cy.get('input[name="confirmPassword"]').type(users.newUser.password)
        cy.get('[data-testid="register-button"]').click()
        
        // Wait for registration to complete
        cy.wait(2000)
        cy.url().should('not.include', '/register')
        cy.get('h2').should('contain', 'My Todos')
        cy.get('nav').should('contain', username)
      })
    })

    it('should show error with existing email', () => {
      cy.fixture('users').then((users) => {
        const timestamp = Date.now()
        const username = 'existinguser' + timestamp
        const email = 'existing' + timestamp + '@example.com'
        
        // First register a user
        cy.get('input[name="username"]').type(username)
        cy.get('input[name="email"]').type(email)
        cy.get('input[name="password"]').type(users.existingUser.password)
        cy.get('input[name="confirmPassword"]').type(users.existingUser.password)
        cy.get('[data-testid="register-button"]').click()
        
        // Wait for registration to complete
        cy.wait(2000)
        cy.url().should('not.include', '/register')
        
        // Logout
        cy.get('[data-testid="logout-button"]').click()
        cy.url().should('include', '/login')
        
        // Try to register with same email
        cy.visit('/register')
        cy.get('input[name="username"]').type('differentuser')
        cy.get('input[name="email"]').type(email)
        cy.get('input[name="password"]').type('password123')
        cy.get('input[name="confirmPassword"]').type('password123')
        cy.get('[data-testid="register-button"]').click()
        
        // Wait and check for error message
        cy.wait(2000)
        cy.get('.bg-red-50').should('be.visible')
        cy.get('.text-red-700').should('contain', 'Username or email already exists')
      })
    })

    it('should show error with mismatched passwords', () => {
      cy.get('input[name="username"]').type('testuser')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('input[name="confirmPassword"]').type('differentpassword')
      cy.get('[data-testid="register-button"]').click()
      
      // Assert error message
      cy.get('.bg-red-50').should('be.visible')
      cy.get('.text-red-700').should('contain', 'Passwords do not match')
    })

    it('should show error with short password', () => {
      cy.get('input[name="username"]').type('testuser')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('123')
      cy.get('input[name="confirmPassword"]').type('123')
      cy.get('[data-testid="register-button"]').click()
      
      // Assert error message
      cy.get('.bg-red-50').should('be.visible')
      cy.get('.text-red-700').should('contain', 'Password must be at least 6 characters long')
    })

    it('should show error with empty fields', () => {
      // Try to submit with empty fields - browser validation should prevent submission
      cy.get('[data-testid="register-button"]').click()
      
      // The form should not submit due to required fields, so we should still be on the register page
      cy.url().should('include', '/register')
      cy.get('input[name="username"]').should('have.attr', 'required')
      cy.get('input[name="email"]').should('have.attr', 'required')
      cy.get('input[name="password"]').should('have.attr', 'required')
      cy.get('input[name="confirmPassword"]').should('have.attr', 'required')
    })

    it('should navigate to login page', () => {
      cy.get('a').contains('sign in to your existing account').click()
      cy.url().should('include', '/login')
    })
  })

  describe('Logout Functionality', () => {
    it('should logout successfully', () => {
      cy.fixture('users').then((users) => {
        // Login first
        cy.visit('/login')
        cy.get('[data-testid="email-input"]').type(users.validUser.email)
        cy.get('[data-testid="password-input"]').type(users.validUser.password)
        cy.get('[data-testid="login-button"]').click()
        
        // Wait for login to complete
        cy.wait(2000)
        cy.url().should('not.include', '/login')
        cy.get('h2').should('contain', 'My Todos')
        
        // Then logout
        cy.get('[data-testid="logout-button"]').click()
        
        // Assert logout
        cy.url().should('include', '/login')
        cy.get('h2').should('contain', 'Sign in to your account')
      })
    })
  })

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without authentication', () => {
      cy.visit('/')
      cy.url().should('include', '/login')
    })

    it('should redirect to home when accessing login with authentication', () => {
      cy.fixture('users').then((users) => {
        // First login
        cy.visit('/login')
        cy.get('[data-testid="email-input"]').type(users.validUser.email)
        cy.get('[data-testid="password-input"]').type(users.validUser.password)
        cy.get('[data-testid="login-button"]').click()
        
        // Wait for login to complete
        cy.wait(2000)
        cy.url().should('not.include', '/login')
        
        // Try to access login page again
        cy.visit('/login')
        cy.url().should('not.include', '/login')
        cy.get('h2').should('contain', 'My Todos')
      })
    })

    it('should redirect to home when accessing register with authentication', () => {
      cy.fixture('users').then((users) => {
        // First login
        cy.visit('/login')
        cy.get('[data-testid="email-input"]').type(users.validUser.email)
        cy.get('[data-testid="password-input"]').type(users.validUser.password)
        cy.get('[data-testid="login-button"]').click()
        
        // Wait for login to complete
        cy.wait(2000)
        cy.url().should('not.include', '/login')
        
        // Try to access register page
        cy.visit('/register')
        cy.url().should('not.include', '/register')
        cy.get('h2').should('contain', 'My Todos')
      })
    })
  })
}) 