import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ theme, setTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <nav className="dash-nav">
      <div className="dash-nav-brand" onClick={() => navigate('/dashboard')}
        style={{ cursor: 'pointer' }}>
        <span className="brand-dot" />
        TaskFlow
      </div>

      <div className="dash-nav-actions">
        <button
          className={`nav-text-btn ${isActive('/dashboard') ? 'nav-active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >Dashboard</button>

        <button
          className={`nav-text-btn ${isActive('/projects') ? 'nav-active' : ''}`}
          onClick={() => navigate('/projects')}
        >Projects</button>

        <button
          className={`nav-text-btn ${isActive('/tasks') ? 'nav-active' : ''}`}
          onClick={() => navigate('/tasks')}
        >Tasks</button>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}