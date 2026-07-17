import { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from '../hooks/useToast';

export default function AdminDashboard() {
  const { success: showSuccess, error: showError } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard'); // dashboard, users, audit

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, auditRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users?limit=10'),
        api.get('/admin/audit-logs?limit=20'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
      setAuditLogs(auditRes.data.data.auditLogs);
      setLoading(false);
    } catch (err) {
      showError('Fehler beim Laden der Admin-Daten');
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/admin`);
      showSuccess('Admin-Status aktualisiert');
      await loadDashboardData();
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Fehler beim Aktualisieren');
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      showSuccess('Benutzerstatus aktualisiert');
      await loadDashboardData();
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Fehler beim Aktualisieren');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Wird geladen...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>👨‍💼 Admin-Dashboard</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className="btn"
          style={{ background: tab === 'dashboard' ? '#6366f1' : '#2d3e5f' }}
          onClick={() => setTab('dashboard')}
        >
          Übersicht
        </button>
        <button
          className="btn"
          style={{ background: tab === 'users' ? '#6366f1' : '#2d3e5f' }}
          onClick={() => setTab('users')}
        >
          Benutzer
        </button>
        <button
          className="btn"
          style={{ background: tab === 'audit' ? '#6366f1' : '#2d3e5f' }}
          onClick={() => setTab('audit')}
        >
          Audit-Logs
        </button>
      </div>

      {tab === 'dashboard' && stats && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>
                {stats.stats.totalUsers}
              </div>
              <div style={{ color: '#8b94a8', fontSize: '12px' }}>Benutzer gesamt</div>
            </div>
            <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                {stats.stats.activeUsers}
              </div>
              <div style={{ color: '#8b94a8', fontSize: '12px' }}>Aktive Benutzer</div>
            </div>
            <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                {stats.stats.inactiveUsers}
              </div>
              <div style={{ color: '#8b94a8', fontSize: '12px' }}>Inaktive Benutzer</div>
            </div>
            <div style={{ background: '#1a2347', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#06b6d4' }}>
                {stats.stats.totalProducts}
              </div>
              <div style={{ color: '#8b94a8', fontSize: '12px' }}>Produkte</div>
            </div>
          </div>

          <h3>Letzte Audit-Logs</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#1a2347',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <thead>
              <tr style={{ background: '#151c3a' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #2d3e5f' }}>
                  Aktion
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #2d3e5f' }}>
                  Benutzer
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #2d3e5f' }}>
                  Zeit
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentAuditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #2d3e5f' }}>{log.action}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #2d3e5f' }}>
                    {log.user?.email}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #2d3e5f', fontSize: '12px' }}>
                    {new Date(log.createdAt).toLocaleString('de-DE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'users' && (
        <>
          <h3>Benutzerverwaltung</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#1a2347',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <thead>
              <tr style={{ background: '#151c3a' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #2d3e5f' }}>
                  Email
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #2d3e5f' }}>
                  Benutzername
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #2d3e5f' }}>
                  Status
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #2d3e5f' }}>
                  Admin
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #2d3e5f' }}>
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #2d3e5f' }}>{user.email}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #2d3e5f' }}>{user.username}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #2d3e5f' }}>
                    <select
                      value={user.status}
                      onChange={(e) => updateUserStatus(user.id, e.target.value)}
                      style={{
                        background: '#0a0e27',
                        color: user.status === 'active' ? '#10b981' : '#f43f5e',
                        border: '1px solid #2d3e5f',
                        padding: '6px',
                        borderRadius: '4px',
                      }}
                    >
                      <option value="active">Aktiv</option>
                      <option value="inactive">Inaktiv</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #2d3e5f' }}>
                    <button
                      onClick={() => toggleAdminStatus(user.id)}
                      style={{
                        background: user.isAdmin ? '#10b981' : '#2d3e5f',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {user.isAdmin ? '✓ Admin' : 'Benutzer'}
                    </button>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #2d3e5f' }}>
                    {user.emailVerified ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'audit' && (
        <>
          <h3>Audit-Logs</h3>
          <div style={{ maxHeight: '600px', overflow: 'auto' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: '#1a2347',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  borderLeft: '4px solid #6366f1',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#93c5fd' }}>{log.action}</strong>
                  <small style={{ color: '#8b94a8' }}>
                    {new Date(log.createdAt).toLocaleString('de-DE')}
                  </small>
                </div>
                <small style={{ color: '#8b94a8' }}>
                  Benutzer: {log.user?.email} • IP: {log.ipAddress} • Status: {log.status}
                </small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
