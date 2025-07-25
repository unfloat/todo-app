import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import axios from 'axios'
import Login from '../Login'

// Mock axios
vi.mock('axios')

// Mock react-router-dom
const MockLogin = ({ onLogin }) => (
  <BrowserRouter>
    <Login onLogin={onLogin} />
  </BrowserRouter>
)

describe('Login Component', () => {
  const mockOnLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<MockLogin onLogin={mockOnLogin} />)
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-button')).toBeInTheDocument()
    expect(screen.getByText('create a new account')).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    render(<MockLogin onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('submits form with valid credentials', async () => {
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' }
      }
    }
    axios.post.mockResolvedValueOnce(mockResponse)
    
    render(<MockLogin onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('login-button')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        {
          email: 'test@example.com',
          password: 'password123'
        }
      )
      expect(mockOnLogin).toHaveBeenCalledWith(
        'mock-token',
        { id: 1, username: 'testuser', email: 'test@example.com' }
      )
    })
  })

  it('displays error message on login failure', async () => {
    const mockError = {
      response: {
        data: { error: 'Invalid credentials' }
      }
    }
    axios.post.mockRejectedValueOnce(mockError)
    
    render(<MockLogin onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('login-button')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    
    expect(mockOnLogin).not.toHaveBeenCalled()
  })

  it('displays generic error message when no specific error is provided', async () => {
    const mockError = {}
    axios.post.mockRejectedValueOnce(mockError)
    
    render(<MockLogin onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('login-button')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('An error occurred during login')).toBeInTheDocument()
    })
  })

  it('shows loading state during form submission', async () => {
    // Create a promise that we can control
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    axios.post.mockReturnValueOnce(promise)
    
    render(<MockLogin onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('login-button')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    // Check loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    // Resolve the promise
    resolvePromise({
      data: {
        token: 'mock-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' }
      }
    })
    
    await waitFor(() => {
      expect(screen.getByText('Sign in')).toBeInTheDocument()
    })
  })

  it('validates required fields', () => {
    render(<MockLogin onLogin={mockOnLogin} />)
    
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })
}) 