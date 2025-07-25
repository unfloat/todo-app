import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TodoForm from '../TodoForm'

describe('TodoForm Component', () => {
  const mockOnAddTodo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders todo form correctly', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    expect(screen.getByTestId('todo-input')).toBeInTheDocument()
    expect(screen.getByTestId('add-todo-button')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument()
  })

  it('handles input changes', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    fireEvent.change(input, { target: { value: 'New todo item' } })
    
    expect(input.value).toBe('New todo item')
  })

  it('expands form when input is focused', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    fireEvent.focus(input)
    
    expect(screen.getByPlaceholderText('Add description (optional)')).toBeInTheDocument()
  })

  it('submits form with title only', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    const submitButton = screen.getByTestId('add-todo-button')
    
    fireEvent.change(input, { target: { value: 'New todo' } })
    fireEvent.click(submitButton)
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('New todo', '')
  })

  it('submits form with title and description', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    const submitButton = screen.getByTestId('add-todo-button')
    
    // Focus input to expand form
    fireEvent.focus(input)
    
    const descriptionInput = screen.getByPlaceholderText('Add description (optional)')
    
    fireEvent.change(input, { target: { value: 'New todo' } })
    fireEvent.change(descriptionInput, { target: { value: 'Todo description' } })
    fireEvent.click(submitButton)
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('New todo', 'Todo description')
  })

  it('clears form after submission', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    const submitButton = screen.getByTestId('add-todo-button')
    
    fireEvent.change(input, { target: { value: 'New todo' } })
    fireEvent.click(submitButton)
    
    expect(input.value).toBe('')
  })

  it('collapses form after submission', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    const submitButton = screen.getByTestId('add-todo-button')
    
    // Focus input to expand form
    fireEvent.focus(input)
    expect(screen.getByPlaceholderText('Add description (optional)')).toBeInTheDocument()
    
    fireEvent.change(input, { target: { value: 'New todo' } })
    fireEvent.click(submitButton)
    
    // Form should be collapsed
    expect(screen.queryByPlaceholderText('Add description (optional)')).not.toBeInTheDocument()
  })

  it('does not submit empty title', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    const submitButton = screen.getByTestId('add-todo-button')
    
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.click(submitButton)
    
    expect(mockOnAddTodo).not.toHaveBeenCalled()
  })

  it('does not submit when title is empty', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const submitButton = screen.getByTestId('add-todo-button')
    
    expect(submitButton).toBeDisabled()
  })

  it('enables button when title is entered', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    const submitButton = screen.getByTestId('add-todo-button')
    
    fireEvent.change(input, { target: { value: 'New todo' } })
    
    expect(submitButton).not.toBeDisabled()
  })

  it('trims whitespace from title', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    const submitButton = screen.getByTestId('add-todo-button')
    
    fireEvent.change(input, { target: { value: '  New todo  ' } })
    fireEvent.click(submitButton)
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('New todo', '')
  })

  it('trims whitespace from description', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)
    
    const input = screen.getByTestId('todo-input')
    const submitButton = screen.getByTestId('add-todo-button')
    
    // Focus input to expand form
    fireEvent.focus(input)
    
    const descriptionInput = screen.getByPlaceholderText('Add description (optional)')
    
    fireEvent.change(input, { target: { value: 'New todo' } })
    fireEvent.change(descriptionInput, { target: { value: '  Description  ' } })
    fireEvent.click(submitButton)
    
    expect(mockOnAddTodo).toHaveBeenCalledWith('New todo', 'Description')
  })
}) 