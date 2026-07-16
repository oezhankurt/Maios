import PublicHeader from './PublicHeader.jsx';
import Footer from './Footer.jsx';

export default function PublicLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
