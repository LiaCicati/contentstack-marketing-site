const https = require('https');

const API_KEY = 'blt9c24b3e8d7ee5fa9';
const MGMT_TOKEN = 'cse7bd01875e1d383ad51ae0c0';
const HOST = 'eu-api.contentstack.com';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: HOST,
      path: `/v3${path}`,
      method,
      headers: {
        'api_key': API_KEY,
        'authorization': MGMT_TOKEN,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try { resolve(JSON.parse(text)); } catch { resolve(text); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function migrateEntry(entry) {
  if (!entry.sections) return entry;

  for (const section of entry.sections) {
    // feature_grid: heading/subheading → section_header
    if (section.feature_grid) {
      const b = section.feature_grid;
      b.section_header = {
        heading: b.heading || '',
        subheading: b.subheading || '',
      };
      delete b.heading;
      delete b.subheading;
    }

    // service_cards: heading/subheading → section_header
    if (section.service_cards) {
      const b = section.service_cards;
      b.section_header = {
        heading: b.heading || '',
        subheading: b.subheading || '',
      };
      delete b.heading;
      delete b.subheading;
    }

    // testimonials: heading → section_header
    if (section.testimonials) {
      const b = section.testimonials;
      b.section_header = {
        heading: b.heading || '',
        subheading: '',
      };
      delete b.heading;
    }

    // cta_banner: heading → section_header, primary_button → primary_cta, secondary_button → secondary_cta
    if (section.cta_banner) {
      const b = section.cta_banner;
      b.section_header = {
        heading: b.heading || '',
        subheading: '',
      };
      b.primary_cta = {
        label: b.primary_button?.label || '',
        url: b.primary_button?.url || { title: '', href: '' },
      };
      b.secondary_cta = {
        label: b.secondary_button?.label || '',
        url: b.secondary_button?.url || { title: '', href: '' },
      };
      delete b.heading;
      delete b.primary_button;
      delete b.secondary_button;
    }

    // rich_text_block: heading → section_header
    if (section.rich_text_block) {
      const b = section.rich_text_block;
      b.section_header = {
        heading: b.heading || '',
        subheading: '',
      };
      delete b.heading;
    }

    // logo_strip: heading → section_header
    if (section.logo_strip) {
      const b = section.logo_strip;
      b.section_header = {
        heading: b.heading || '',
        subheading: '',
      };
      delete b.heading;
    }

    // hero: cta stays same shape (label + url), just the schema ref changed
    // No data migration needed for hero.cta since the field UID and shape are the same
  }

  return entry;
}

async function main() {
  const locales = ['en-us', 'it-it'];

  for (const locale of locales) {
    console.log(`\n=== Processing locale: ${locale} ===`);

    // Fetch entries
    const fetchUrl = locale === 'en-us'
      ? `/content_types/page/entries?locale=${locale}`
      : `/content_types/page/entries?locale=${locale}`;
    const res = await request('GET', fetchUrl);
    const entries = res.entries || [];
    console.log(`Found ${entries.length} entries`);

    for (const entry of entries) {
      console.log(`  Migrating: ${entry.title} (${entry.uid})`);

      const migrated = migrateEntry(JSON.parse(JSON.stringify(entry)));

      // Clean up Contentstack system fields before update
      const { uid, _version, created_at, updated_at, created_by, updated_by, publish_details, ACL, _in_progress, _metadata, tags, locale: loc, ...cleanEntry } = migrated;

      try {
        const updateRes = await request('PUT', `/content_types/page/entries/${entry.uid}?locale=${locale}`, { entry: cleanEntry });
        if (updateRes.notice) {
          console.log(`    ✓ Updated: ${updateRes.notice}`);
        } else {
          console.log(`    ✗ Error:`, JSON.stringify(updateRes.error_message || updateRes).substring(0, 200));
        }
        await sleep(200);

        // Publish
        const publishBody = locale === 'en-us'
          ? { entry: { locales: [locale], environments: ['dev'] } }
          : { entry: { locales: [locale], environments: ['dev'] }, locale };
        const pubRes = await request('POST', `/content_types/page/entries/${entry.uid}/publish`, publishBody);
        if (pubRes.notice) {
          console.log(`    ✓ Published`);
        } else {
          console.log(`    ✗ Publish error:`, JSON.stringify(pubRes.error_message || pubRes).substring(0, 200));
        }
        await sleep(200);
      } catch (err) {
        console.log(`    ✗ Exception:`, err.message);
      }
    }
  }

  console.log('\n=== Migration complete ===');
}

main().catch(console.error);
