import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TodoItem from '../TodoItem'

describe('TodoItem Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  }

  const mockOnUpdate = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders todo item correctly', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByTestId('todo-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('edit-todo-button')).toBeInTheDocument()
    expect(screen.getByTestId('delete-todo-button')).toBeInTheDocument()
  })

  it('renders todo without description', () => {
    const todoWithoutDescription = { ...mockTodo, description: null }
    
    render(
      <TodoItem
        todo={todoWithoutDescription}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
  })

  it('displays completion status correctly', () => {
    const completedTodo = { ...mockTodo, completed: true }
    
    render(
      <TodoItem
        todo={completedTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    const todoContainer = screen.getByText('Test Todo').closest('div.bg-white')
    expect(todoContainer).toHaveClass('opacity-75')
    expect(screen.getByText('Test Todo')).toHaveClass('line-through')
  })

  it('calls onToggle when checkbox is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    const checkbox = screen.getByTestId('todo-checkbox')
    fireEvent.click(checkbox)
    
    expect(mockOnToggle).toHaveBeenCalledWith(1)
  })

  it('enters edit mode when edit button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    const editButton = screen.getByTestId('edit-todo-button')
    fireEvent.click(editButton)
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('saves changes when save button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    const editButton = screen.getByTestId('edit-todo-button')
    fireEvent.click(editButton)
    
    const titleInput = screen.getByDisplayValue('Test Todo')
    const descriptionInput = screen.getByDisplayValue('Test Description')
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(titleInput, { target: { value: 'Updated Todo' } })
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } })
    fireEvent.click(saveButton)
    
    expect(mockOnUpdate).toHaveBeenCalledWith(1, {
      title: 'Updated Todo',
      description: 'Updated Description',
      completed: false
    })
  })

  it('cancels edit when cancel button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    const editButton = screen.getByTestId('edit-todo-button')
    fireEvent.click(editButton)
    
    const titleInput = screen.getByDisplayValue('Test Todo')
    const cancelButton = screen.getByText('Cancel')
    
    fireEvent.change(titleInput, { target: { value: 'Modified Todo' } })
    fireEvent.click(cancelButton)
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('does not save empty title', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    const editButton = screen.getByTestId('edit-todo-button')
    fireEvent.click(editButton)
    
    const titleInput = screen.getByDisplayValue('Test Todo')
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(titleInput, { target: { value: '   ' } })
    
    expect(saveButton).toBeDisabled()
  })

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    const deleteButton = screen.getByTestId('delete-todo-button')
    fireEvent.click(deleteButton)
    
    expect(mockOnDelete).toHaveBeenCalledWith(1)
  })

  it('formats dates correctly', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    expect(screen.getByText(/Created:/)).toBeInTheDocument()
  })

  it('shows updated date when different from created date', () => {
    const updatedTodo = {
      ...mockTodo,
      updated_at: '2024-01-02T10:00:00Z'
    }
    
    render(
      <TodoItem
        todo={updatedTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    expect(screen.getByText(/Updated:/)).toBeInTheDocument()
  })

  it('maintains completion status during edit', () => {
    const completedTodo = { ...mockTodo, completed: true }
    
    render(
      <TodoItem
        todo={completedTodo}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )
    
    const editButton = screen.getByTestId('edit-todo-button')
    fireEvent.click(editButton)
    
    const titleInput = screen.getByDisplayValue('Test Todo')
    const saveButton = screen.getByText('Save')
    
    fireEvent.change(titleInput, { target: { value: 'Updated Todo' } })
    fireEvent.click(saveButton)
    
    expect(mockOnUpdate).toHaveBeenCalledWith(1, {
      title: 'Updated Todo',
      description: 'Test Description',
      completed: true
    })
  })
}) 