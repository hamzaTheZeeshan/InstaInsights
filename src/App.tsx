import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SearchPage from './pages/SearchPage';
import CreatorsPage from './pages/CreatorsPage';
import SelectInboxPage from './pages/SelectInboxPage';
import FeedbackPage from './pages/FeedbackPage';
import OverallStatsPage from './pages/OverallStatsPage';

// Theme is handled by ThemeProvider in main.tsx — no useTheme needed here.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/select" element={<SelectInboxPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/creators" element={<CreatorsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/totalStats" element={<OverallStatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;