// app/todos/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('todoTable')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting list:', error.message);
    } else {
      setTodos(data);
    }
    setLoading(false);
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const { data, error } = await supabase
      .from('todoTable')
      .insert([{ title: newTitle.trim() }])
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error.message);
      return;
    }

    setTodos((prev) => [data, ...prev]);
    setNewTitle('');
  }

  async function toggleTodo(todo) {
    const { data, error } = await supabase
      .from('todoTable')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error.message);
      return;
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? data : t))
    );
  }

  async function deleteTodo(id) {
    const { error } = await supabase
      .from('todoTable')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error.message);
      return;
    }

    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      padding: '40px 20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: '40px 30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{
            fontSize: 36,
            margin: '0 0 10px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ✨ My to-do list
          </h1>
          <p style={{
            color: '#666',
            fontSize: 14,
            margin: 0,
            fontWeight: 500,
          }}>
            {totalCount > 0 ? `${completedCount} out of ${totalCount} completed` : 'Start adding tasks'}
          </p>
        </div>

        {totalCount > 0 && (
          <div style={{
            marginBottom: 25,
            height: 8,
            backgroundColor: '#e0e0e0',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        )}

        <form onSubmit={addTodo} style={{
          display: 'flex',
          gap: 12,
          marginBottom: 30,
          marginTop: 25,
        }}>
          <input
            type="text"
            placeholder="Write down a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{
              flex: 1,
              padding: '14px 18px',
              fontSize: 15,
              border: '2px solid #e0e0e0',
              borderRadius: 12,
              fontFamily: 'inherit',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button type="submit" style={{
            padding: '14px 28px',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
          >
            ➕ Add
          </button>
        </form>

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <div style={{
              fontSize: 32,
              marginBottom: 10,
            }}>⏳</div>
            <p style={{
              color: '#667eea',
              fontSize: 16,
              fontWeight: 600,
              margin: 0,
            }}>
              Loading tasks...
            </p>
          </div>
        )}

        {!loading && todos.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
          }}>
            <div style={{ fontSize: 60, marginBottom: 15 }}>🎉</div>
            <p style={{
              color: '#999',
              fontSize: 16,
              margin: 0,
              fontWeight: 500,
            }}>
              No tasks yet. Create one to get started!
            </p>
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {todos.map((todo, index) => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                padding: '18px 18px',
                backgroundColor: todo.completed ? '#f0f4ff' : '#fff',
                border: `2px solid ${todo.completed ? '#e0c3fc' : '#e8edf7'}`,
                borderRadius: 12,
                transition: 'all 0.3s ease',
                animation: `slideIn 0.3s ease ${index * 0.05}s backwards`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!todo.completed) {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!todo.completed) {
                  e.currentTarget.style.borderColor = '#e8edf7';
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div
                onClick={() => toggleTodo(todo)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: `2px solid ${todo.completed ? '#764ba2' : '#667eea'}`,
                  backgroundColor: todo.completed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: todo.completed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  flexShrink: 0,
                }}
              >
                {todo.completed && <span style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>✓</span>}
              </div>
              <span
                onClick={() => toggleTodo(todo)}
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: todo.completed ? '#999' : '#333',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: todo.completed ? 400 : 500,
                  transition: 'all 0.2s ease',
                }}
              >
                {todo.title}
              </span>
              <button onClick={() => deleteTodo(todo.id)} style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#ffe0e0',
                color: '#ff6b6b',
                cursor: 'pointer',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ff6b6b';
                e.target.style.color = 'white';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffe0e0';
                e.target.style.color = '#ff6b6b';
                e.target.style.transform = 'scale(1)';
              }}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
