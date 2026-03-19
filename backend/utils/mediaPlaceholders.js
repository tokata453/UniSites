'use strict';

const PALETTES = [
  { bg: '#eff6ff', bgAlt: '#dbeafe', accent: '#1d4ed8', text: '#0f172a', soft: '#93c5fd' },
  { bg: '#f8fafc', bgAlt: '#e2e8f0', accent: '#334155', text: '#0f172a', soft: '#cbd5e1' },
  { bg: '#f0fdf4', bgAlt: '#dcfce7', accent: '#15803d', text: '#052e16', soft: '#86efac' },
  { bg: '#fff7ed', bgAlt: '#ffedd5', accent: '#ea580c', text: '#431407', soft: '#fdba74' },
  { bg: '#fdf4ff', bgAlt: '#fae8ff', accent: '#a21caf', text: '#3b0764', soft: '#e879f9' },
  { bg: '#ecfeff', bgAlt: '#cffafe', accent: '#0891b2', text: '#083344', soft: '#67e8f9' },
];

const CAMBODIA_CITY_IMAGES = [
  'https://images.unsplash.com/photo-1657027537483-39bb7a44028a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
  'https://images.unsplash.com/photo-1631067701909-111c10141e07?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
];

const CAMBODIA_CAMPUS_IMAGES = [
  'https://images.unsplash.com/photo-1623053071809-80ed5bc65f2e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
  'https://images.unsplash.com/photo-1755053757871-d49d9a3f8d74?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
  'https://images.unsplash.com/photo-1737182269834-49f8b02edf02?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
];

const CAMBODIA_HERITAGE_IMAGES = [
  'https://images.unsplash.com/photo-1657027537483-39bb7a44028a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
];

const UNIVERSITY_COVER_IMAGES = [
  ...CAMBODIA_CAMPUS_IMAGES,
  ...CAMBODIA_CITY_IMAGES,
];

const NEWS_IMAGES = [
  ...CAMBODIA_CAMPUS_IMAGES,
  ...CAMBODIA_CITY_IMAGES,
];

const EVENT_IMAGES = [
  ...CAMBODIA_CAMPUS_IMAGES,
  ...CAMBODIA_CITY_IMAGES,
];

const OPPORTUNITY_IMAGES = [
  ...CAMBODIA_CAMPUS_IMAGES,
  ...CAMBODIA_CITY_IMAGES,
  ...CAMBODIA_HERITAGE_IMAGES,
];

const MAJOR_IMAGES = [
  ...CAMBODIA_CAMPUS_IMAGES,
  ...CAMBODIA_CITY_IMAGES,
];

const GENERIC_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1588581939864-064d42ace7cd?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
  'https://images.unsplash.com/photo-1742790174660-90d090befa3d?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
  'https://images.unsplash.com/photo-1744982588041-8488ed9d8c17?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
];

const UNIVERSITY_COVER_OVERRIDES = [
  {
    match: /royal-university-of-phnom-penh|rupp|national-university-of-management|num|royal-university-of-law-and-economics|rule/i,
    images: [
      'https://images.unsplash.com/photo-1623053071809-80ed5bc65f2e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1657027537483-39bb7a44028a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
    ],
  },
  {
    match: /institute-of-technology-of-cambodia|itc|camtech|iic|technology/i,
    images: [
      'https://images.unsplash.com/photo-1737182269834-49f8b02edf02?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1755053757871-d49d9a3f8d74?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
    ],
  },
  {
    match: /american-university-of-phnom-penh|aupp|private|international/i,
    images: [
      'https://images.unsplash.com/photo-1631067701909-111c10141e07?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1657027537483-39bb7a44028a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
    ],
  },
  {
    match: /phnom-penh|cambodia|asia-euro|norton|university-of-cambodia|pannasastra|paññāsastra|puthisastra|human-resource|international/i,
    images: [
      'https://images.unsplash.com/photo-1657027537483-39bb7a44028a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1631067701909-111c10141e07?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1623053071809-80ed5bc65f2e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
    ],
  },
];

const OPPORTUNITY_IMAGE_OVERRIDES = [
  {
    match: /mext|japan|japanese government/i,
    images: [
      'https://images.unsplash.com/photo-1755053757871-d49d9a3f8d74?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1657027537483-39bb7a44028a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
    ],
  },
  {
    match: /gks|korean government|korea/i,
    images: [
      'https://images.unsplash.com/photo-1631067701909-111c10141e07?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1755053757871-d49d9a3f8d74?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
    ],
  },
  {
    match: /scholarship|grant|fellowship|tuition waiver/i,
    images: [
      'https://images.unsplash.com/photo-1737182269834-49f8b02edf02?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1755053757871-d49d9a3f8d74?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
    ],
  },
  {
    match: /internship|job|career|volunteer|bootcamp|network|competition|exchange|workshop|research/i,
    images: [
      'https://images.unsplash.com/photo-1737182269834-49f8b02edf02?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1623053071809-80ed5bc65f2e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
      'https://images.unsplash.com/photo-1631067701909-111c10141e07?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
    ],
  },
];

function hashString(input = '') {
  return String(input).split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
}

function getPalette(seed) {
  return PALETTES[Math.abs(hashString(seed)) % PALETTES.length];
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(text, length = 34) {
  const value = String(text || '').trim();
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1)}…`;
}

function initials(name = '', count = 2) {
  const parts = String(name)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const chars = parts.slice(0, count).map((part) => part[0]?.toUpperCase()).join('');
  return chars || 'U';
}

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s{2,}/g, ' ').trim())}`;
}

function pickFrom(seed, items) {
  return items[Math.abs(hashString(seed)) % items.length];
}

function pickFromMatchingPool(seed, source, rules, fallbackPool = []) {
  const value = String(source || '');
  const matched = rules.find((rule) => rule.match.test(value));
  const pool = matched?.images?.length
    ? matched.images
    : fallbackPool.length
      ? fallbackPool
      : GENERIC_FALLBACK_IMAGES;
  return pickFrom(`${seed}:${value}`, pool);
}

function createUniversityLogo(name, type = 'university') {
  const palette = getPalette(`${name}:${type}:logo`);
  const mark = initials(name, 2);
  const label = truncate(type.replace(/_/g, ' '), 14).toUpperCase();
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.bgAlt}" />
          <stop offset="100%" stop-color="${palette.bg}" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="104" fill="url(#g)" />
      <circle cx="256" cy="214" r="120" fill="${palette.accent}" opacity="0.12" />
      <text x="256" y="255" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="132" font-weight="800" fill="${palette.accent}">${escapeXml(mark)}</text>
      <text x="256" y="356" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="5" fill="${palette.text}" opacity="0.78">${escapeXml(label)}</text>
    </svg>
  `);
}

function createUniversityCover(name, province = 'Cambodia', type = 'University') {
  if (UNIVERSITY_COVER_IMAGES.length) {
    return pickFromMatchingPool(
      `${name}:${province}:${type}:cover`,
      `${name} ${province} ${type}`,
      UNIVERSITY_COVER_OVERRIDES,
      UNIVERSITY_COVER_IMAGES,
    );
  }
  const palette = getPalette(`${name}:${province}:${type}:cover`);
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="${palette.bg}" />
      <text x="100" y="220" font-family="Inter, Arial, sans-serif" font-size="78" font-weight="800" fill="${palette.text}">${escapeXml(truncate(name, 28))}</text>
      <text x="100" y="300" font-family="Inter, Arial, sans-serif" font-size="32" fill="${palette.accent}">${escapeXml(`${province}, Cambodia`)}</text>
    </svg>
  `);
}

function createContentImage(title, label = 'Update', subtitle = '') {
  const key = `${title}:${label}:${subtitle}`.toLowerCase();
  const sourcePool =
    key.includes('scholarship') ||
    key.includes('internship') ||
    key.includes('exchange') ||
    key.includes('competition') ||
    key.includes('workshop') ||
    key.includes('research') ||
    key.includes('volunteer') ||
    key.includes('parttime') ||
    key.includes('opportunity')
      ? OPPORTUNITY_IMAGES
      : key.includes('event') ||
        key.includes('open day') ||
        key.includes('graduation') ||
        key.includes('seminar')
      ? EVENT_IMAGES
      : NEWS_IMAGES;

  if (sourcePool.length) {
    return pickFromMatchingPool(
      `${title}:${label}:${subtitle}`,
      `${title} ${label} ${subtitle}`,
      OPPORTUNITY_IMAGE_OVERRIDES,
      sourcePool,
    );
  }
  const palette = getPalette(`${title}:${label}:${subtitle}`);
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="${palette.bg}" />
      <text x="100" y="220" font-family="Inter, Arial, sans-serif" font-size="70" font-weight="800" fill="${palette.text}">${escapeXml(truncate(title, 30))}</text>
      <text x="100" y="300" font-family="Inter, Arial, sans-serif" font-size="30" fill="${palette.accent}">${escapeXml(truncate(label, 24))}</text>
    </svg>
  `);
}

function createMajorCover(name, field = 'Major', icon = 'Study') {
  if (MAJOR_IMAGES.length) {
    return pickFrom(`${name}:${field}:${icon}:major`, MAJOR_IMAGES);
  }
  const palette = getPalette(`${name}:${field}:${icon}:major`);
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
      <rect width="1400" height="900" fill="${palette.bg}" />
      <text x="100" y="220" font-family="Inter, Arial, sans-serif" font-size="82" font-weight="800" fill="${palette.text}">${escapeXml(truncate(name, 24))}</text>
      <text x="100" y="305" font-family="Inter, Arial, sans-serif" font-size="30" fill="${palette.accent}">${escapeXml(field)}</text>
    </svg>
  `);
}

module.exports = {
  createUniversityLogo,
  createUniversityCover,
  createContentImage,
  createMajorCover,
};
