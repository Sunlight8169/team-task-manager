import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      await API.put(`/update-task/${taskId}`, { status: newStatus });
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':   return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low':    return 'badge-low';
      default:       return 'badge-low';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'To Do':       return 'status-todo';
      case 'In Progress': return 'status-progress';
      case 'Done':        return 'status-done';
      default:            return 'status-todo';
    }
  };

  const isOverdue = (due_date, status) => {
    if (status === 'Done') return false;
    return new Date(due_date) < new Date();
  };

  return (
    <div className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/create-task')}>
          + Create Task
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="dash-loading">
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>No tasks yet</h3>
          <p>Create your first task to get started</p>
          <button className="btn-primary" onClick={() => navigate('/create-task')}>
            + Create Task
          </button>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task, i) => (
            <div
              className={`task-card ${isOverdue(task.due_date, task.status) ? 'task-overdue' : ''}`}
              key={task.id}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Left Section */}
              <div className="task-left">
                <div className="task-title-row">
                  <h3 className="task-title">{task.title}</h3>
                  {isOverdue(task.due_date, task.status) && (
                    <span className="overdue-tag">🔥 Overdue</span>
                  )}
                </div>
                <p className="task-desc">{task.description}</p>
                <div className="task-meta-row">
                  <span className={`priority-badge ${getPriorityStyle(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="task-due">
                    📅 {new Date(task.due_date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Right Section — Status Dropdown */}
              <div className="task-right">
                <span className={`status-chip ${getStatusStyle(task.status)}`}>
                  {task.status}
                </span>
                <select
                  className="status-select"
                  value={task.status}
                  disabled={updating === task.id}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}