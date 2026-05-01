import { useEffect, useState } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import API from '../api/axios';

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setShowModal(true);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await API.post('/create-project', { name: projectName });
      setProjectName('');
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="dash-loading">
          <div className="spinner" />
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📁</span>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project, i) => (
            <div
              className="project-card"
              key={project.id}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-card-top">
                <div className="project-avatar">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <span className="project-badge">Active</span>
              </div>
              <h3 className="project-name">{project.name}</h3>
              <p className="project-meta">Created by you</p>
              <div className="project-footer">
                <span className="project-link">View Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Project</h2>
            <p className="modal-subtitle">Give your project a name</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}