(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Envelope gate ---------------- */
  const gate = document.getElementById('envelope-gate');
  const sealBtn = document.getElementById('seal-btn');
  const musicBtn = document.getElementById('music-btn');
  let envelopeOpened = false;
  let musicContext;
  let musicGain;
  let musicTimer;
  let musicStep = 0;
  let musicPlaying = false;

  const melody = [
    [261.63, 329.63, 392.00],
    [293.66, 349.23, 440.00],
    [329.63, 392.00, 493.88],
    [293.66, 369.99, 440.00],
    [261.63, 329.63, 392.00],
    [246.94, 329.63, 392.00],
    [220.00, 293.66, 369.99],
    [246.94, 329.63, 392.00]
  ];

  function updateMusicButton() {
    musicBtn.setAttribute('aria-pressed', musicPlaying.toString());
    musicBtn.classList.toggle('playing', musicPlaying);
    musicBtn.setAttribute('aria-label', musicPlaying ? 'Turn background music off' : 'Turn background music on');
    musicBtn.querySelector('svg').innerHTML = musicPlaying
      ? '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'
      : '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>';
  }

  function playMusicNote() {
    if (!musicContext || musicContext.state !== 'running') return;
    const now = musicContext.currentTime;
    const notes = melody[musicStep % melody.length];
    notes.forEach((frequency, index) => {
      const oscillator = musicContext.createOscillator();
      const gain = musicContext.createGain();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.055 : 0.025, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
      oscillator.connect(gain).connect(musicGain);
      oscillator.start(now);
      oscillator.stop(now + 1.5);
    });
    musicStep++;
  }

  async function setMusicPlaying(shouldPlay) {
    if (shouldPlay) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is not supported');
      musicContext ??= new AudioContextClass();
      musicGain ??= musicContext.createGain();
      musicGain.connect(musicContext.destination);
      await musicContext.resume();
      if (!musicPlaying) {
        musicPlaying = true;
        playMusicNote();
        musicTimer = setInterval(playMusicNote, 1500);
      }
    } else if (musicContext) {
      musicPlaying = false;
      clearInterval(musicTimer);
      musicTimer = null;
      await musicContext.suspend();
    }
    updateMusicButton();
  }

  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    gate.classList.add('hidden');
    document.body.classList.remove('locked');
    setMusicPlaying(true).catch(() => updateMusicButton());
    setTimeout(() => { gate.style.display = 'none'; }, 750);
    window.scrollTo({ top: 0 });
  }
  sealBtn.addEventListener('click', openEnvelope);
  sealBtn.addEventListener('pointerup', openEnvelope);
  sealBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); } });

  /* ---------------- Petals ---------------- */
  const petalField = document.getElementById('petal-field');
  if (!reduceMotion) {
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      p.style.animationDuration = (10 + Math.random() * 10) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      p.style.width = p.style.height = (8 + Math.random() * 8) + 'px';
      petalField.appendChild(p);
    }
  }

  /* ---------------- Music toggle ---------------- */
  musicBtn.addEventListener('click', () => {
    setMusicPlaying(!musicPlaying).catch(() => updateMusicButton());
  });
  updateMusicButton();

  /* ---------------- Date reveal: heart scratch cards ---------------- */
  const heartCards = Array.from(document.querySelectorAll('.heart-card'));
  const srDate = document.getElementById('sr-date');
  const scratchHint = document.getElementById('scratch-hint');
  let revealedCount = 0;

  function initHeart(card) {
    const canvas = card.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    let revealed = false;

    function size() {
      const rect = card.getBoundingClientRect();
      canvas.width = rect.width; canvas.height = rect.height;
      ctx.fillStyle = '#C1694A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '600 11px Cormorant Garamond, serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCRATCH', canvas.width / 2, canvas.height / 2 + 4);
    }
    size();
    window.addEventListener('resize', () => { if (!revealed) size(); });

    function markRevealed() {
      if (revealed) return;
      revealed = true; revealedCount++;
      canvas.style.transition = 'opacity 0.5s ease';
      canvas.style.opacity = '0';
      setTimeout(() => canvas.style.display = 'none', 550);
      if (revealedCount === heartCards.length) allRevealed();
    }
    function scratchAt(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
    }
    function checkCleared() {
      if (revealed) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0, sampled = 0;
      for (let i = 3; i < data.length; i += 4 * 6) { sampled++; if (data[i] === 0) cleared++; }
      if (cleared / sampled > 0.5) markRevealed();
    }
    let drawing = false;
    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    canvas.addEventListener('pointerdown', e => { drawing = true; const p = pos(e); scratchAt(p.x, p.y); });
    canvas.addEventListener('pointermove', e => { if (!drawing) return; const p = pos(e); scratchAt(p.x, p.y); checkCleared(); });
    window.addEventListener('pointerup', () => { drawing = false; checkCleared(); });

    card._reveal = markRevealed;
  }
  heartCards.forEach(initHeart);

  function allRevealed() {
    scratchHint.textContent = 'The wedding date is revealed';
    srDate.classList.add('revealed');
    startCountdown();
  }
  const revealFallbackBtn = document.getElementById('reveal-fallback-btn');
  const revealAllHearts = () => heartCards.forEach(c => c._reveal());
  revealFallbackBtn.addEventListener('click', revealAllHearts);
  revealFallbackBtn.addEventListener('pointerup', revealAllHearts);

  /* ---------------- Countdown ---------------- */
  let countdownStarted = false;
  function startCountdown() {
    if (countdownStarted) return;
    countdownStarted = true;
    const target = new Date(2026, 11, 12, 11, 0, 0).getTime();
    function tick() {
      const now = Date.now();
      let diff = Math.max(0, target - now);
      const days = Math.floor(diff / 86400000); diff -= days * 86400000;
      const hrs = Math.floor(diff / 3600000); diff -= hrs * 3600000;
      const mins = Math.floor(diff / 60000); diff -= mins * 60000;
      const secs = Math.floor(diff / 1000);
      document.getElementById('cd-days').textContent = days;
      document.getElementById('cd-hrs').textContent = String(hrs).padStart(2, '0');
      document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
      document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Gallery carousel ---------------- */
  const photos = [
    { src: 'images/meeting.jpeg', caption: 'Meeting the families' },
    { src: 'images/proposal.jpeg', caption: 'The proposal, October 2024' },
  ];
  const track = document.getElementById('carousel-track');
  const dotsHost = document.getElementById('carousel-dots');
  photos.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `<img src="${p.src}" alt="${p.caption}" loading="lazy">`;
    track.appendChild(slide);
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dotsHost.appendChild(dot);
  });
  const dots = Array.from(dotsHost.children);
  track.addEventListener('scroll', () => {
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, { passive: true });

  /* ---------------- Events ---------------- */
  const events = [
    {
      id: 'haldi', title: 'Haldi', dateLabel: '11TH DECEMBER, 2026', day: 'Friday', dd: '11', month: 'December', year: '2026', time: '7:00 pm onwards',
      venue: 'B 1/-319, SaiSamruddhi CHS, Tulinj Road, Near Sarswati School, Mahesh Park,Nallasopara East,401209', mapsQuery: 'SaiSamruddhi CHS Nallasopara East',
      gradient: 'linear-gradient(180deg, #E6A100 0%, #F5C542 55%, #D48800 100%)'
    },
    {
      id: 'ceremony', title: 'Wedding Ceremony', dateLabel: '12TH DECEMBER, 2026', day: 'Saturday', dd: '12', month: 'December', year: '2026', time: '12:30 pm',
      venue: 'Karsan Laxu Nisar Religious Place, Tulinj Road, Four Roads, Near Radha Krishna Hotel, Nalasopara(East) – 401 209', mapsQuery: 'Karsan Laxu Nisar Religious Place Nalasopara East',
      gradient: 'linear-gradient(180deg, #6FB6E0 0%, #A7D4EA 55%, #E8C98F 100%)'
    }
  ];
  const eventsList = document.getElementById('events-list');
  events.forEach(ev => {
    const block = document.createElement('div');
    block.className = 'event-block';
    block.innerHTML = `
      <div class="ev-banner" style="background:${ev.gradient}">
        <div class="glow" aria-hidden="true">${twinkleDots()}</div>
        <span class="ev-name script">${ev.title}</span>
        <span class="ev-when">${ev.day} <b>${ev.dd}</b> ${ev.month} ${ev.year}</span>
        <span class="ev-time">${ev.time}</span>
      </div>
      <p class="ev-venue">Venue: ${ev.venue}</p>
      <a class="btn-primary" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.mapsQuery)}" target="_blank" rel="noopener">View on Maps</a>
    `;
    eventsList.appendChild(block);
  });
  function twinkleDots() {
    let s = '';
    for (let i = 0; i < 14; i++) {
      const top = Math.random() * 100, left = Math.random() * 100, size = 2 + Math.random() * 3;
      s += `<span style="position:absolute; top:${top}%; left:${left}%; width:${size}px; height:${size}px; border-radius:50%; background:rgba(255,255,255,0.8); box-shadow:0 0 6px rgba(255,255,255,0.8);"></span>`;
    }
    return s;
  }

})();
