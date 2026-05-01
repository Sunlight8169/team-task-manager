import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function CreateTask() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Medium',
    project_id: '',
    assigned_to: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all projects that the current user is part of
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get('/projects');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
  }, []);

  // Handle input and select changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission — create task API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await API.post('/create-task', {
        ...form,
        project_id: parseInt(form.project_id),
        assigned_to: parseInt(form.assigned_to),
      });
      setSuccess('Task created successfully!');
      // Redirect to tasks page after short delay
      setTimeout(() => navigate('/tasks'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/tasks')}>
            ← Back to Tasks
          </button>
          <h1 className="page-title">Create Task</h1>
          <p className="page-subtitle">Fill in the details below</p>
        </div>
      </div>

      {/* Task Form Card */}
      <div className="form-card">

        {/* Error and Success Messages */}
        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="create-form">

          {/* Task Title Input */}
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Design homepage"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Task Description Textarea */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="What needs to be done?"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          {/* Due Date and Priority — side by side */}
          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🔴 High</option>
              </select>
            </div>
          </div>

          {/* Project Selection Dropdown */}
          <div className="form-group">
            <label>Project</label>
            <select
              name="project_id"
              value={form.project_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Assign To — User ID input */}
          {/* User can find their ID on their Dashboard page */}
          <div className="form-group">
            <label>Assign To (User ID)</label>

            <input
              type="number"
              name="assigned_to"
              placeholder="e.g. 3"
              value={form.assigned_to}
              onChange={handleChange}
              required
            />
          </div>

          {/* Form Action Buttons */}
          <div className="form-submit-row">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate('/tasks')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}