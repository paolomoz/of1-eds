/**
 * of1 header — loads nav.plain.html, highlights the active link.
 *
 * Deliberately simple: no dropdowns, no hamburger, no fragment framework.
 * The nav is a flat list of 4 links styled by page CSS (.site-header / .site-nav).
 */

function normalizePath(p) {
  if (!p) return '/';
  try {
    const url = new URL(p, window.location.origin);
    let path = url.pathname.replace(/\.html$/, '');
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path || '/';
  } catch {
    return p;
  }
}

export default async function decorate(block) {
  const res = await fetch(`${window.hlx.codeBasePath}/nav.plain.html`);
  if (!res.ok) return;
  const html = await res.text();

  // Use the <header> element itself as the visible container — gives us .site-header styling.
  const header = block.closest('header') || block;
  header.classList.add('site-header');
  block.remove();

  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  while (wrap.firstChild) header.append(wrap.firstChild);

  // Highlight the active link (exact path match, ignoring trailing slash + .html).
  const here = normalizePath(window.location.pathname);
  header.querySelectorAll('nav.site-nav a').forEach((a) => {
    if (normalizePath(a.getAttribute('href')) === here) a.classList.add('active');
  });
}
