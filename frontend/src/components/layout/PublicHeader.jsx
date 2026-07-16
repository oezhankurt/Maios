import { Link, useNavigate } from 'react-router-dom';

export default function PublicHeader() {
  const navigate = useNavigate();

  return (
    <header style={{
      backgroundColor: '#0a0e27',
      borderBottom: '1px solid #1a2347',
      padding: '12px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#6366f1',
          }}
        >
          📊 Maios
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginLeft: 'auto',
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 14px',
              background: '#1a2347',
              border: '1px solid #2d3e5f',
              borderRadius: '6px',
              color: '#93c5fd',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#2d3e5f';
              e.target.style.borderColor = '#6366f1';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#1a2347';
              e.target.style.borderColor = '#2d3e5f';
            }}
          >
            ← Zurück
          </button>

          <Link
            to="/login"
            style={{
              padding: '8px 16px',
              background: '#6366f1',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              textDecoration: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#5558e3';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#6366f1';
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
