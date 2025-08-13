// Global utilities and UI behavior for ClauseWise

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sidebar toggle (mobile)
  const navToggle = $('.nav-toggle');
  const navLinks = $('#sidebar-nav');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Smooth scroll for internal links
  $$('a[data-scroll]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = $(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Reveal on scroll animation
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // Home page: upload handling and feature navigation
  const uploadInput = $('#document');
  const postUpload = $('#post-upload');
  if (uploadInput) {
    uploadInput.addEventListener('change', () => {
      const file = uploadInput.files && uploadInput.files[0];
      if (!file) return;
      // Store filename in sessionStorage for display across pages
      sessionStorage.setItem('clausewise:filename', file.name);
      if (postUpload) postUpload.classList.remove('hidden');
    });
  }

  // Feature buttons from home
  $$('.feature-buttons .btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const feature = btn.getAttribute('data-feature');
      if (!feature) return;
      e.preventDefault();
      const route = {
        simplify: 'simplify.html',
        extract_entities: 'extract_entities.html',
        classify: 'classify.html',
        qa: 'qa.html',
      }[feature];
      if (route) window.location.href = route;
    });
  });

  // Feature cards on homepage
  $$('.card[data-nav]').forEach((card) => {
    const go = () => {
      const path = card.getAttribute('data-nav');
      if (path) window.location.href = path;
    };
    card.addEventListener('click', go);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  // Feature pages: show filename and allow re-upload
  const featureFileName = $('#current-file-name');
  const featureFileInput = $('#feature-document');
  if (featureFileName) {
    const name = sessionStorage.getItem('clausewise:filename');
    featureFileName.textContent = name || 'None selected';
  }
  if (featureFileInput) {
    featureFileInput.addEventListener('change', () => {
      const file = featureFileInput.files && featureFileInput.files[0];
      if (!file) return;
      sessionStorage.setItem('clausewise:filename', file.name);
      if (featureFileName) featureFileName.textContent = file.name;
    });
  }

  // Placeholder functions (no backend):
  function showToast(message) {
    // Simple, non-intrusive alert replacement
    console.log('[ClauseWise]', message);
  }

  // Simplify
  const runSimplifyBtn = $('#btn-run-simplify');
  const clearSimplifyBtn = $('#btn-clear-simplify');
  const originalClauses = $('#original-clauses');
  const simplifiedClauses = $('#simplified-clauses');
  if (runSimplifyBtn && originalClauses && simplifiedClauses) {
    runSimplifyBtn.addEventListener('click', () => {
      const source = originalClauses.value.trim();
      if (!source) { showToast('Please enter or paste clauses to simplify.'); return; }
      // Mock simplification: replace legalese with simpler words
      const mock = source
        .replace(/hereinafter/gi, 'from now on')
        .replace(/aforementioned/gi, 'mentioned above')
        .replace(/pursuant to/gi, 'under')
        .replace(/in the event that/gi, 'if')
        .replace(/notwithstanding/gi, 'despite');
      simplifiedClauses.value = mock;
    });
  }
  if (clearSimplifyBtn && originalClauses && simplifiedClauses) {
    clearSimplifyBtn.addEventListener('click', () => {
      originalClauses.value = '';
      simplifiedClauses.value = '';
    });
  }

  // Entities
  const runEntitiesBtn = $('#btn-run-entities');
  const clearEntitiesBtn = $('#btn-clear-entities');
  const entitiesTbody = $('#entities-table-body');
  if (runEntitiesBtn && entitiesTbody) {
    runEntitiesBtn.addEventListener('click', () => {
      // Mock entities
      const sample = [
        { text: 'Acme Corp', type: 'Party', score: 0.98 },
        { text: '2025-01-01', type: 'Date', score: 0.93 },
        { text: '$50,000', type: 'Amount', score: 0.9 },
      ];
      entitiesTbody.innerHTML = sample.map((e) => `
        <tr>
          <td>${e.text}</td>
          <td>${e.type}</td>
          <td>${(e.score * 100).toFixed(1)}%</td>
        </tr>
      `).join('');
    });
  }
  if (clearEntitiesBtn && entitiesTbody) {
    clearEntitiesBtn.addEventListener('click', () => {
      entitiesTbody.innerHTML = '<tr><td colspan="3" class="muted">No entities extracted yet.</td></tr>';
    });
  }

  // Classification
  const runClassifyBtn = $('#btn-run-classify');
  const clearClassifyBtn = $('#btn-clear-classify');
  const classificationResults = $('#classification-results');
  if (runClassifyBtn && classificationResults) {
    runClassifyBtn.addEventListener('click', () => {
      const classes = [
        { label: 'Non-Disclosure Agreement', score: 0.87 },
        { label: 'Master Service Agreement', score: 0.73 },
        { label: 'Employment Contract', score: 0.41 },
      ];
      classificationResults.innerHTML = classes.map((c) => `
        <article class="card">
          <h3 class="card-title">${c.label}</h3>
          <p class="card-desc">Confidence: ${(c.score * 100).toFixed(1)}%</p>
        </article>
      `).join('');
    });
  }
  if (clearClassifyBtn && classificationResults) {
    clearClassifyBtn.addEventListener('click', () => {
      classificationResults.innerHTML = `
        <article class="card muted">
          <h3 class="card-title">No results</h3>
          <p class="card-desc">Run classification to see predicted document types.</p>
        </article>`;
    });
  }

  // Q&A
  const askBtn = $('#btn-ask');
  const questionInput = $('#qa-question');
  const answers = $('#qa-answers');
  if (askBtn && questionInput && answers) {
    askBtn.addEventListener('click', () => {
      const q = questionInput.value.trim();
      if (!q) { showToast('Please enter a question.'); return; }
      const answer = `Placeholder answer for: "${q}"`;
      const item = document.createElement('div');
      item.className = 'card';
      item.innerHTML = `<strong>Q:</strong> ${q}<br/><span class="muted">A:</span> ${answer}`;
      if (answers.firstElementChild && answers.firstElementChild.classList.contains('muted')) {
        answers.firstElementChild.remove();
      }
      answers.prepend(item);
      questionInput.value = '';
      questionInput.focus();
    });
  }
})();