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
      console.error('Error obteniendo todos:', error.message);
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
      console.error('Error creando todo:', error.message);
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
      console.error('Error actualizando todo:', error.message);
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
      console.error('Error eliminando todo:', error.message);
      return;
    }

    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>To-Do List con Supabase</h1>

      <form onSubmit={addTodo} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ padding: 8, width: '70%' }}
        />
        <button type="submit" style={{ padding: 8, marginLeft: 8 }}>
          Agregar
        </button>
      </form>

      {loading && <p>Cargando...</p>}

      {!loading && todos.length === 0 && <p>No hay tareas aún.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              padding: 8,
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
          >
            <span
              onClick={() => toggleTodo(todo)}
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
