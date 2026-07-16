import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductResearch from './pages/ProductResearch.jsx';
import Keywords from './pages/Keywords.jsx';
import Cerebro from './pages/Cerebro.jsx';
import PPC from './pages/PPC.jsx';
import Listings from './pages/Listings.jsx';
import ListingBuilder from './pages/ListingBuilder.jsx';
import ListingAnalyzer from './pages/ListingAnalyzer.jsx';
import IndexChecker from './pages/IndexChecker.jsx';
import Scribbles from './pages/Scribbles.jsx';
import Channels from './pages/Channels.jsx';
import Analytics from './pages/Analytics.jsx';
import Audience from './pages/Audience.jsx';
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
        <Route path="/research" element={<ProductResearch view="products" />} />
        <Route path="/research/keywords" element={<ProductResearch view="keywords" />} />
        <Route path="/research/competitors" element={<ProductResearch view="competitors" />} />
        <Route path="/research/niche" element={<ProductResearch view="niche" />} />
        <Route path="/research/targeting" element={<ProductResearch view="targeting" />} />
        <Route path="/research/analytics" element={<ProductResearch view="analytics" />} />
        <Route path="/keywords" element={<Keywords view="master" />} />
        <Route path="/keywords/cerebro" element={<Cerebro />} />
        <Route path="/keywords/rankings" element={<Keywords view="rankings" />} />
        <Route path="/ppc" element={<PPC view="overview" />} />
        <Route path="/ppc/campaigns" element={<PPC view="campaigns" />} />
        <Route path="/ppc/portfolios" element={<PPC view="portfolios" />} />
        <Route path="/ppc/automation" element={<PPC view="automation" />} />
        <Route path="/listings" element={<Listings view="products" />} />
        <Route path="/listings/score" element={<Listings view="score" />} />
        <Route path="/listings/builder" element={<ListingBuilder />} />
        <Route path="/listings/analyzer" element={<ListingAnalyzer />} />
        <Route path="/listings/index" element={<IndexChecker />} />
        <Route path="/listings/scribbles" element={<Scribbles />} />
        <Route path="/channels" element={<Channels view="overview" />} />
        <Route path="/channels/marketplaces" element={<Channels view="marketplaces" />} />
        <Route path="/channels/search" element={<Channels view="search" />} />
        <Route path="/channels/ads" element={<Channels view="ads" />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audience" element={<Audience />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
