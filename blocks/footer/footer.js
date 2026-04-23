/**
 * of1 footer — loads footer.plain.html into the <footer> element.
 */

export default async function decorate(block) {
  const res = await fetch(`${window.hlx.codeBasePath}/footer.plain.html`);
  if (!res.ok) return;
  const html = await res.text();

  const footer = block.closest('footer') || block;
  footer.classList.add('site-footer');
  block.remove();

  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  while (wrap.firstChild) footer.append(wrap.firstChild);
}
