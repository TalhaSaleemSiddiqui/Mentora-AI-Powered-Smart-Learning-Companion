import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import "./App.css";
import { AppProvider } from './context/AppContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import TopicsPage from './pages/TopicsPage';
import GamesPage from './pages/GamesPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ParentDashboard from './pages/ParentDashboard';
import WelcomePage from './pages/WelcomePage';
import LevelSelectPage from './pages/LevelSelectPage';
import LessonChatPage from './pages/LessonChatPage';

// --- NEW PAGES ADDED HERE ---
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/Resetpassword';

function LessonChatRoute() {
  const { topicSlug, levelId } = useParams();
  const [subtractionModulePoints, setSubtractionModulePoints] = useState(0);

  useEffect(() => {
    if (topicSlug !== 'subtraction') {
      setSubtractionModulePoints(0);
      try {
        sessionStorage.removeItem('mentora_subtraction_module_points');
      } catch { /* ignore */ }
    }
  }, [topicSlug]);

  const incrementSubtractionScore = useCallback(() => {
    setSubtractionModulePoints((prev) => {
      const next = prev + 3;
      try {
        sessionStorage.setItem('mentora_subtraction_module_points', String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    if (topicSlug === 'subtraction') {
      try {
        const stored = parseInt(sessionStorage.getItem('mentora_subtraction_module_points') || '0', 10);
        if (!Number.isNaN(stored) && stored > 0) {
          setSubtractionModulePoints((prev) => Math.max(prev, stored));
        }
      } catch { /* ignore */ }
    }
  }, [topicSlug, levelId]);

  return (
    <LessonChatPage
      key={`${topicSlug}-${levelId}`}
      subtractionModulePoints={topicSlug === 'subtraction' ? subtractionModulePoints : 0}
      onSubtractionCorrect={topicSlug === 'subtraction' ? incrementSubtractionScore : undefined}
    />
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Auth routes (no sidebar) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            
            {/* --- NEW ROUTES ADDED HERE --- */}
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          
          {/* App routes (has sidebar) */}
          <Route element={<DashboardLayout />}>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/" element={<TopicsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/extra" element={<HomePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/topics/:topicSlug/levels" element={<LevelSelectPage />} />
            <Route path="/topics/:topicSlug/lesson/:levelId" element={<LessonChatRoute />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}