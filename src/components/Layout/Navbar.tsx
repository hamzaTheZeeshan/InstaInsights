import { useState } from 'react';
import './Navbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reset } = useChatContext();
  const [menuOpen, setMenuOpen] = useState(false);

const links = [
  { path: '/select', label: '← Conversations' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/search', label: 'Search' },
  { path: '/creators', label: 'About The Creators' },
];

  const handleReset = () => {
    reset();
    navigate('/');
    setMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand" onClick={handleReset}>
        InstaInsights
      </span>

      <button
        className={`navbar-toggle ${menuOpen ? 'navbar-toggle--open' : ''}`}
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span className="navbar-toggle-bar"></span>
        <span className="navbar-toggle-bar"></span>
        <span className="navbar-toggle-bar"></span>
      </button>

      <div className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
        {links.map(link => (
          <button
            key={link.path}
            onClick={() => handleNavigate(link.path)}
            className={
              location.pathname === link.path
                ? 'nav-link nav-link--active'
                : 'nav-link'
            }
          >
            {link.label}
          </button>
        ))}

        {/* Duplicated here so it appears inside the mobile dropdown too —
            hidden via CSS on mobile from its original spot below */}
        <button onClick={handleReset} className="navbar-reset navbar-reset--mobile">
          ← New Chat
        </button>
      </div>

      <button onClick={handleReset} className="navbar-reset navbar-reset--desktop">
        ← New Chat
      </button>
    </nav>
  );
}