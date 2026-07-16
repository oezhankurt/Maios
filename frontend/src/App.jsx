import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Keywords from './pages/Keywords.jsx';
import PPC from './pages/PPC.jsx';
import Listings from './pages/Listings.jsx';
import Channels from './pages/Channels.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/keywords" element={<Keywords view="master" />} />
        <Route path="/keywords/rankings" element={<Keywords view="rankings" />} />
        <Route path="/ppc" element={<PPC view="overview" />} />
        <Route path="/ppc/campaigns" element={<PPC view="campaigns" />} />
        <Route path="/ppc/portfolios" element={<PPC view="portfolios" />} />
        <Route path="/ppc/automation" element={<PPC view="automation" />} />
        <Route path="/listings" element={<Listings view="products" />} />
        <Route path="/listings/score" element={<Listings view="score" />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
