/**
 * Interest modal — lead-capture form that appears on all marketing pages.
 *
 * Authoring: include `<div class="interest-modal"></div>` somewhere in the
 * page, and any element with `[data-open-interest]` will open the modal.
 * Submits to /interest (Cloudflare Pages Function) which stores to D1.
 */

const MODAL_HTML = `
  <div class="interest-backdrop" role="dialog" aria-modal="true" aria-labelledby="interestTitle">
    <div class="interest-modal">
      <button class="interest-close" aria-label="Close">&#x2715;</button>
      <div class="interest-form-wrap">
        <h2 id="interestTitle">Register your<br><em>interest</em></h2>
        <p class="interest-sub">We'll reach out directly. No pitch decks, no drip campaigns.</p>
        <form class="interest-form" novalidate>
          <div class="interest-field">
            <label for="iName">Name</label>
            <input type="text" id="iName" name="name" placeholder="Your name" required autocomplete="name">
          </div>
          <div class="interest-field">
            <label for="iEmail">Email</label>
            <input type="email" id="iEmail" name="email" placeholder="you@company.com" required autocomplete="email">
          </div>
          <div class="interest-field">
            <label for="iMessage">What are you working on?</label>
            <textarea id="iMessage" name="message" placeholder="Tell us about your use case, website, or what problem you're trying to solve…"></textarea>
          </div>
          <div class="interest-error"></div>
          <button type="submit" class="interest-submit">Send &rarr;</button>
        </form>
      </div>
      <div class="interest-success">
        <h3>We'll be<br>in touch.</h3>
        <p>Thanks for registering your interest.<br>Expect a direct message from our team.</p>
      </div>
    </div>
  </div>
`;

function open(backdrop) {
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => backdrop.querySelector('#iName')?.focus(), 50);
}

function close(backdrop) {
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

async function submit(event, backdrop) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('.interest-submit');
  const err = form.querySelector('.interest-error');
  err.textContent = '';
  err.classList.remove('visible');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    const res = await fetch('/interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.querySelector('#iName').value,
        email: form.querySelector('#iEmail').value,
        message: form.querySelector('#iMessage').value,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      backdrop.querySelector('.interest-form-wrap').style.display = 'none';
      backdrop.querySelector('.interest-success').classList.add('visible');
    } else {
      err.textContent = data.error || 'Something went wrong. Please try again.';
      err.classList.add('visible');
      btn.disabled = false;
      btn.textContent = 'Send →';
    }
  } catch {
    err.textContent = 'Network error. Please try again.';
    err.classList.add('visible');
    btn.disabled = false;
    btn.textContent = 'Send →';
  }
}

export default async function decorate(block) {
  // Remove the placeholder marker from content flow.
  block.remove();

  // Mount modal at body level so it escapes any stacking context.
  const wrap = document.createElement('div');
  wrap.innerHTML = MODAL_HTML.trim();
  const backdrop = wrap.firstChild;
  document.body.append(backdrop);

  // Wire open triggers (any [data-open-interest]).
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-interest]')) open(backdrop);
  });

  // Close on X, backdrop click, Escape.
  backdrop.querySelector('.interest-close').addEventListener('click', () => close(backdrop));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(backdrop); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(backdrop); });

  // Submit.
  backdrop.querySelector('.interest-form').addEventListener('submit', (e) => submit(e, backdrop));
}
