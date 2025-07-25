describe('Debug Authentication', () => {
  it('should debug login process', () => {
    cy.visit('/login')
    
    // Fill in login form
    cy.get('input[name="email"]').type('apitest@example.com')
    cy.get('input[name="password"]').type('password123')
    
    // Submit form
    cy.get('button[type="submit"]').click()
    
    // Wait and check what happens
    cy.wait(3000)
    
    // Check current URL
    cy.url().then((url) => {
      cy.log('Current URL:', url)
    })
    
    // Check for error messages
    cy.get('body').then(($body) => {
      if ($body.find('.bg-red-50').length > 0) {
        cy.get('.bg-red-50').then(($error) => {
          cy.log('Error found:', $error.text())
        })
      } else {
        cy.log('No error found')
      }
    })
    
    // Check if we're on the home page
    cy.get('body').then(($body) => {
      if ($body.find('h2').length > 0) {
        cy.get('h2').then(($h2) => {
          cy.log('H2 text:', $h2.text())
        })
      } else {
        cy.log('No H2 found')
      }
    })
  })
  
  it('should debug registration process', () => {
    cy.visit('/register')
    
    // Fill in registration form
    cy.get('input[name="username"]').type('debuguser')
    cy.get('input[name="email"]').type('debug@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="confirmPassword"]').type('password123')
    
    // Submit form
    cy.get('button[type="submit"]').click()
    
    // Wait and check what happens
    cy.wait(3000)
    
    // Check current URL
    cy.url().then((url) => {
      cy.log('Current URL:', url)
    })
    
    // Check for error messages
    cy.get('body').then(($body) => {
      if ($body.find('.bg-red-50').length > 0) {
        cy.get('.bg-red-50').then(($error) => {
          cy.log('Error found:', $error.text())
        })
      } else {
        cy.log('No error found')
      }
    })
    
    // Check if we're on the home page
    cy.get('body').then(($body) => {
      if ($body.find('h2').length > 0) {
        cy.get('h2').then(($h2) => {
          cy.log('H2 text:', $h2.text())
        })
      } else {
        cy.log('No H2 found')
      }
    })
  })
}) 