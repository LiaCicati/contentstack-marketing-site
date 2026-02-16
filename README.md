# Contentstack Marketing Site — Reference Architecture

A production-style example showing how to build a marketing website with **Contentstack** as the headless CMS and **Next.js 14** (App Router, TypeScript, Tailwind CSS) as the frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Content Modeling](#content-modeling)
4. [Navigation Hierarchy](#navigation-hierarchy)
5. [Frontend Setup](#frontend-setup)
6. [Rendering Flow](#rendering-flow)
7. [Editor Workflow](#editor-workflow)
8. [Scalability & Best Practices](#scalability--best-practices)

---

## Overview

This project demonstrates:

| Concern | Approach |
|---|---|
| Page composition | Modular blocks ("page builder") — editors drag/drop section types |
| Navigation | Singleton content type with nested groups and page references |
| Reusable content | Testimonials as a separate content type, referenced from any page |
| Global chrome | Site Settings singleton for logo, footer, social links |
| Routing | Next.js catch-all route `[...slug]` — every CMS page auto-renders |
| Static generation | `generateStaticParams` + ISR (60s revalidation) |

**This is a reference architecture, not a starter template.** It's designed to be read, understood, and adapted — not cloned and deployed blindly.

---

## Project Structure

```
contentstack-marketing-site/
│
├── cms-schemas/                    # Contentstack content type JSON definitions
│   ├── page.json                   # The core Page content type (modular blocks)
│   ├── navigation.json             # Nested navigation singleton
│   ├── testimonial.json            # Reusable testimonial entries
│   └── site_settings.json          # Global site chrome (logo, footer, etc.)
│
├── cms-sample-entries/             # Example CMS entries (what editors create)
│   ├── page-home.json              # Home landing page with 5 sections
│   ├── page-about.json             # About Us page
│   ├── page-solutions-enterprise.json
│   ├── page-solutions-startups.json
│   ├── page-pricing.json
│   ├── page-contact.json
│   ├── navigation.json             # Full nested menu structure
│   ├── testimonials.json           # 3 sample testimonials
│   └── site_settings.json          # Global settings entry
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout — fetches nav + settings
│   │   ├── page.tsx                # Home page (url: "/")
│   │   ├── [...slug]/page.tsx      # Catch-all dynamic route
│   │   ├── not-found.tsx           # 404 page
│   │   └── globals.css
│   │
│   ├── lib/
│   │   ├── contentstack-client.ts  # SDK initialization
│   │   └── api.ts                  # All CMS queries (typed)
│   │
│   ├── types/
│   │   └── contentstack.ts         # TypeScript types for all content models
│   │
│   └── components/
│       ├── layout/
│       │   ├── Navigation.tsx      # Responsive nav with nested dropdowns
│       │   └── Footer.tsx          # Footer with social links
│       └── sections/
│           ├── SectionRenderer.tsx  # Maps modular blocks → React components
│           ├── HeroSection.tsx
│           ├── FeatureGridSection.tsx
│           ├── CtaBannerSection.tsx
│           ├── TestimonialsSection.tsx
│           ├── RichTextBlockSection.tsx
│           └── LogoStripSection.tsx
│
├── .env.local.example              # Required environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## Content Modeling

### Why these four content types?

```
┌─────────────────┐     ┌─────────────────┐
│  Site Settings   │────▶│   Navigation    │
│   (singleton)    │     │   (singleton)    │
└─────────────────┘     └────────┬────────┘
                                 │ references
                                 ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │      Page       │────▶│   Testimonial   │
                        │ (modular blocks)│     │   (reusable)    │
                        └─────────────────┘     └─────────────────┘
```

#### 1. `Page` — The core content type

Every marketing page is a Page entry. It uses **modular blocks** (Contentstack's composable field type) to let editors build pages from reusable section types:

| Block Type | Purpose |
|---|---|
| `hero` | Full-width hero with headline, sub-headline, background image, CTA |
| `feature_grid` | Grid of feature cards (3-4 per row) |
| `cta_banner` | Full-width call-to-action strip |
| `testimonials` | References to Testimonial entries |
| `rich_text_block` | Free-form rich text (JSON RTE) |
| `logo_strip` | Horizontal logo bar ("Trusted by...") |

**Why modular blocks?** Editors get a page-builder experience (add, reorder, remove sections) while developers maintain control over the rendered markup. New section types are added by creating a new block definition + React component — no changes to existing code.

#### 2. `Navigation` — Nested menu structure

A **singleton** content type with a `nav_items` group that supports two levels of nesting:

```
nav_items[]:
  ├── label: "Solutions"
  ├── page_reference → null (parent-only, no direct link)
  └── children[]:
       ├── { label: "Enterprise", page_reference → /solutions/enterprise }
       └── { label: "Startups",   page_reference → /solutions/startups  }
```

Each item can link to either an **internal page** (via reference) or an **external URL**. The frontend resolves the page reference to get the URL slug — so when an editor renames a page URL, the nav updates automatically.

#### 3. `Testimonial` — Reusable content

Stored separately from pages so the same quote can appear on multiple pages without duplication. When an editor updates a testimonial, every page that references it gets the new text on next revalidation.

#### 4. `Site Settings` — Global chrome

A singleton for logo, company name, footer text, and social links. References the Navigation entry so the layout can fetch everything with one API call. Keeps global site configuration out of individual page entries.

---

## Navigation Hierarchy

### How it's stored

The Navigation entry contains an ordered array of `nav_items`. Each item has:

- **`label`** — display text
- **`page_reference`** — optional reference to a Page entry (resolved by the SDK to include the page's `url` field)
- **`external_url`** — optional link field for external destinations
- **`children[]`** — optional nested array with the same shape (second level only)

### How it's resolved on the frontend

```
1. Layout fetches Navigation entry with .includeReference()
   → page references are resolved to full Page objects
   → each child's page_reference[0].url gives us the href

2. Navigation component iterates nav_items:
   → If page_reference exists → use page.url as href
   → If external_url exists → use href, add target="_blank"
   → If neither exists → render as "#" (dropdown parent only)
   → If children[] is non-empty → render dropdown submenu

3. Mobile: same data, collapsed into accordion-style list
```

### Why not a tree of Page references?

A dedicated Navigation content type gives editors explicit control over menu order, labels, and grouping independently of the page structure. Deriving navigation purely from page hierarchy forces a 1:1 mapping between information architecture and URL structure — which breaks down quickly on real marketing sites.

---

## Frontend Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Fill in your Contentstack credentials
```

### 3. Run development server

```bash
npm run dev
```

### SDK Architecture

```
.env.local
    │
    ▼
contentstack-client.ts    ← validates env vars, creates SDK instance
    │
    ▼
api.ts                    ← typed query functions (getPageByUrl, getNavigation, etc.)
    │
    ▼
layout.tsx / page.tsx     ← Server Components call api.ts functions
    │
    ▼
SectionRenderer.tsx       ← maps modular blocks to React components
```

**Key design decisions:**

- **SDK client is a singleton** — created once, imported by api.ts
- **api.ts is the only file that touches the SDK** — components never import Contentstack directly
- **All functions return typed data** — the types in `contentstack.ts` mirror the CMS schemas
- **Error handling is centralized** — SDK errors are caught in api.ts and returned as `null`

---

## Rendering Flow

### What happens when a user visits `/solutions/enterprise`:

```
1. Next.js matches the catch-all route: src/app/[...slug]/page.tsx

2. params.slug = ["solutions", "enterprise"]
   → joined to url = "/solutions/enterprise"

3. getPageByUrl("/solutions/enterprise") calls:
   stack.contentType("page")
     .entry().query()
     .where("url", "/solutions/enterprise")
     .includeReference(["sections.testimonials.testimonial_entries"])
     .findOne()

4. Contentstack returns the Page entry with resolved testimonials

5. <SectionRenderer sections={page.sections} /> iterates the
   modular blocks array:
     sections[0] → { hero: {...} }         → <HeroSection />
     sections[1] → { feature_grid: {...} } → <FeatureGridSection />
     sections[2] → { cta_banner: {...} }   → <CtaBannerSection />

6. Each section component receives typed props and renders
   standard HTML with Tailwind CSS classes

7. The root layout.tsx wraps everything with <Navigation /> and
   <Footer />, fetched from getLayoutData() in parallel
```

### Static generation

At build time, `generateStaticParams()` calls `getAllPageUrls()` to get every page URL from the CMS. Each URL is pre-rendered as a static HTML file. After deployment, ISR revalidates pages every 60 seconds — so content changes appear within a minute without a full rebuild.

---

## Editor Workflow

### Creating a new page

1. **In Contentstack →** Create a new entry of type "Page"
2. **Set the URL** — e.g. `/resources/case-studies`
3. **Add sections** — click "Add Block" and choose from Hero, Feature Grid, CTA Banner, etc.
4. **Reorder sections** — drag to rearrange
5. **Publish** — the page goes live on next ISR revalidation (≤60s)

No developer involvement required. No PR. No deploy.

### Adding a page to the navigation

1. **In Contentstack →** Open the "Main Navigation" entry
2. **Add a nav item** — set label, pick the page reference
3. **For nested items** — add children under an existing parent
4. **Publish** — the menu updates site-wide

### Updating a testimonial

1. **In Contentstack →** Edit the Testimonial entry
2. **Change the quote text**
3. **Publish** — every page that references this testimonial shows the updated text

### Editor guardrails

| Guardrail | How it works |
|---|---|
| Required fields | `title`, `url`, `headline` are mandatory — editors can't publish incomplete entries |
| Unique URLs | The `url` field has a uniqueness constraint — no duplicate routes |
| Content types, not freeform | Editors compose from predefined section types — they can't break the layout |
| Reference integrity | Deleting a testimonial shows a warning if it's referenced by pages |
| Workflow approval | (Optional) Enable Contentstack Workflows to require reviewer sign-off before publish |

---

## Scalability & Best Practices

### Content modeling

- **Add new section types** by defining a new block in the Page schema + a new React component. No changes to existing sections or routing.
- **Add new page types** (e.g. Blog Post, Case Study) by creating a new content type with its own URL pattern and a dedicated `[...slug]` handler or a separate route.
- **Localization** — Contentstack has built-in locale support. Add locales to your stack and publish locale-specific entries. The API layer passes locale as a query parameter.

### Performance

- **ISR** — static generation with incremental revalidation gives CDN-speed page loads with near-real-time content freshness.
- **Parallel data fetching** — `getLayoutData()` fetches settings and navigation concurrently.
- **Selective reference inclusion** — only resolve the references each page actually needs (testimonials for pages that use them, not for every query).

### Developer vs. editor responsibilities

| Concern | Owner |
|---|---|
| Content type schemas | Developer (defines structure in Contentstack) |
| Section components | Developer (builds React components) |
| Page content | Editor (creates/edits entries) |
| Navigation structure | Editor (manages nav items) |
| URL structure | Editor (sets URL field per page) |
| SEO metadata | Editor (fills in meta title/description per page) |
| Global branding | Editor (updates Site Settings) |
| New section types | Developer (schema + component) → Editor uses immediately |

### What to add for production

- **Preview mode** — Contentstack's Live Preview SDK for real-time editing
- **Webhooks** — trigger Next.js on-demand revalidation on publish events (instead of polling every 60s)
- **Error boundaries** — wrap SectionRenderer in React error boundaries so a broken section doesn't crash the whole page
- **Analytics** — add data attributes or event tracking per section type
- **Image optimization** — use Contentstack's Image Delivery API query parameters for responsive sizes and format conversion
- **Sitemap generation** — use `getAllPageUrls()` to build a dynamic sitemap.xml
- **Testing** — snapshot tests for section components, integration tests for api.ts with mocked SDK responses
