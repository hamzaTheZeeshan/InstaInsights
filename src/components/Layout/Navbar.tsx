import { useState } from 'react';
import './Navbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContext';
import { useThemeContext } from '../../hooks/ThemeContext';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeContext();
  const { reset, zipFile, selectedInbox, setSelectedInbox } = useChatContext();

  const links = selectedInbox
    ? [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/analytics', label: 'Analytics' },
        { path: '/search', label: 'Search' },
        { path: '/creators', label: 'About The Creators' },
        { path: '/feedback', label: 'Feedback' },
      ]
    : [
        { path: '/dashboard', label: 'Total Stats' },
        { path: '/select', label: 'Select a Conversation' },
        { path: '/creators', label: 'About The Creators' },
        { path: '/feedback', label: 'Feedback' },
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

  const handleBackToConversations = () => {
    setSelectedInbox(null);
    navigate('/select');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <span
        className="navbar-brand"
        onClick={handleReset}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleReset()}
        aria-label="InstaInsights — go to home"
      >
        InstaInsights
      </span>

      <div className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
        {selectedInbox && (
          <button
            type="button"
            onClick={handleBackToConversations}
            className={location.pathname === '/select' ? 'nav-link nav-link--active' : 'nav-link'}
          >
            Select a Conversations
          </button>
        )}
        {links.map(link => (
          <button
            type="button"
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
        <button type="button" onClick={handleReset} className="navbar-reset navbar-reset--mobile">
          ← New Chat
        </button>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          onClick={toggleTheme}
          className="navbar-theme-toggle"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <button type="button" onClick={handleReset} className="navbar-reset navbar-reset--desktop">
          ← New Chat
        </button>

        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? 'navbar-toggle--open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
        </button>
      </div>
    </nav>
  );
}