// Shared primitives for admin pages
import { useState } from 'react';

export const IC = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export function Badge({ label, color = '#6366f1' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>
        <IC d="M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z" size={15} />
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}
      />
    </div>
  );
}

export function Select({ value, onChange, options, style = {} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: '#cbd5e1', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', ...style }}>
      {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1e2433' }}>{o.label}</option>)}
    </select>
  );
}

export function ActionBtn({ onClick, color = '#6366f1', children, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${color}40`, background: hov ? `${color}20` : `${color}0a`, color, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {children}
    </button>
  );
}

export function DeleteBtn({ onClick, title = 'Delete' }) {
  return <ActionBtn onClick={onClick} color="#ef4444" title={title}>Delete</ActionBtn>;
}

export function Table({ columns, rows, loading, emptyMsg = 'No data found' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.05)', width: '70%', animation: 'pulse 1.5s ease infinite' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: '#475569', fontSize: 13 }}>{emptyMsg}</td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={row.id || i}
              style={{ transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1', verticalAlign: 'middle' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 0 4px' }}>
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page <= 1 ? '#334155' : '#94a3b8', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>
        ← Prev
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)}
          style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${p === page ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, background: p === page ? 'rgba(99,102,241,0.2)' : 'transparent', color: p === page ? '#a5b4fc' : '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 700 : 400 }}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: page >= pages ? '#334155' : '#94a3b8', cursor: page >= pages ? 'not-allowed' : 'pointer', fontSize: 12 }}>
        Next →
      </button>
    </div>
  );
}

export function PageHeader({ title, subtitle, count }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0, fontFamily: "'Syne',sans-serif" }}>{title}</h1>
        {count !== undefined && <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{count} total</span>}
      </div>
      {subtitle && <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

export function FilterBar({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}
