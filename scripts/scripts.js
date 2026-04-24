import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Bespoke-page mode for of1.
 *
 * We deliberately skip buildAutoBlocks and decorateButtons — they would mutate
 * the hand-authored markup and break pixel-perfect fidelity. decorateSections
 * and decorateBlocks stay on so our `.interest-modal` marker gets mounted.
 */

/** Derive page slug from URL. `/` → `landing`, `/why` → `why`, `/foo.html` → `foo`. */
function pageSlug() {
  const p = window.location.pathname;
  if (p === '/' || p === '' || p === '/index.html' || p === '/index') return 'landing';
  return p.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
}

/**
 * Decorates the main element — no auto-blocking, no button decoration.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 *
 * Unlike the boilerplate, we load the page-specific stylesheet AND the header
 * eagerly. The page CSS carries hero/section layout; the header is `position:
 * fixed` with backdrop-blur and must be in the DOM before first paint.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  const slug = pageSlug();
  document.body.dataset.page = slug;

  // Page-specific CSS is critical for LCP — wait for it before revealing body.
  const pageCss = loadCSS(`${window.hlx.codeBasePath}/styles/page-${slug}.css`)
    .catch(() => { /* page CSS is optional */ });

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await pageCss;
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  // Fixed header with backdrop-blur needs to be present on first paint.
  const header = doc.querySelector('header');
  if (header) loadHeader(header);
}

/**
 * Loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);

  // Optional per-page JS (e.g. the premise-mock + pipeline animations on how-it-works).
  const slug = document.body.dataset.page;
  if (slug) {
    import(`${window.hlx.codeBasePath}/scripts/page-${slug}.js`).catch(() => {
      /* page JS is optional */
    });
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
