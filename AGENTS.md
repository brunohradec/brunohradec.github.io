# AGENTS.md

Static personal portfolio site (brunohradec.me). Vanilla HTML/CSS/JS only, no build system, no package manager, no dependencies, no tests, no CI.

## Commands

- No dev server, build, lint, or test commands exist. Open `index.html`) to view locally.
- Formatting is Prettier with `.prettierrc` (`tabWidth: 4`). Match the existing 4-space indentation.
- Deployment is automatic: pushing to `main` publishes to GitHub Pages.

## Layout

- `index.html` - all page content (header, about, skills, projects, contact) plus SEO/OG tags and a JSON-LD `Person` schema. Content edits happen here.
- `style.css` - all styling. Uses CSS custom properties as design tokens. Fonts come from Google Fonts.

## Gotchas

- `CNAME` (→ brunohradec.me), `BingSiteAuth.xml`, and the `google-site-verification` meta tag (`index.html:48`) are required for hosting/verification. Never remove them.
