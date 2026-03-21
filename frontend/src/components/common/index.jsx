// ── Button ─────────────────────────────────────────────────────────────────────
export const Button = ({
  children, onClick, variant = 'primary', size = 'md',
  className = '', disabled = false, type = 'button', loading = false,
}) => {
  const v = {
    primary:   'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent',
    secondary: 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10',
    danger:    'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/20',
    ghost:     'bg-transparent hover:bg-white/5 text-slate-400 border-transparent',
    outline:   'bg-transparent hover:bg-white/5 text-indigo-400 border-indigo-500/50',
  };
  const s = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center gap-2 font-medium rounded-lg border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${v[variant]} ${s[size]} ${className}`}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

// ── Input ──────────────────────────────────────────────────────────────────────
export const Input = ({
  label, value, onChange, type = 'text', placeholder = '',
  required = false, className = '', error = '', name = '',
}) => (
  <div className={className}>
    {label && (
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <input
      name={name} type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className={`input-base ${error ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' : ''}`}
    />
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

// ── Textarea ───────────────────────────────────────────────────────────────────
export const Textarea = ({ label, value, onChange, placeholder = '', rows = 4, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
    <textarea value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      className="input-base resize-none" />
  </div>
);

// ── Select ─────────────────────────────────────────────────────────────────────
export const Select = ({ label, value, onChange, options, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="input-base bg-[#1e2433]">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ── Card ───────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick}
    className={`bg-white/[0.03] border border-white/[0.07] rounded-xl ${onClick ? 'cursor-pointer hover:bg-white/[0.05] transition-all' : ''} ${className}`}>
    {children}
  </div>
);

// ── Badge ──────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = 'blue' }) => {
  const c = {
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    gray:   'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${c[color] || c.blue}`}>
      {children}
    </span>
  );
};

// ── Spinner ────────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <svg className={`animate-spin text-blue-600 ${s[size]}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  );
};

// ── Empty state ────────────────────────────────────────────────────────────────
export const Empty = ({ title = 'Nothing here yet', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mb-4">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-.92 9 9 0 006-2.1 1 1 0 011.34 0 9 9 0 006 2.1A1 1 0 0120 6z" />
      </svg>
    </div>
    <p className="text-slate-300 font-medium mb-1">{title}</p>
    {description && <p className="text-sm text-slate-500 mb-4">{description}</p>}
    {action}
  </div>
);

// ── Pagination ─────────────────────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onNext, onPrev, onPage }) => {
  if (totalPages <= 1) return null;

  const safePage = Math.max(1, Math.min(page || 1, totalPages));
  const windowSize = 7;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, safePage - half);
  let end = Math.min(totalPages, start + windowSize - 1);

  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={onPrev} disabled={safePage === 1}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-all shadow-sm">
        <ChevronLeft size={15} />
        <span>Prev</span>
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPage?.(1)}
            className="w-9 h-9 rounded-lg text-sm font-medium transition-all border shadow-sm bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} onClick={() => onPage?.(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all border shadow-sm ${
            p === safePage
              ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
          }`}>
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <button
            onClick={() => onPage?.(totalPages)}
            className="w-9 h-9 rounded-lg text-sm font-medium transition-all border shadow-sm bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          >
            {totalPages}
          </button>
        </>
      )}

      <button onClick={onNext} disabled={safePage === totalPages}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition-all shadow-sm">
        <span>Next</span>
        <ChevronRight size={15} />
      </button>
    </div>
  );
};
import { ChevronLeft, ChevronRight } from 'lucide-react';
