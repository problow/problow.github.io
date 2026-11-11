/* Pro Blow | Static site behavior. Built from the BootstrapMade Visible project. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const navToggle = $('#nav-toggle');
  const nav = $('#site-nav');

  function closeNav() {
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
  }
  navToggle?.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });
  document.addEventListener('click', (event) => {
    if (document.body.classList.contains('nav-open') && !event.target.closest('#header')) closeNav();
  });

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Missing future assets display a branded CSS placeholder instead of a broken image.
  function handleImage(img) {
    const markMissing = () => img.closest('.media-frame')?.classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
    img.addEventListener('load', () => img.closest('.media-frame')?.classList.remove('is-missing'));
  }
  document.querySelectorAll('.media-frame .media-image').forEach(handleImage);

  // The lookbook displays fictional campaign art, never fabricated release pages.
  const dialog = $('#image-dialog');
  const dialogImage = $('#dialog-image');
  const dialogCaption = $('#dialog-caption');
  $('.dialog-close')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.querySelectorAll('.look-card').forEach(button => {
    button.addEventListener('click', () => {
      const image = $('.media-image', button);
      if (!dialog || !dialogImage || !image || !image.naturalWidth) return;
      dialogImage.src = button.dataset.image;
      dialogImage.alt = image.alt;
      if (dialogCaption) dialogCaption.textContent = `${button.dataset.caption} · Concept photograph`;
      dialog.showModal();
    });
  });

  /*
   * REAL RELEASE CATALOG
   * Leave the array empty until an actual preview or paid release is available.
   * Add entries once the destinations are confirmed. Each poster lives directly in img/.
   * Example shape (illustration only, not an actual release):
   * { title: 'Release title', image: 'img/release-01.png',
   *   description: 'One-sentence teaser',
   *   previewUrl: 'https://actual-preview-link', premiumUrl: 'https://actual-paid-link' }
   * A preview/premium button appears only if its URL is a valid HTTPS address.
   */
  const releases = [
  ];

  function verifiedHttps(url) {
    if (typeof url !== 'string') return null;
    try { const parsed = new URL(url); return parsed.protocol === 'https:' ? parsed.href : null; }
    catch { return null; }
  }
  function appendText(parent, element, className, content) {
    const node = document.createElement(element);
    if (className) node.className = className;
    node.textContent = content;
    parent.append(node);
    return node;
  }
  function appendReleaseLink(parent, label, url, eventName) {
    const verified = verifiedHttps(url);
    if (!verified) return;
    const a = appendText(parent, 'a', '', `${label} ↗`);
    a.href = verified;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.dataset.track = eventName;
  }
  function renderReleases() {
    const grid = $('#release-grid');
    const live = $('#release-live');
    const coming = $('#release-coming');
    if (!grid || !live || !coming) return;
    let count = 0;
    for (const [index, release] of releases.entries()) {
      if (!release || !release.title || (!verifiedHttps(release.previewUrl) && !verifiedHttps(release.premiumUrl))) continue;
      const column = document.createElement('div');
      column.className = 'col-md-6 col-lg-4';
      const card = appendText(column, 'article', 'release-card', '');
      const media = appendText(card, 'div', 'media-frame release-image', '');
      const img = document.createElement('img');
      img.className = 'media-image';
      img.src = /^img\/[\w.-]+\.png$/.test(release.image || '') ? release.image : 'img/release-01.png';
      img.alt = `Poster for ${release.title}`;
      img.loading = 'lazy';
      media.append(img);
      const content = appendText(card, 'div', 'release-content', '');
      appendText(content, 'h3', '', release.title);
      if (release.description) appendText(content, 'p', '', release.description);
      const links = appendText(content, 'div', 'release-links', '');
      appendReleaseLink(links, 'Watch Preview', release.previewUrl, `release_${index + 1}_preview`);
      appendReleaseLink(links, 'Full Release', release.premiumUrl, `release_${index + 1}_premium`);
      grid.append(column);
      handleImage(img);
      count++;
    }
    if (count > 0) {
      live.hidden = false;
      coming.hidden = true;
      // Keep the nav target visible, and expose the real catalog heading.
      $('#drops-title')?.removeAttribute('id');
      $('.release-head h2')?.setAttribute('id', 'drops-title');
    }
  }
  renderReleases();

  // GA4 runs only on the public production domain, not local preview/staging.
  const productionHosts = new Set(['theproblow.com', 'www.theproblow.com']);
  if (productionHosts.has(window.location.hostname)) {
    const id = 'G-HFRFP8CHF0';
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);
    document.addEventListener('click', event => {
      const link = event.target.closest('a[data-track]');
      if (!link) return;
      window.gtag('event', 'outbound_click', { destination: link.dataset.track });
    });
  }
})();
