'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const db = require('../models');

const SOCIAL_FIELDS = [
  ['facebook.com', 'facebook'],
  ['instagram.com', 'instagram'],
  ['youtube.com', 'youtube'],
  ['youtu.be', 'youtube'],
  ['linkedin.com', 'linkedin'],
  ['tiktok.com', 'tiktok'],
  ['t.me', 'telegram'],
  ['telegram.me', 'telegram'],
  ['wa.me', 'whatsapp'],
  ['whatsapp.com', 'whatsapp'],
];

function getArgs() {
  const args = process.argv.slice(2);
  const onlyArg = args.find((arg) => arg.startsWith('--only='));
  const limitArg = args.find((arg) => arg.startsWith('--limit='));

  return {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    only: onlyArg
      ? new Set(
          onlyArg
            .slice('--only='.length)
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
        )
      : null,
    limit: limitArg ? Number(limitArg.slice('--limit='.length)) : null,
  };
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function decodeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripTags(text) {
  if (!text) return '';
  return decodeHtml(text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractMeta(html, metaName) {
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${metaName}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  return decodeHtml(html.match(pattern)?.[1] || '').trim() || null;
}

function extractTitle(html) {
  return stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
}

function extractEmails(html) {
  const matches = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return unique(matches.map((email) => email.toLowerCase()));
}

function normalizePhone(phone) {
  return phone.replace(/\s+/g, ' ').trim();
}

function extractPhones(html) {
  const matches = html.match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || [];
  return unique(
    matches
      .map(normalizePhone)
      .filter((value) => /\d{8,}/.test(value.replace(/\D/g, '')))
  );
}

function extractLinks(html, baseUrl) {
  const hrefMatches = [...html.matchAll(/href=["']([^"'#]+)["']/gi)];
  return unique(
    hrefMatches.map((match) => {
      try {
        return new URL(match[1], baseUrl).toString();
      } catch {
        return null;
      }
    })
  );
}

function pickPriorityLink(links, patterns) {
  for (const pattern of patterns) {
    const match = links.find((link) => pattern.test(link.url) || pattern.test(link.text));
    if (match) return match.url;
  }
  return null;
}

function extractNamedLinks(html, baseUrl) {
  const matches = [...html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  return unique(
    matches.map((match) => {
      try {
        return JSON.stringify({
          url: new URL(match[1], baseUrl).toString(),
          text: stripTags(match[2]).toLowerCase(),
        });
      } catch {
        return null;
      }
    })
  )
    .filter(Boolean)
    .map((value) => JSON.parse(value));
}

function extractSocials(html, baseUrl) {
  const links = extractLinks(html, baseUrl);
  const socials = {};

  for (const link of links) {
    const lower = link.toLowerCase();
    for (const [needle, field] of SOCIAL_FIELDS) {
      if (lower.includes(needle) && !socials[field]) {
        socials[field] = link;
      }
    }
  }

  return socials;
}

function extractOfficeHours(text) {
  const match = text.match(
    /\b(?:Mon|Monday|Tue|Tuesday|Wed|Wednesday|Thu|Thursday|Fri|Friday|Sat|Saturday|Sun|Sunday)[^.\n]{0,120}(?:am|pm)\b/gi
  );
  return match ? match[0].replace(/\s+/g, ' ').trim() : null;
}

async function fetchHtml(url) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available in this Node runtime.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'UniSitesUniversityEnricher/1.0 (+official source verification)',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    return {
      html,
      finalUrl: res.url || url,
      status: res.status,
    };
  } finally {
    clearTimeout(timer);
  }
}

function chooseBestEmail(emails) {
  return emails.find((email) => !email.startsWith('webmaster@')) || emails[0] || null;
}

function chooseBestPhone(phones) {
  return phones.find((phone) => phone.includes('+855')) || phones[0] || null;
}

function buildExtractedPayload(university, html, finalUrl) {
  const text = stripTags(html);
  const emails = extractEmails(html);
  const phones = extractPhones(text);
  const socials = extractSocials(html, finalUrl);
  const namedLinks = extractNamedLinks(html, finalUrl);
  const admissionsUrl = pickPriorityLink(namedLinks, [
    /admission/,
    /apply/,
    /register/,
    /enroll/,
  ]);
  const programsUrl = pickPriorityLink(namedLinks, [
    /program/,
    /faculty/,
    /school/,
    /department/,
    /study/,
  ]);
  const aboutUrl = pickPriorityLink(namedLinks, [
    /about/,
    /history/,
    /overview/,
    /who we are/,
  ]);

  return {
    meta_title: extractTitle(html) || university.meta_title || null,
    meta_description:
      extractMeta(html, 'description') ||
      extractMeta(html, 'og:description') ||
      university.meta_description ||
      null,
    email: chooseBestEmail(emails),
    phone: chooseBestPhone(phones),
    facebook_url: socials.facebook || null,
    instagram_url: socials.instagram || null,
    youtube_url: socials.youtube || null,
    linkedin_url: socials.linkedin || null,
    tiktok_url: socials.tiktok || null,
    telegram_url: socials.telegram || null,
    contact: {
      general_email: chooseBestEmail(emails),
      general_phone: chooseBestPhone(phones),
      facebook_page: socials.facebook || null,
      instagram: socials.instagram || null,
      youtube: socials.youtube || null,
      linkedin: socials.linkedin || null,
      tiktok: socials.tiktok || null,
      telegram: socials.telegram || null,
      whatsapp: socials.whatsapp || null,
      office_hours: extractOfficeHours(text),
      admissions_url: admissionsUrl,
      programs_url: programsUrl,
      about_url: aboutUrl,
    },
    evidence: {
      fetched_url: finalUrl,
      extracted_emails: emails,
      extracted_phones: phones,
      extracted_socials: socials,
      extracted_named_links: namedLinks.slice(0, 50),
    },
  };
}

function assignIfAllowed(target, key, value, force) {
  if (!value) return;
  if (force || !target[key]) {
    target[key] = value;
  }
}

async function updateUniversityAndContact(university, extracted, options, transaction) {
  const uniPatch = {};

  assignIfAllowed(uniPatch, 'meta_title', extracted.meta_title, options.force);
  assignIfAllowed(uniPatch, 'meta_description', extracted.meta_description, options.force);
  assignIfAllowed(uniPatch, 'email', extracted.email, options.force);
  assignIfAllowed(uniPatch, 'phone', extracted.phone, options.force);
  assignIfAllowed(uniPatch, 'facebook_url', extracted.facebook_url, options.force);
  assignIfAllowed(uniPatch, 'instagram_url', extracted.instagram_url, options.force);
  assignIfAllowed(uniPatch, 'youtube_url', extracted.youtube_url, options.force);
  assignIfAllowed(uniPatch, 'linkedin_url', extracted.linkedin_url, options.force);
  assignIfAllowed(uniPatch, 'tiktok_url', extracted.tiktok_url, options.force);
  assignIfAllowed(uniPatch, 'telegram_url', extracted.telegram_url, options.force);

  if (Object.keys(uniPatch).length > 0) {
    await university.update(uniPatch, { transaction });
  }

  let contact = await db.UniversityContact.findOne({
    where: { university_id: university.id },
    transaction,
  });

  const contactPatch = {};
  const fields = [
    'general_email',
    'general_phone',
    'facebook_page',
    'instagram',
    'youtube',
    'linkedin',
    'tiktok',
    'telegram',
    'whatsapp',
    'office_hours',
    'admissions_url',
    'programs_url',
    'about_url',
  ];

  for (const field of fields) {
    const existingValue = contact?.[field];
    const nextValue = extracted.contact[field];
    if (nextValue && (options.force || !existingValue)) {
      contactPatch[field] = nextValue;
    }
  }

  if (!contact && Object.keys(contactPatch).length > 0 && !options.dryRun) {
    contact = await db.UniversityContact.create(
      {
        university_id: university.id,
        ...contactPatch,
      },
      { transaction }
    );
  } else if (contact && Object.keys(contactPatch).length > 0) {
    await contact.update(contactPatch, { transaction });
  }

  return {
    universityUpdated: Object.keys(uniPatch).length > 0,
    contactUpdated: Object.keys(contactPatch).length > 0,
  };
}

async function processSource(source, options) {
  const transaction = await db.sequelize.transaction();

  try {
    const university = await db.University.findByPk(source.university_id, {
      transaction,
    });

    if (!university) {
      throw new Error(`University ${source.university_id} not found`);
    }

    const targetUrl = source.source_url || university.website_url;
    if (!targetUrl) {
      throw new Error(`No source URL for ${university.slug}`);
    }

    const fetched = await fetchHtml(targetUrl);
    const extracted = buildExtractedPayload(university, fetched.html, fetched.finalUrl);

    let updateSummary = { universityUpdated: false, contactUpdated: false };
    if (!options.dryRun) {
      updateSummary = await updateUniversityAndContact(
        university,
        extracted,
        options,
        transaction
      );

      await source.update(
        {
          import_status: 'active',
          last_verified_at: new Date().toISOString().slice(0, 10),
          raw_payload: {
            ...(source.raw_payload || {}),
            enrichment: {
              fetched_url: fetched.finalUrl,
              status: fetched.status,
              fetched_at: new Date().toISOString(),
              extracted: extracted.evidence,
            },
          },
        },
        { transaction }
      );
    }

    await transaction.commit();

    return {
      slug: university.slug,
      source: targetUrl,
      ...updateSummary,
    };
  } catch (err) {
    await transaction.rollback();

    if (!options.dryRun) {
      try {
        await source.update({
          import_status: 'failed',
          raw_payload: {
            ...(source.raw_payload || {}),
            enrichment_error: {
              message: err.message,
              failed_at: new Date().toISOString(),
            },
          },
        });
      } catch {
        // Best effort only; original error is more useful.
      }
    }

    return {
      slug: source.University?.slug || source.university_id,
      source: source.source_url,
      error: err.message,
    };
  }
}

async function main() {
  const options = getArgs();
  const where = { import_status: 'active' };
  const include = [{ model: db.University, as: 'University', required: true }];

  const sources = await db.UniversitySource.findAll({
    where,
    include,
    order: [['created_at', 'ASC']],
  });

  let rows = sources;
  if (options.only) {
    rows = rows.filter((source) => options.only.has(source.University.slug));
  }
  if (Number.isInteger(options.limit) && options.limit > 0) {
    rows = rows.slice(0, options.limit);
  }

  const summary = {
    processed: 0,
    universityUpdated: 0,
    contactUpdated: 0,
    failed: 0,
  };

  for (const source of rows) {
    const result = await processSource(source, options);
    summary.processed += 1;

    if (result.error) {
      summary.failed += 1;
      console.log(`[FAILED] ${result.slug} -> ${result.error}`);
      continue;
    }

    if (result.universityUpdated) summary.universityUpdated += 1;
    if (result.contactUpdated) summary.contactUpdated += 1;

    console.log(
      `[ENRICHED] ${result.slug} (university=${result.universityUpdated ? 'updated' : 'unchanged'}, contact=${result.contactUpdated ? 'updated' : 'unchanged'})`
    );
  }

  console.log('');
  console.log(`Processed: ${summary.processed}`);
  console.log(`University rows updated: ${summary.universityUpdated}`);
  console.log(`Contact rows updated: ${summary.contactUpdated}`);
  console.log(`Failed: ${summary.failed}`);
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
