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

// ── Client-side image optimization ───────────────────────────────────────────
export const optimizeImageFile = async (
  file,
  {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputType = 'image/jpeg',
  } = {}
) => {
  if (!(file instanceof File)) return file;
  if (!file.type?.startsWith('image/')) return file;
  if (file.type === 'image/gif') return file;

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const targetWidth = Math.max(1, Math.round(image.width * ratio));
    const targetHeight = Math.max(1, Math.round(image.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, outputType, quality)
    );

    if (!blob || blob.size >= file.size) return file;

    const extension = outputType === 'image/webp' ? 'webp' : 'jpg';
    const nextName = file.name.replace(/\.[^.]+$/, '') || 'image';

    return new File([blob], `${nextName}.${extension}`, {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};
