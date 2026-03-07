// ── Format currency ───────────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

// ── Format date ───────────────────────────────────────────────────────────────
export const formatDate = (date, opts = {}) =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', ...opts }).format(new Date(date));

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
};

// ── Cloudinary URL builder ─────────────────────────────────────────────────────
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const cloudinaryUrl = (publicId, transforms = '') => {
  if (!publicId) return null;
  // If already a full URL, return as-is
  if (publicId.startsWith('http')) return publicId;
  const t = transforms ? `${transforms}/` : '';
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${t}${publicId}`;
};

export const avatarUrl  = (id) => cloudinaryUrl(id, 'w_200,h_200,c_fill,q_auto,f_auto');
export const coverUrl   = (id) => cloudinaryUrl(id, 'w_1920,h_480,c_fill,q_auto,f_auto');
export const logoUrl    = (id) => cloudinaryUrl(id, 'w_400,h_400,c_fit,q_auto,f_auto');
export const galleryUrl = (id) => cloudinaryUrl(id, 'w_800,h_600,c_fill,q_auto,f_auto');
export const thumbUrl   = (id) => cloudinaryUrl(id, 'w_400,h_300,c_fill,q_auto,f_auto');

// ── Truncate ─────────────────────────────────────────────────────────────────
export const truncate = (str, n = 120) =>
  str && str.length > n ? `${str.slice(0, n).trim()}…` : str;

// ── Slug → title ──────────────────────────────────────────────────────────────
export const slugToTitle = (slug) =>
  slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';

// ── Debounce ──────────────────────────────────────────────────────────────────
export const debounce = (fn, ms = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};
