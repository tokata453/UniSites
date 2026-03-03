// utils/bucket.js
// Railway Bucket with Presigned URLs (no ACL support)

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

// Configure S3 client for Railway Bucket
const s3 = new S3Client({
  region: process.env.BUCKET_REGION || 'auto',
  endpoint: `https://${process.env.BUCKET_HOST}`,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // Virtual-hosted style for Railway
});

const BUCKET_NAME = process.env.BUCKET_NAME;

// Cache for presigned URLs (optional - for better performance)
const urlCache = new Map();

/**
 * Upload a file buffer to Railway Bucket
 * @param {Buffer} buffer     - File data
 * @param {string} folder     - Folder: 'products' | 'categories' | 'avatars'
 * @param {string} mimetype   - e.g. 'image/jpeg'
 * @param {string} originalName - Original filename (for extension)
 * @returns {Promise<{url, key}>}
 */
const uploadFile = async (buffer, folder, mimetype, originalName) => {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1_000_000_000);
  const key = `${folder}/${timestamp}-${random}${ext}`;

  // Upload file (private by default, no ACL needed)
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      // NO ACL - Railway Buckets don't support public ACLs
    })
  );

  // Generate presigned URL (valid for 7 days)
  const presignedUrl = await generatePresignedUrl(key, 7 * 24 * 60 * 60); // 7 days

  return { url: presignedUrl, key };
};

/**
 * Generate a presigned URL for a file
 * @param {string} key - File key in bucket
 * @param {number} expiresIn - Seconds until expiration (default: 7 days)
 * @returns {Promise<string>} - Presigned URL
 */
const generatePresignedUrl = async (key, expiresIn = 7 * 24 * 60 * 60) => {
  // Check cache first
  const cacheKey = `${key}-${expiresIn}`;
  if (urlCache.has(cacheKey)) {
    const cached = urlCache.get(cacheKey);
    // If cache is still valid (not expired), return it
    if (cached.expires > Date.now()) {
      return cached.url;
    }
    urlCache.delete(cacheKey);
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn });

  // Cache the URL
  urlCache.set(cacheKey, {
    url,
    expires: Date.now() + (expiresIn * 1000) - 60000, // Expire 1 min early
  });

  return url;
};

/**
 * Delete a file from Railway Bucket by key
 * @param {string} key - e.g. 'products/1712345678-839201234.jpg'
 */
const deleteFile = async (key) => {
  if (!key) return;
  
  // Remove from cache
  for (const cacheKey of urlCache.keys()) {
    if (cacheKey.startsWith(key)) {
      urlCache.delete(cacheKey);
    }
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
};

/**
 * Extract the key from a Railway Bucket URL or presigned URL
 * @param {string} url - Full URL or presigned URL
 * @returns {string|null} - File key
 */
const keyFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Handle presigned URLs (contains query params)
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Remove leading slash
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  } catch {
    return null;
  }
};

/**
 * Regenerate presigned URL for an existing file
 * Useful when old URL expires
 * @param {string} keyOrUrl - File key or old presigned URL
 * @returns {Promise<string>} - New presigned URL
 */
const refreshUrl = async (keyOrUrl) => {
  const key = keyFromUrl(keyOrUrl) || keyOrUrl;
  return generatePresignedUrl(key);
};

module.exports = { 
  uploadFile, 
  deleteFile, 
  keyFromUrl, 
  generatePresignedUrl,
  refreshUrl 
};