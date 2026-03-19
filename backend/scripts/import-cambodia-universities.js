'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {
  createUniversityLogo,
  createUniversityCover,
  isSeedFallbackImage,
} = require('../utils/mediaPlaceholders');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const db = require('../models');

const catalogPath = path.join(
  __dirname,
  '..',
  'data',
  'cambodia-universities.catalog.json'
);

const UNIVERSITY_FIELDS = [
  'slug',
  'name',
  'name_km',
  'description',
  'description_km',
  'type',
  'location',
  'province',
  'address',
  'lat',
  'lng',
  'tuition_min',
  'tuition_max',
  'tuition_currency',
  'founded_year',
  'student_count',
  'faculty_count',
  'program_count',
  'accreditation',
  'ranking_local',
  'ranking_global',
  'website_url',
  'email',
  'phone',
  'facebook_url',
  'telegram_url',
  'instagram_url',
  'youtube_url',
  'linkedin_url',
  'tiktok_url',
  'is_verified',
  'is_featured',
  'is_published',
  'scholarship_available',
  'dormitory_available',
  'international_students',
  'meta_title',
  'meta_description',
];

function getArgs() {
  const args = process.argv.slice(2);
  const onlyArg = args.find((arg) => arg.startsWith('--only='));
  return {
    dryRun: args.includes('--dry-run'),
    only: onlyArg
      ? new Set(
          onlyArg
            .slice('--only='.length)
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
        )
      : null,
  };
}

function loadCatalog() {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

function cleanValue(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
}

function buildUniversityPayload(entry) {
  const payload = {
    is_verified: true,
    is_published: true,
  };

  UNIVERSITY_FIELDS.forEach((field) => {
    const value = cleanValue(entry[field]);
    if (value !== undefined) {
      payload[field] = value;
    }
  });

  if (!payload.meta_title && payload.name) {
    payload.meta_title = payload.name;
  }

  if (!payload.meta_description && payload.name && payload.province) {
    payload.meta_description = `${payload.name} in ${payload.province}, Cambodia.`;
  }

  if (!payload.logo_url && payload.name) {
    payload.logo_url = createUniversityLogo(payload.name, payload.type || 'university');
  }

  if ((!payload.cover_url || isSeedFallbackImage(payload.cover_url)) && payload.name) {
    payload.cover_url = createUniversityCover(
      payload.name,
      payload.province || 'Cambodia',
      payload.type || 'university'
    );
  }

  return payload;
}

async function findExistingUniversity(entry, transaction) {
  const whereOptions = [
    { slug: entry.slug },
  ];

  if (entry.legacy_slug) {
    whereOptions.push({ slug: entry.legacy_slug });
  }

  if (entry.website_url) {
    whereOptions.push({ website_url: entry.website_url });
  }

  for (const where of whereOptions) {
    const university = await db.University.findOne({ where, transaction });
    if (university) return university;
  }

  return null;
}

function getSourceEntries(entry) {
  if (Array.isArray(entry.sources) && entry.sources.length > 0) {
    return entry.sources;
  }
  if (entry.source?.source_url) {
    return [entry.source];
  }
  return [];
}

async function upsertUniversitySources(universityId, entry, transaction) {
  const sourceEntries = getSourceEntries(entry);
  const stats = { created: 0, updated: 0, skipped: 0 };

  for (const sourceEntry of sourceEntries) {
    if (!sourceEntry?.source_url) {
      stats.skipped += 1;
      continue;
    }

    const sourcePayload = {
      university_id: universityId,
      source_name: sourceEntry.source_name || 'Official source',
      source_type: sourceEntry.source_type || 'official_website',
      source_url: sourceEntry.source_url,
      external_id: sourceEntry.external_id || null,
      confidence_score: sourceEntry.confidence_score || 100,
      import_status: 'active',
      last_verified_at: sourceEntry.last_verified_at || null,
      raw_payload: {
        university: entry,
        source: sourceEntry,
      },
    };

    const existingSource = await db.UniversitySource.findOne({
      where: {
        university_id: universityId,
        source_url: sourcePayload.source_url,
      },
      transaction,
    });

    if (existingSource) {
      await existingSource.update(sourcePayload, { transaction });
      stats.updated += 1;
      continue;
    }

    await db.UniversitySource.create(sourcePayload, { transaction });
    stats.created += 1;
  }

  return stats;
}

async function importEntry(entry, options) {
  const transaction = await db.sequelize.transaction();

  try {
    const existing = await findExistingUniversity(entry, transaction);
    const payload = buildUniversityPayload(entry);

    let action = 'created';
    let university = existing;

    if (existing) {
      action = 'updated';

      if (!payload.slug && entry.slug) {
        payload.slug = entry.slug;
      }

      if (entry.slug && existing.slug !== entry.slug) {
        payload.slug = entry.slug;
      }

      if (options.dryRun) {
        await transaction.rollback();
        return { action, slug: entry.slug, sourceStats: { created: 0, updated: 0, skipped: 0 } };
      }

      await existing.update(payload, { transaction });
      university = existing;
    } else {
      if (options.dryRun) {
        await transaction.rollback();
        return { action, slug: entry.slug, sourceStats: { created: 0, updated: 0, skipped: 0 } };
      }

      university = await db.University.create(payload, { transaction });
    }

    const sourceStats = await upsertUniversitySources(university.id, entry, transaction);
    await transaction.commit();

    return {
      action,
      slug: university.slug,
      sourceStats,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function main() {
  const options = getArgs();
  const catalog = loadCatalog();
  const rows = options.only
    ? catalog.filter((entry) => options.only.has(entry.slug))
    : catalog;

  const summary = {
    created: 0,
    updated: 0,
    sourceCreated: 0,
    sourceUpdated: 0,
    processed: 0,
  };

  for (const entry of rows) {
    if (!entry.slug || !entry.name) {
      throw new Error(`Catalog entry is missing required fields: ${JSON.stringify(entry)}`);
    }

    const result = await importEntry(entry, options);
    summary.processed += 1;
    summary[result.action] += 1;

    summary.sourceCreated += result.sourceStats.created;
    summary.sourceUpdated += result.sourceStats.updated;

    console.log(
      `[${result.action.toUpperCase()}] ${result.slug} (sources: +${result.sourceStats.created}/~${result.sourceStats.updated})`
    );
  }

  console.log('');
  console.log(`Processed: ${summary.processed}`);
  console.log(`Created universities: ${summary.created}`);
  console.log(`Updated universities: ${summary.updated}`);
  console.log(`Created sources: ${summary.sourceCreated}`);
  console.log(`Updated sources: ${summary.sourceUpdated}`);
  console.log(`Mode: ${options.dryRun ? 'dry-run' : 'write'}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close();
  });
