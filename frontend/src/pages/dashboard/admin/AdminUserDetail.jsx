import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '@/api';
import { avatarUrl } from '@/utils';

function StatCard({ label, value, color }) {
  return (
    <div style={{ padding: 18, borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 800, color, fontFamily: "'Syne',sans-serif" }}>{value}</div>
    </div>
  );
}

function InfoRow({ label, value, href }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16, padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 500, minWidth: 0 }}>
        {href && value ? (
          <a href={href} target="_blank" rel="noreferrer" style={{ color: '#1B3A6B', textDecoration: 'none' }}>
            {value}
          </a>
        ) : (
          value || '—'
        )}
      </div>
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.getUser(id)
      .then((res) => {
        setUser(res.data.user);
        setStats(res.data.stats);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Loading user details...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>User not found</div>
        <Link to="/admin/users" style={{ color: '#1B3A6B', textDecoration: 'none', fontWeight: 600 }}>
          Back to users
        </Link>
      </div>
    );
  }

  const isOrganizationOwner = user.Role?.name === 'organization';
  const organizationApproved = Boolean(user.Organization?.is_approved);
  const avatar = avatarUrl(user.avatar_url) || user.avatar_url;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ marginBottom: 22 }}>
        <Link to="/admin/users" style={{ color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          ← Back to users
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {avatar ? (
              <img src={avatar} alt={user.name || 'User avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 24, fontWeight: 800, color: '#475569' }}>{user.name?.[0]?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', fontFamily: "'Syne',sans-serif" }}>{user.name}</h1>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 10 }}>{user.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: '#eff6ff', color: '#1B3A6B', border: '1px solid #bfdbfe' }}>
                {user.Role?.name || 'Unknown role'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: user.is_active ? '#f0fdf4' : '#f8fafc', color: user.is_active ? '#15803d' : '#64748b', border: `1px solid ${user.is_active ? '#bbf7d0' : '#e2e8f0'}` }}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
              {isOrganizationOwner && (
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: organizationApproved ? '#f0fdfa' : '#fff7ed', color: organizationApproved ? '#0f766e' : '#d97706', border: `1px solid ${organizationApproved ? '#99f6e4' : '#fed7aa'}` }}>
                  {organizationApproved ? 'Organization approved' : 'Organization pending'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label="Opportunities Posted" value={stats?.opportunitiesPosted ?? 0} color="#F47B20" />
        <StatCard label="Universities Owned" value={stats?.universitiesOwned ?? 0} color="#15803d" />
        <StatCard label="Joined" value={new Date(user.createdAt).getFullYear()} color="#1B3A6B" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '8px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <InfoRow label="Provider" value={user.provider || 'local'} />
        <InfoRow label="Phone" value={user.contact_phone} />
        <InfoRow label="Website" value={user.website_url} href={user.website_url} />
        <InfoRow label="Bio" value={user.bio} />
        <InfoRow label="Joined On" value={new Date(user.createdAt).toLocaleString()} />
      </div>
    </div>
  );
}
