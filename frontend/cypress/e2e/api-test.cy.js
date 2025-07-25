describe('API Tests', () => {
  it('should register a new user via API', () => {
    const timestamp = Date.now()
    const userData = {
      username: 'apitestuser' + timestamp,
      email: 'apitest' + timestamp + '@example.com',
      password: 'password123'
    };
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/api/auth/register',
      body: userData,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
      expect(response.body.user.username).to.eq(userData.username);
      expect(response.body.user.email).to.eq(userData.email);
    });
  });

  it('should login with valid credentials via API', () => {
    const timestamp = Date.now()
    const userData = {
      username: 'loginapitestuser' + timestamp,
      email: 'loginapitest' + timestamp + '@example.com',
      password: 'password123'
    };
    
    // First register a user
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/api/auth/register',
      body: userData,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((registerResponse) => {
      expect(registerResponse.status).to.eq(201);
      
      // Then login with the same credentials
      const loginData = {
        email: userData.email,
        password: userData.password
      };
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/api/auth/login',
        body: loginData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200);
        expect(loginResponse.body).to.have.property('token');
        expect(loginResponse.body).to.have.property('user');
        expect(loginResponse.body.user.email).to.eq(loginData.email);
      });
    });
  });

  it('should fail login with invalid credentials via API', () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    };
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/api/auth/login',
      body: loginData,
      headers: {
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.eq('Invalid credentials');
    });
  });
}); 