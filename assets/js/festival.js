(() => {
  // Navigation gets a solid background once the page is scrolled.
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Countdown to the event start.
  const countdown = document.querySelector('[data-countdown]');
  if (countdown) {
    const start = new Date(countdown.dataset.start).getTime();
    const unit = (u) => countdown.querySelector(`[data-unit="${u}"]`);
    const els = { d: unit('d'), h: unit('h'), m: unit('m'), s: unit('s') };
    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      const left = Math.floor((start - Date.now()) / 1000);
      if (left <= 0) {
        const live = document.createElement('p');
        live.className = 'status';
        live.innerHTML = '<span class="status__dot" aria-hidden="true"></span>';
        live.append(countdown.dataset.live);
        countdown.replaceWith(live);
        return false;
      }
      els.d.textContent = Math.floor(left / 86400);
      els.h.textContent = pad(Math.floor(left / 3600) % 24);
      els.m.textContent = pad(Math.floor(left / 60) % 60);
      els.s.textContent = pad(left % 60);
      return true;
    };

    if (tick()) {
      const timer = setInterval(() => {
        if (!tick()) clearInterval(timer);
      }, 1000);
    }
  }

  // Fade sections in as they scroll into view.
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // Lightbox for the photo grid. Without JS the links simply open the full image.
  const dialog = document.querySelector('.lightbox');
  const items = [...document.querySelectorAll('.gallery__item')];
  if (dialog && items.length && typeof dialog.showModal === 'function') {
    const img = dialog.querySelector('.lightbox__img');
    const stage = dialog.querySelector('.lightbox__stage');
    const count = dialog.querySelector('.lightbox__count');
    let current = 0;

    const at = (i) => items[(i + items.length) % items.length];
    const show = (i) => {
      current = (i + items.length) % items.length;
      img.src = at(current).href;
      img.alt = at(current).querySelector('img').alt;
      count.textContent = `${current + 1} / ${items.length}`;
      new Image().src = at(current + 1).href;
      new Image().src = at(current - 1).href;
    };

    items.forEach((item, i) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        show(i);
        dialog.showModal();
      });
    });

    dialog.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
    dialog.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));
    dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    // Swipe on touch screens; a tap on the dark area closes.
    let startX = null;
    let swiped = false;
    dialog.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      swiped = false;
    });
    dialog.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) {
        swiped = true;
        show(current + (dx < 0 ? 1 : -1));
      }
    });
    dialog.addEventListener('click', (e) => {
      if (swiped) return;
      if (e.target === dialog || e.target === stage) dialog.close();
    });

    dialog.addEventListener('close', () => {
      img.removeAttribute('src');
      items[current].focus();
    });
  }
})();
