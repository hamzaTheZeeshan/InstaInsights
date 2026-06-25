import './Navbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reset } = useChatContext();

  const links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/search', label: 'Search' },
  ];

  const handleReset = () => {
    reset();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={handleReset}>
        InstaInsights
      </span>

      <div className="navbar-links">
        {links.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={
              location.pathname === link.path
                ? 'nav-link nav-link--active'
                : 'nav-link'
            }
          >
            {link.label}
          </button>
        ))}
      </div>

      <button onClick={handleReset} className="navbar-reset">
        ← New Chat
      </button>
    </nav>
  );
}