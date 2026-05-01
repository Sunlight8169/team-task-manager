import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ForgotPassword from './pages/ForgotPassword';



function App() {
  const { token } = useAuth();
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const ProtectedLayout = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return (
      <>
        <Navbar theme={theme} setTheme={setTheme} />
        {children}
      </>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"
          element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup"
          element={!token ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        <Route path="/dashboard" element={
          <ProtectedLayout><Dashboard /></ProtectedLayout>
        } />
        <Route path="/projects" element={
          <ProtectedLayout><Projects /></ProtectedLayout>
        } />
        <Route path="/projects/:id" element={
          <ProtectedLayout><ProjectDetail /></ProtectedLayout>
        } />
        <Route path="/tasks" element={
          <ProtectedLayout><Tasks /></ProtectedLayout>
        } />
        <Route path="/create-task" element={
          <ProtectedLayout><CreateTask /></ProtectedLayout>
        } />
        <Route path="/forgot-password"
            element={!token ? <ForgotPassword /> : <Navigate to="/dashboard" />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;