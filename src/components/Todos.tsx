import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Todo {
  id: string
  title: string
  is_completed: boolean
  created_at: string
}

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    setLoading(true)
    const { data } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
    setTodos(data ?? [])
    setLoading(false)
  }

  async function addTodo() {
    const title = input.trim()
    if (!title) return
    const { data } = await supabase
      .from('todos')
      .insert({ title })
      .select()
      .single()
    if (data) setTodos([data, ...todos])
    setInput('')
  }

  async function toggleTodo(todo: Todo) {
    const { data } = await supabase
      .from('todos')
      .update({ is_completed: !todo.is_completed })
      .eq('id', todo.id)
      .select()
      .single()
    if (data) setTodos(todos.map(t => (t.id === todo.id ? data : t)))
  }

  async function saveEdit(id: string) {
    const title = editText.trim()
    if (!title) return
    const { data } = await supabase
      .from('todos')
      .update({ title })
      .eq('id', id)
      .select()
      .single()
    if (data) setTodos(todos.map(t => (t.id === id ? data : t)))
    setEditId(null)
    setEditText('')
  }

  async function deleteTodo(id: string) {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="todos-container">
      <h1>Todos</h1>

      <div className="todos-input-row">
        <input
          className="todos-input"
          placeholder="Add a new todo..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
        />
        <button className="todos-btn add" onClick={addTodo}>Add</button>
      </div>

      {loading && <p className="todos-status">Loading...</p>}
      {!loading && todos.length === 0 && (
        <p className="todos-status">No todos yet. Add one above!</p>
      )}
      {!loading && todos.length > 0 && (
        <ul className="todos-list">
          {todos.map(todo => (
            <li key={todo.id} className={`todos-item ${todo.is_completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => toggleTodo(todo)}
              />
              {editId === todo.id ? (
                <>
                  <input
                    className="todos-input edit"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(todo.id)}
                    autoFocus
                  />
                  <button className="todos-btn save" onClick={() => saveEdit(todo.id)}>Save</button>
                  <button className="todos-btn cancel" onClick={() => setEditId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className="todos-title">{todo.title}</span>
                  <button className="todos-btn edit" onClick={() => { setEditId(todo.id); setEditText(todo.title) }}>Edit</button>
                  <button className="todos-btn delete" onClick={() => deleteTodo(todo.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

