// Popup Feed logic with simulated infinite loading
(() => {
  const openBtn = document.getElementById('open-feed-btn');
  const overlay = document.getElementById('feed-overlay');
  const closeBtn = document.getElementById('close-feed-btn');
  const feed = document.getElementById('feed');
  const loader = document.getElementById('feed-loader');
  const loadMoreBtn = document.getElementById('load-more-btn');

  let page = 0;
  const PAGE_SIZE = 12;
  let loading = false;
  let reachedEnd = false;

  function openPopup() {
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll
    feed.focus();
    if (feed.children.length === 0) {
      loadNextPage();
    }
  }

  function closePopup() {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // restore
  }

  function makeItem(i) {
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.setAttribute('role', 'listitem');

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = String.fromCharCode(65 + (i % 26));

    const body = document.createElement('div');
    body.className = 'item-body';

    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = `User ${1000 + i} did something`;

    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.textContent = `${Math.max(1, (i % 24))}h ago • automated`;

    const text = document.createElement('div');
    text.className = 'item-text';
    text.textContent = `This is a sample feed item number ${i}. You can scroll to load more items automatically or click "Load more".`;

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(text);

    item.appendChild(avatar);
    item.appendChild(body);

    return item;
  }

  function simulateFetch(pageNum) {
    // simulate a network fetch with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Stop after 6 pages for demo
        if (pageNum >= 6) {
          resolve({ items: [], end: true });
          return;
        }
        const items = [];
        const start = pageNum * PAGE_SIZE;
        for (let i = start; i < start + PAGE_SIZE; i++) items.push({ id: i });
        resolve({ items, end: false });
      }, 600 + Math.random() * 600);
    });
  }

  async function loadNextPage() {
    if (loading || reachedEnd) return;
    loading = true;
    loader.classList.remove('hidden');
    const currentPage = page;
    try {
      const resp = await simulateFetch(currentPage);
      if (resp.items.length === 0) {
        reachedEnd = true;
        loadMoreBtn.disabled = true;
      } else {
        resp.items.forEach((it) => {
          const el = makeItem(it.id);
          feed.appendChild(el);
        });
        page += 1;
      }
    } finally {
      loading = false;
      loader.classList.add('hidden');
    }
  }

  // Infinite scroll: load more when near bottom
  feed.addEventListener('scroll', () => {
    const nearBottom = feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 120;
    if (nearBottom) loadNextPage();
  });

  openBtn.addEventListener('click', openPopup);
  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup(); // click outside popup closes
  });

  // keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') {
      closePopup();
    }
  });

  loadMoreBtn.addEventListener('click', loadNextPage);

  // initial accessible focus handling: keep focus inside popup when open
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      // very small focus-trap: ensure focus stays on popup elements
      const focusable = overlay.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
