import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const EMPTY_FORM = { title: "", description: "", status: "pending" };

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/tasks`);

      if (!response.ok) {
        throw new Error("Could not load tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setError("");
      const endpoint = isEditing ? `${API_BASE_URL}/tasks/${editingId}` : `${API_BASE_URL}/tasks`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? "update" : "create"} task`);
      }

      await fetchTasks();
      resetForm();
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setEditingId(task._id);
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((prev) => prev.filter((task) => task._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Task Management System</h1>
        <p className="subtitle">MERN stack assignment: create, update, and delete tasks.</p>

        <form className="task-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Task title"
            value={form.title}
            onChange={handleInputChange}
            required
          />

          <textarea
            name="description"
            placeholder="Task description"
            value={form.description}
            onChange={handleInputChange}
            rows={3}
          />

          <select name="status" value={form.status} onChange={handleInputChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <div className="form-actions">
            <button type="submit">{isEditing ? "Update Task" : "Create Task"}</button>
            {isEditing && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {error && <p className="error">{error}</p>}

        <h2>Your Tasks</h2>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet. Add your first task above.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id} className="task-item">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description || "No description provided."}</p>
                  <span className={`status status-${task.status}`}>{task.status}</span>
                </div>
                <div className="task-actions">
                  <button onClick={() => handleEdit(task)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(task._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
