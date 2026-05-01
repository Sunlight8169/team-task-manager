import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats and current user info together
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, userRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/me'),
        ]);
        setData(dashRes.data);
        setUser(userRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helper to get count by status from status_breakdown array
  const getStatusCount = (status) => {
    if (!data?.status_breakdown) return 0;
    const found = data.status_breakdown.find(s => s.status === status);
    return found ? found.count : 0;
  };

  return (
    <div className="dash-main">

      {/* Welcome Banner - shows user name, email and user ID */}
      {user && (
        <div className="welcome-banner">
          <div className="welcome-left">
            <div className="welcome-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="welcome-name">Welcome back, {user.name}! 👋</h2>
              <p className="welcome-email">{user.email}</p>
            </div>
          </div>
          <div className="user-id-badge">
            <span className="user-id-label">Your User ID</span>
            <span className="user-id-value">{user.id}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="dash-header">
        <h1 className="dash-title">Dashboard</h1>
        <p className="dash-subtitle">Here's your task overview</p>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="dash-loading">
          <div className="spinner" />
          <p>Loading your data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards - total, todo, in progress, done, overdue */}
          <div className="stats-grid">
            <div className="stat-card card-total">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <span className="stat-label">Total Tasks</span>
                <span className="stat-value">{data?.total_tasks ?? 0}</span>
              </div>
            </div>

            <div className="stat-card card-todo">
              <div className="stat-icon">🕐</div>
              <div className="stat-info">
                <span className="stat-label">To Do</span>
                <span className="stat-value">{getStatusCount('To Do')}</span>
              </div>
            </div>

            <div className="stat-card card-progress">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <span className="stat-label">In Progress</span>
                <span className="stat-value">{getStatusCount('In Progress')}</span>
              </div>
            </div>

            <div className="stat-card card-done">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-label">Done</span>
                <span className="stat-value">{getStatusCount('Done')}</span>
              </div>
            </div>

            <div className="stat-card card-overdue">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <span className="stat-label">Overdue</span>
                <span className="stat-value">{data?.overdue_tasks ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Task Progress Bars - visual breakdown by status */}
          <div className="status-section">
            <h2 className="section-title">Task Progress</h2>
            <div className="progress-bars">
              {[
                { label: 'To Do',       key: 'To Do',       color: '#6366f1' },
                { label: 'In Progress', key: 'In Progress', color: '#f59e0b' },
                { label: 'Done',        key: 'Done',        color: '#10b981' },
              ].map(({ label, key, color }) => {
                const count = getStatusCount(key);
                const total = data?.total_tasks || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div className="progress-row" key={key}>
                    <span className="progress-label">{label}</span>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="progress-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions - navigate to projects, tasks, create project */}
          <div className="quick-actions">
            <h2 className="section-title">Quick Actions</h2>
            <div className="action-grid">
              <button className="action-card" onClick={() => navigate('/projects')}>
                <span className="action-icon">📁</span>
                <span>My Projects</span>
              </button>
              <button className="action-card" onClick={() => navigate('/tasks')}>
                <span className="action-icon">📝</span>
                <span>My Tasks</span>
              </button>
              <button className="action-card" onClick={() => navigate('/projects?new=true')}>
                <span className="action-icon">➕</span>
                <span>New Project</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}