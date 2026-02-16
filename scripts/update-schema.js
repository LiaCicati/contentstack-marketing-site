const fs = require('fs');

// Read the current schema from stdin
const input = fs.readFileSync(0, 'utf8');
const data = JSON.parse(input);
const ct = data.content_type;
const sections = ct.schema.find(f => f.uid === 'sections');

// Global field reference templates
const sectionHeaderGF = {
  data_type: 'global_field',
  display_name: 'Section Header',
  uid: 'section_header',
  reference_to: 'section_header',
  mandatory: false,
  multiple: false,
  unique: false,
  non_localizable: false
};

function ctaButtonGF(uid, displayName) {
  return {
    data_type: 'global_field',
    display_name: displayName,
    uid: uid,
    reference_to: 'cta_button',
    mandatory: false,
    multiple: false,
    unique: false,
    non_localizable: false
  };
}

for (const block of sections.blocks) {
  switch (block.uid) {
    case 'feature_grid':
      block.schema = [
        { ...sectionHeaderGF },
        ...block.schema.filter(f => f.uid !== 'heading' && f.uid !== 'subheading')
      ];
      break;

    case 'service_cards':
      block.schema = [
        { ...sectionHeaderGF },
        ...block.schema.filter(f => f.uid !== 'heading' && f.uid !== 'subheading')
      ];
      break;

    case 'testimonials':
      block.schema = [
        { ...sectionHeaderGF },
        ...block.schema.filter(f => f.uid !== 'heading')
      ];
      break;

    case 'cta_banner': {
      const bodyText = block.schema.find(f => f.uid === 'body_text');
      block.schema = [
        { ...sectionHeaderGF },
        ...(bodyText ? [bodyText] : []),
        ctaButtonGF('primary_cta', 'Primary CTA'),
        ctaButtonGF('secondary_cta', 'Secondary CTA')
      ];
      break;
    }

    case 'rich_text_block':
      block.schema = [
        { ...sectionHeaderGF },
        ...block.schema.filter(f => f.uid !== 'heading')
      ];
      break;

    case 'logo_strip':
      block.schema = [
        { ...sectionHeaderGF },
        ...block.schema.filter(f => f.uid !== 'heading')
      ];
      break;

    case 'hero':
      block.schema = [
        ...block.schema.filter(f => f.uid !== 'cta'),
        ctaButtonGF('cta', 'CTA Button')
      ];
      break;
  }
}

const body = {
  content_type: {
    title: ct.title,
    uid: ct.uid,
    schema: ct.schema,
    options: ct.options,
    description: ct.description || ''
  }
};

process.stdout.write(JSON.stringify(body));
