// Shared primitives for admin pages — light theme
import { useEffect, useRef, useState } from 'react';

export const IC = ({ d, size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export function Badge({ label, color = '#1B3A6B' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: `${color}12`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
        <IC d="M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z" size={15} />
      </div>
      <input
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: '#f8fafc', border: `1px solid ${focused ? '#1B3A6B' : '#e2e8f0'}`, borderRadius: 10, color: '#1e293b', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', boxShadow: focused ? '0 0 0 3px rgba(27,58,107,0.08)' : 'none', transition: 'all 0.15s' }}
      />
    </div>
  );
}

export function Select({ value, onChange, options, style = {} }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '8px 36px 8px 12px',
          color: '#475569',
          fontSize: 13,
          lineHeight: 1.4,
          outline: 'none',
          fontFamily: "'DM Sans',sans-serif",
          cursor: 'pointer',
          boxSizing: 'border-box',
          minWidth: 140,
          textAlign: 'left',
          ...style,
        }}>
        {selected?.label || ''}
      </button>
      <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
        <IC d="M6 9l6 6 6-6" size={14} />
      </div>
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '100%',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
            padding: 6,
            zIndex: 40,
          }}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: active ? '#eff6ff' : 'transparent',
                  color: active ? '#1B3A6B' : '#475569',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  fontFamily: "'DM Sans',sans-serif",
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ActionBtn({ onClick, color = '#1B3A6B', children, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${color}35`, background: hov ? `${color}12` : `${color}07`, color, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {children}
    </button>
  );
}

export function DeleteBtn({ onClick, title = 'Delete' }) {
  return <ActionBtn onClick={onClick} color="#ef4444" title={title}>Delete</ActionBtn>;
}

export function Table({ columns, rows, loading, emptyMsg = 'No data found', density = 'comfortable' }) {
  const isCompact = density === 'compact';
  const headerPadding = isCompact ? '8px 14px' : '10px 14px';
  const rowPadding = isCompact ? '9px 14px' : '12px 14px';

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding: headerPadding,
                  textAlign: 'left',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                  width: col.width,
                  minWidth: col.minWidth,
                  ...col.headStyle,
                }}
              >
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
                  <td key={col.key} style={{ padding: rowPadding, borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ height: 13, borderRadius: 4, background: '#f1f5f9', width: '70%', animation: 'pulse 1.5s ease infinite' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>{emptyMsg}</td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={row.id || i}
              style={{ transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {columns.map(col => (
                <td
                  key={col.key}
                  style={{
                    padding: rowPadding,
                    borderBottom: '1px solid #f1f5f9',
                    color: '#334155',
                    verticalAlign: 'middle',
                    width: col.width,
                    minWidth: col.minWidth,
                    ...col.cellStyle,
                  }}
                >
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
        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: page <= 1 ? '#cbd5e1' : '#64748b', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500 }}>
        ← Prev
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)}
          style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${p === page ? '#1B3A6B' : '#e2e8f0'}`, background: p === page ? '#1B3A6B' : '#fff', color: p === page ? '#fff' : '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: p === page ? 700 : 400 }}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
        style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: page >= pages ? '#cbd5e1' : '#64748b', cursor: page >= pages ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500 }}>
        Next →
      </button>
    </div>
  );
}

export function PageHeader({ title, subtitle, count }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Syne',sans-serif" }}>{title}</h1>
        {count !== undefined && <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{count} total</span>}
      </div>
      {subtitle && <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', ...style }}>
      {children}
    </div>
  );
}

export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, maxWidth: 360, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <p style={{ fontSize: 14, color: '#334155', margin: '0 0 20px', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: message }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel}  style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 18px', color: '#334155', fontSize: 13, zIndex: 99, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#22c55e' }}>✓</span> {message}
    </div>
  );
}

export function ToggleSwitch({ checked, onChange, color = '#1B3A6B' }) {
  return (
    <div onClick={onChange} style={{ width: 36, height: 20, borderRadius: 10, background: checked ? color : '#e2e8f0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  );
}


export function FilterBar({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}
