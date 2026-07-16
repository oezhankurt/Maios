import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';
import ToastContainer from './components/Toast/Toast.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
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
import GoogleAds from './pages/GoogleAds.jsx';
import BingAds from './pages/BingAds.jsx';
import Settings from './pages/Settings.jsx';
import LoginHistory from './pages/LoginHistory.jsx';
import FAQ from './pages/FAQ.jsx';
import Impressum from './pages/Impressum.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import Terms from './pages/Terms.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import TwoFactorSettings from './pages/TwoFactorSettings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EmailPreview from './pages/EmailPreview.jsx';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <ThemeToggle />
      <Routes>
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
      <Route path="/verify-email" element={<PublicLayout><VerifyEmail /></PublicLayout>} />
      <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
      <Route path="/impressum" element={<PublicLayout><Impressum /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />

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
        <Route path="/google-ads" element={<GoogleAds view="overview" />} />
        <Route path="/google-ads/campaigns" element={<GoogleAds view="campaigns" />} />
        <Route path="/google-ads/keywords" element={<GoogleAds view="keywords" />} />
        <Route path="/google-ads/budget" element={<GoogleAds view="budget" />} />
        <Route path="/bing-ads" element={<BingAds view="overview" />} />
        <Route path="/bing-ads/campaigns" element={<BingAds view="campaigns" />} />
        <Route path="/bing-ads/performance" element={<BingAds view="performance" />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audience" element={<Audience />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/2fa" element={<TwoFactorSettings />} />
        <Route path="/login-history" element={<LoginHistory />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/email-preview" element={<EmailPreview />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
