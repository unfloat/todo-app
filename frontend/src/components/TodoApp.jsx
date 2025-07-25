import { useState, useEffect } from 'react';
import axios from 'axios';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Configure axios with auth header
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  // Fetch todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/todos');
      setTodos(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new todo
  const addTodo = async (title, description) => {
    try {
      const response = await api.post('/todos', { title, description });
      setTodos([response.data, ...todos]);
    } catch (err) {
      setError('Failed to add todo');
      console.error('Error adding todo:', err);
    }
  };

  // Update todo
  const updateTodo = async (id, updates) => {
    try {
      const response = await api.put(`/todos/${id}`, updates);
      setTodos(todos.map(todo => todo.id === id ? response.data : todo));
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id) => {
    try {
      const response = await api.patch(`/todos/${id}/toggle`);
      setTodos(todos.map(todo => todo.id === id ? response.data : todo));
    } catch (err) {
      setError('Failed to toggle todo');
      console.error('Error toggling todo:', err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Todos</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <TodoForm onAddTodo={addTodo} />

        <div className="mt-6">
          {todos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No todos yet. Create your first todo!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                  onToggle={toggleTodo}
                />
              ))}
            </div>
          )}
        </div>

        {todos.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {todos.filter(todo => todo.completed).length} of {todos.length} completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp; 