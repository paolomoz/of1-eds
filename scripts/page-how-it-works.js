/**
 * /how-it-works — bespoke interactive devices.
 *
 * Two interactive mocks:
 * 1. premise-mock — browser cycling generic ↔ adapted content every 4s
 * 2. pipeline-mock — 3-stage animated sequence (scan → reason → compose)
 *    with live timer, triggered when scrolled into view.
 *
 * Ported verbatim from source inline <script>.
 */

(function() {
  // --- PREMISE MOCK: page adapts to visitor ---
  const premiseMock = document.getElementById('premise-mock');
  if (!premiseMock) return;

  const generic = {
    headline: 'Grow your business with our platform',
    subline: 'The all-in-one solution for teams of every size.',
    case: 'Fortune 500 Retail',
    pricing: 'Enterprise',
    guide: 'Implementation playbook',
    cta: 'Get started',
  };
  const adapted = {
    headline: 'Scale your SaaS from Series A to B',
    subline: 'Built for startup teams shipping fast on lean budgets.',
    case: 'Series A SaaS — 40% faster onboarding',
    pricing: 'Startup',
    guide: 'SaaS quickstart',
    cta: 'Start free trial',
  };

  function setPremisePhase(phase) {
    const data = phase === 'adapted' ? adapted : generic;
    premiseMock.dataset.phase = phase;
    document.getElementById('premise-headline').textContent = data.headline;
    document.getElementById('premise-subline').textContent = data.subline;
    document.getElementById('premise-case').textContent = data.case;
    document.getElementById('premise-pricing').textContent = data.pricing;
    document.getElementById('premise-guide').textContent = data.guide;
    document.getElementById('premise-cta').textContent = data.cta;

    const cards = [
      document.getElementById('premise-card-1'),
      document.getElementById('premise-card-2'),
      document.getElementById('premise-card-3'),
    ];
    cards.forEach((c) => {
      if (phase === 'adapted') c.classList.add('mock-card-highlight');
      else c.classList.remove('mock-card-highlight');
    });
  }

  let premisePhase = 'generic';
  setInterval(() => {
    premisePhase = premisePhase === 'generic' ? 'adapted' : 'generic';
    setPremisePhase(premisePhase);
  }, 4000);

  // --- PIPELINE MOCK: 3-stage animated sequence ---
  const pipelineMock = document.getElementById('pipeline-mock');
  if (!pipelineMock) return;

  const timer = document.getElementById('pipeline-timer');
  const pips = [
    document.getElementById('pip-1'),
    document.getElementById('pip-2'),
    document.getElementById('pip-3'),
  ];
  const scanLines = document.querySelectorAll('#scan-area .mock-scan-line');
  const blocks = [
    document.getElementById('block-1'),
    document.getElementById('block-2'),
    document.getElementById('block-3'),
    document.getElementById('block-4'),
  ];
  const composedLabel = document.getElementById('composed-label');

  function resetPipeline() {
    pips.forEach((p) => { p.classList.remove('active', 'done'); });
    scanLines.forEach((l) => l.classList.remove('scanned'));
    blocks.forEach((b) => { b.classList.remove('reasoning', 'composed'); });
    composedLabel.classList.remove('visible');
    timer.textContent = '0.0s';
  }

  function runPipeline() {
    resetPipeline();
    let t = 0;
    const tick = setInterval(() => {
      t += 0.1;
      timer.textContent = `${t.toFixed(1)}s`;
      if (t >= 2.5) clearInterval(tick);
    }, 100);

    // Stage 1: Understand (0–0.8s)
    pips[0].classList.add('active');
    scanLines.forEach((line, i) => {
      setTimeout(() => line.classList.add('scanned'), 150 * (i + 1));
    });

    // Stage 2: Reason (0.8–1.6s)
    setTimeout(() => {
      pips[0].classList.remove('active');
      pips[0].classList.add('done');
      pips[1].classList.add('active');
      blocks.forEach((b, i) => {
        setTimeout(() => b.classList.add('reasoning'), 150 * i);
      });
    }, 800);

    // Stage 3: Compose (1.6–2.5s)
    setTimeout(() => {
      pips[1].classList.remove('active');
      pips[1].classList.add('done');
      pips[2].classList.add('active');
      blocks.forEach((b, i) => {
        setTimeout(() => {
          b.classList.remove('reasoning');
          b.classList.add('composed');
        }, 150 * i);
      });
    }, 1600);

    // Done
    setTimeout(() => {
      pips[2].classList.remove('active');
      pips[2].classList.add('done');
      composedLabel.classList.add('visible');
    }, 2500);

    // Restart
    setTimeout(runPipeline, 5500);
  }

  // Start when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runPipeline();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(pipelineMock);
}());
