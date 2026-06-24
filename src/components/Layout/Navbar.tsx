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
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <span className="text-white font-bold text-xl cursor-pointer" onClick={handleReset}>
        InstaInsights
      </span>
      <div className="flex gap-6">
        {links.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? 'text-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
      <button
        onClick={handleReset}
        className="text-sm text-gray-500 hover:text-red-400 transition-colors"
      >
        ← New Chat
      </button>
    </nav>
  );
}