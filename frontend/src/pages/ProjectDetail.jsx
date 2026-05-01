import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddMsg('');
    setAddError('');
    setAdding(true);
    try {
      const res = await API.post('/add-member-by-email', {
        project_id: parseInt(id),
        email: email,
      });
      setAddMsg(res.data.message);
      setEmail('');
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/projects')}>
            ← Back to Projects
          </button>
          <h1 className="page-title">Project Details</h1>
          <p className="page-subtitle">Project ID: {id}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/tasks')}>
          View Tasks
        </button>
      </div>

      {/* Add Member by Email */}
      <div className="detail-card">
        <h2 className="section-title">👥 Add Member</h2>
        <p className="page-subtitle" style={{ marginBottom: '20px' }}>
          Team member ka <strong>Email</strong> daalo
        </p>

        {addMsg   && <div className="auth-success" style={{marginBottom:'16px'}}>{addMsg}</div>}
        {addError && <div className="auth-error"   style={{marginBottom:'16px'}}>{addError}</div>}

        <form onSubmit={handleAddMember} className="inline-form">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Email</label>
            <input
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={adding}
            style={{ alignSelf: 'flex-end' }}
          >
            {adding ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="detail-card" style={{ marginTop: '20px' }}>
        <h2 className="section-title">⚡ Quick Actions</h2>
        <div className="action-grid" style={{ marginTop: '12px' }}>
          <button className="action-card" onClick={() => navigate('/create-task')}>
            <span className="action-icon">➕</span>
            <span>Create Task</span>
          </button>
          <button className="action-card" onClick={() => navigate('/tasks')}>
            <span className="action-icon">📝</span>
            <span>View All Tasks</span>
          </button>
          <button className="action-card" onClick={() => navigate('/dashboard')}>
            <span className="action-icon">📊</span>
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}