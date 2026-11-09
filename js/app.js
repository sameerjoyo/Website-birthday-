/* ==========================================================
   Fateem's Birthday — interactions
   (You normally don't need to edit this file. Edit js/content.js)
   ========================================================== */
(() => {
  "use strict";
  const C = window.CONTENT || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem("fateem:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("fateem:" + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const parseDate = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const pad = n => String(n).padStart(2, "0");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* Photo frame that shows a pretty placeholder if the file isn't there yet */
  function photo(src, alt) {
    const wrap = make("div", "photo");
    if (!src) { wrap.classList.add("empty"); return wrap; }
    const img = new Image();
    img.alt = alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = () => wrap.classList.add("empty");
    img.src = src;
    wrap.appendChild(img);
    return wrap;
  }

  /* ---------------------------------------------------------
     FX canvas: confetti & hearts
  --------------------------------------------------------- */
  const fx = (() => {
    const cv = $("#fx"), ctx = cv.getContext("2d");
    let parts = [], running = false, dpr = 1;
    const resize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    resize(); addEventListener("resize", resize);
    const colors = ["#f3a9bd", "#c94f74", "#ffd6e0", "#d4a668", "#f2d4a2", "#ffffff", "#e7849f"];
    function heart(x, y, s) {
      ctx.beginPath();
      ctx.moveTo(x, y + s / 4);
      ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
      ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * .7, x, y + s * .9);
      ctx.bezierCurveTo(x, y + s * .7, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
      ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
      ctx.fill();
    }
    function loop() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts = parts.filter(p => p.life > 0);
      for (const p of parts) {
        p.vy += p.g; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.fillStyle = p.c;
        ctx.translate(p.x * dpr, p.y * dpr); ctx.rotate(p.rot);
        if (p.t === "h") heart(0, -p.s * dpr / 2, p.s * dpr);
        else ctx.fillRect(-p.s * dpr / 2, -p.s * dpr / 4, p.s * dpr, p.s * dpr / 2);
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    function burst(x, y, n = 120, opts = {}) {
      if (reduceMotion) n = Math.min(n, 20);
      for (let i = 0; i < n; i++) {
        const a = opts.up ? (-Math.PI / 2 + (Math.random() - .5) * 1.6) : Math.random() * Math.PI * 2;
        const sp = (opts.speed || 9) * (.35 + Math.random());
        parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: opts.g ?? .22,
          s: opts.hearts ? 10 + Math.random() * 12 : 6 + Math.random() * 7,
          t: opts.hearts || Math.random() < .25 ? "h" : "r",
          c: colors[(Math.random() * colors.length) | 0],
          rot: Math.random() * 6, vr: (Math.random() - .5) * .3,
          life: 90 + Math.random() * 70
        });
      }
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    function rain(n = 80) {
      for (let i = 0; i < n; i++) setTimeout(() => burst(Math.random() * innerWidth, -10, 1, { g: .12, speed: 2 }), i * 25);
    }
    return { burst, rain };
  })();

  /* ---------------------------------------------------------
     Floating petals background
  --------------------------------------------------------- */
  (function petals() {
    const cv = $("#petals"), ctx = cv.getContext("2d");
    if (reduceMotion) return;
    let w, h, dpr, ps = [];
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr;
    };
    resize(); addEventListener("resize", resize);
    const count = innerWidth < 600 ? 16 : 28;
    const tones = ["rgba(243,169,189,.75)", "rgba(255,214,224,.85)", "rgba(231,132,159,.6)", "rgba(255,236,240,.9)"];
    for (let i = 0; i < count; i++) ps.push(newPetal(true));
    function newPetal(anywhere) {
      return {
        x: Math.random() * w, y: anywhere ? Math.random() * h : -20,
        s: 8 + Math.random() * 10, vy: .35 + Math.random() * .7, vx: -.3 + Math.random() * .6,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .02, sway: Math.random() * 100,
        c: tones[(Math.random() * tones.length) | 0]
      };
    }
    function draw(p) {
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr); ctx.rotate(p.rot);
      ctx.scale(dpr, dpr * (.6 + .4 * Math.sin(p.sway)));
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .6, 0, p.s);
      ctx.bezierCurveTo(-p.s * .7, p.s * .6, -p.s * .9, -p.s * .6, 0, -p.s);
      ctx.fill();
      ctx.restore();
    }
    let visible = true;
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) requestAnimationFrame(tick); });
    function tick() {
      if (!visible) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of ps) {
        p.sway += .02; p.x += p.vx + Math.sin(p.sway) * .4; p.y += p.vy; p.rot += p.vr;
        if (p.y > h + 20) Object.assign(p, newPetal(false));
        draw(p);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------------------------------------------------------
     Countdown helpers
  --------------------------------------------------------- */
  function nextBirthday() {
    const b = parseDate(C.birthday || "2026-12-25");
    const now = new Date();
    let target = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    const end = new Date(target); end.setDate(end.getDate() + 1);
    if (now >= end) target = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate());
    return target;
  }
  function isBirthdayToday() {
    const b = parseDate(C.birthday), n = new Date();
    return n.getMonth() === b.getMonth() && n.getDate() === b.getDate();
  }
  function renderCountdown(box, label) {
    const units = [["days", "Days"], ["hours", "Hours"], ["mins", "Mins"], ["secs", "Secs"]];
    box.innerHTML = "";
    const vals = {};
    for (const [k, l] of units) {
      const u = make("div", "unit");
      vals[k] = make("span", "val", "00");
      u.append(vals[k], make("span", "lbl", l));
      box.appendChild(u);
    }
    const tick = () => {
      if (isBirthdayToday()) {
        box.innerHTML = "";
        box.appendChild(make("p", "birthday-today", "It's your birthday today! 🎂"));
        if (label) label.textContent = "Today is all about you";
        return true;
      }
      let d = Math.max(0, nextBirthday() - new Date());
      const days = Math.floor(d / 864e5); d -= days * 864e5;
      const hours = Math.floor(d / 36e5); d -= hours * 36e5;
      const mins = Math.floor(d / 6e4); d -= mins * 6e4;
      vals.days.textContent = days; vals.hours.textContent = pad(hours);
      vals.mins.textContent = pad(mins); vals.secs.textContent = pad(Math.floor(d / 1e3));
      return false;
    };
    if (!tick()) { const id = setInterval(() => { if (tick()) clearInterval(id); }, 1000); }
  }

  /* ---------------------------------------------------------
     Lock screen (optional)
  --------------------------------------------------------- */
  const preview = /[?&]preview\b/.test(location.search);
  const birthdayDate = parseDate(C.birthday);
  if (C.lockUntilBirthday && !preview && new Date() < birthdayDate) {
    $("#intro").hidden = true;
    $("#lock").hidden = false;
    renderCountdown($("#lockCountdown"));
    // auto unlock when the moment arrives
    const id = setInterval(() => { if (new Date() >= birthdayDate) { clearInterval(id); location.reload(); } }, 1000);
    return;
  }

  /* ---------------------------------------------------------
     Music
  --------------------------------------------------------- */
  const song = $("#song"), musicBtn = $("#musicBtn");
  let musicOk = false;
  if (C.music && C.music.file) {
    song.src = C.music.file;
    song.addEventListener("canplay", () => { musicOk = true; musicBtn.hidden = false; }, { once: true });
    song.addEventListener("error", () => { musicOk = false; musicBtn.hidden = true; });
    song.addEventListener("play", () => musicBtn.classList.add("playing"));
    song.addEventListener("pause", () => musicBtn.classList.remove("playing"));
    musicBtn.setAttribute("aria-label", "Play or pause " + (C.music.title || "our song"));
  }
  musicBtn.addEventListener("click", () => { if (song.paused) song.play().catch(() => {}); else song.pause(); });
  const playSong = () => { if (song.src) { song.volume = .75; song.play().then(() => { musicBtn.hidden = false; }).catch(() => {}); } };

  /* ---------------------------------------------------------
     INTRO: blow out the candles
  --------------------------------------------------------- */
  const intro = $("#intro");
  const candles = $$(".candle", intro);
  $("#introHint").textContent = (C.intro && C.intro.hint) || "Tap the flames to blow out your candles";
  let outCount = 0, micStream = null, micRAF = 0;

  function blow(candle) {
    if (candle.classList.contains("out")) return;
    candle.classList.add("out");
    outCount++;
    if (outCount === 1) {
      $("#introTitle").textContent = "One more…";
      $("#introHint").textContent = (C.intro && C.intro.wishLine) || "Make a wish…";
    }
    if (outCount === candles.length) allOut();
  }
  candles.forEach(c => c.addEventListener("click", () => blow(c)));

  function allOut() {
    stopMic();
    intro.classList.add("dark");
    $("#introTitle").textContent = "Happy Birthday!";
    $("#introHint").textContent = "";
    $(".intro-actions").style.visibility = "hidden";
    const r = $(".candles").getBoundingClientRect();
    setTimeout(() => {
      fx.burst(r.left + r.width / 2, r.top + 20, 160, { up: true, speed: 13 });
      fx.rain(70);
    }, 450);
    $("#introAfterLine").textContent = (C.intro && C.intro.afterLine) || "";
    setTimeout(() => $("#introAfter").classList.add("show"), 1200);
  }

  // Blow detection using the microphone
  const micBtn = $("#micBtn");
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) micBtn.hidden = true;
  micBtn.addEventListener("click", async () => {
    if (micStream) { stopMic(); return; }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
      const AC = window.AudioContext || window.webkitAudioContext;
      const ac = new AC();
      const src = ac.createMediaStreamSource(micStream);
      const an = ac.createAnalyser(); an.fftSize = 512;
      src.connect(an);
      const data = new Uint8Array(an.fftSize);
      micBtn.classList.add("listening");
      micBtn.textContent = "🎤 Listening… blow now!";
      let loud = 0, cooldown = 0;
      const check = () => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / data.length);
        if (cooldown > 0) cooldown--;
        loud = rms > .14 ? loud + 1 : Math.max(0, loud - 1);
        if (loud > 6 && cooldown === 0) {
          const lit = candles.find(c => !c.classList.contains("out"));
          if (lit) blow(lit);
          // a strong blow takes both out
          if (rms > .3) candles.forEach(blow);
          loud = 0; cooldown = 25;
        }
        if (micStream) micRAF = requestAnimationFrame(check);
      };
      check();
      micStream._ac = ac;
    } catch (e) {
      micBtn.textContent = "Mic not allowed — just tap the flames 🤍";
      micStream = null;
    }
  });
  function stopMic() {
    cancelAnimationFrame(micRAF);
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      try { micStream._ac && micStream._ac.close(); } catch (e) { /* ignore */ }
    }
    micStream = null;
    micBtn.classList.remove("listening");
  }

  $("#enterBtn").addEventListener("click", () => {
    playSong();
    intro.classList.add("leaving");
    document.body.classList.remove("locked");
    document.body.classList.add("entered");
    $("#site").hidden = false;
    window.scrollTo(0, 0);
    setTimeout(() => { intro.hidden = true; }, 1300);
    setTimeout(() => fx.rain(50), 600);
    startReveal();
  });

  /* ---------------------------------------------------------
     Chapters drawer
  --------------------------------------------------------- */
  const chapters = [
    ["home", "Happy Birthday"], ["together", "Every Second With You"], ["story", "Our Story"],
    ["letter", "A Letter For You"], ["rare", "Why You're So Rare"], ["reasons", "25 Reasons"],
    ["gallery", "Us, In Pictures"], ["sky", "Our Little Sky"], ["openwhen", "Open When…"],
    ["scratch", "Scratch & Smile"], ["coupons", "Love Coupons"], ["quiz", "Our Quiz"],
    ["future", "Our Forever List"], ["wishes", "Wishes For You"], ["notes", "Little Notes"],
    ["lantern", "Send Your Wish"], ["finale", "The Last Page"]
  ];
  const drawer = $("#drawer"), menuBtn = $("#menuBtn"), list = $("#drawerList");
  chapters.forEach(([id, name]) => {
    const li = make("li"), a = make("a", "", name);
    a.href = "#" + id;
    a.addEventListener("click", () => toggleDrawer(false));
    li.appendChild(a); list.appendChild(li);
  });
  function toggleDrawer(open) {
    drawer.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  menuBtn.addEventListener("click", () => toggleDrawer(!drawer.classList.contains("open")));
  document.addEventListener("click", e => {
    if (drawer.classList.contains("open") && !drawer.contains(e.target) && !menuBtn.contains(e.target)) toggleDrawer(false);
  });

  /* ---------------------------------------------------------
     Modal
  --------------------------------------------------------- */
  const modal = $("#modal"), modalBody = $("#modalBody");
  let lastFocus = null;
  function openModal(build) {
    lastFocus = document.activeElement;
    modalBody.innerHTML = "";
    build(modalBody);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal-x", modal).focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  modal.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  const textBlock = (parent, title, text, emoji, center) => {
    if (emoji) parent.appendChild(make("div", "modal-emoji", emoji));
    const h = make("h3", "modal-title", title); h.id = "modalTitle"; parent.appendChild(h);
    String(text).split(/\n\n+/).forEach(t => parent.appendChild(make("p", "modal-text" + (center ? " center" : ""), t)));
  };

  /* ---------------------------------------------------------
     Ladybugs (secret messages)
  --------------------------------------------------------- */
  const secrets = C.ladybugSecrets || [];
  // one more hidden ladybug in the notes section
  const bug2 = make("button", "ladybug", "🐞");
  bug2.dataset.secret = "1"; bug2.setAttribute("aria-label", "A little ladybug");
  $("#notesList").after(bug2);
  bug2.style.cssText = "position:relative;display:grid;margin:28px auto 0;";
  $$(".ladybug").forEach(b => b.addEventListener("click", e => {
    const i = Number(b.dataset.secret) || 0;
    fx.burst(e.clientX, e.clientY, 24, { hearts: true, speed: 5 });
    openModal(m => textBlock(m, "A secret!", secrets[i] || secrets[0] || "I love you 🐞", "🐞", true));
  }));

  /* ---------------------------------------------------------
     HERO
  --------------------------------------------------------- */
  const H = C.hero || {};
  $("#heroEyebrow").textContent = H.eyebrow || "";
  $("#heroTitle").textContent = H.title || "Happy Birthday";
  $("#heroName").textContent = C.nickname || C.herName || "";
  $("#heroSub").textContent = H.subtitle || "";
  $("#scrollHint").textContent = H.scrollHint || "";
  renderCountdown($("#countdown"), $("#countdownLabel"));

  /* ---------------------------------------------------------
     DAYS TOGETHER
  --------------------------------------------------------- */
  (function together() {
    const grid = $("#togetherGrid");
    const start = parseDate(C.togetherSince || "2024-02-01");
    const units = [["days", "Days", true], ["hours", "Hours"], ["mins", "Minutes"], ["secs", "Seconds"], ["beats", "Heartbeats"]];
    const v = {};
    for (const [k, l, big] of units) {
      const u = make("div", "t-unit" + (big ? " big" : ""));
      v[k] = make("span", "val", "0");
      u.append(v[k], make("span", "lbl", l));
      grid.appendChild(u);
    }
    const fmt = n => n.toLocaleString("en-US");
    const tick = () => {
      const ms = Math.max(0, Date.now() - start);
      const s = Math.floor(ms / 1000);
      v.days.textContent = fmt(Math.floor(s / 86400));
      v.hours.textContent = fmt(Math.floor(s / 3600));
      v.mins.textContent = fmt(Math.floor(s / 60));
      v.secs.textContent = fmt(s);
      v.beats.textContent = fmt(Math.floor(s * 1.2)); // ~72 bpm
    };
    tick(); setInterval(tick, 1000);
  })();

  /* ---------------------------------------------------------
     OUR STORY timeline
  --------------------------------------------------------- */
  (function story() {
    const tl = $("#timeline");
    const icons = ["✨", "🤍", "🎬", "📱", "💘", "🤲", "💌", "🎂"];
    (C.story || []).forEach((s, i) => {
      const li = make("li", "tl-item reveal");
      li.appendChild(make("span", "tl-dot", icons[i % icons.length]));
      li.appendChild(make("span", "tl-date", s.date));
      const card = make("div", "tl-card");
      if (s.photo !== null) card.appendChild(photo(s.photo, s.title));
      const t = make("div", "tl-text");
      t.append(make("h3", "", s.title), make("p", "", s.text));
      card.appendChild(t);
      li.appendChild(card);
      tl.appendChild(li);
    });
  })();

  /* ---------------------------------------------------------
     LOVE LETTER (envelope + typewriter)
  --------------------------------------------------------- */
  (function letter() {
    const L = C.letter || {};
    const env = $("#envelope"), paper = $("#paper"), body = $("#letterBody"), sign = $("#letterSign");
    $("#letterGreeting").textContent = L.greeting || "";
    $("#letterSignoff").textContent = L.signoff || "";
    $("#letterSignature").textContent = L.signature || "";
    const paras = L.paragraphs || [];
    let skipping = false, started = false;

    env.addEventListener("click", () => {
      if (started) return;
      started = true;
      env.classList.add("open");
      const r = env.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 2, 40, { hearts: true, speed: 6 });
      setTimeout(() => {
        env.parentElement.style.display = "none";
        paper.hidden = false;
        paper.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        typeAll();
      }, 1500);
    });

    async function typeAll() {
      const ps = paras.map(t => { const p = make("p"); body.appendChild(p); return { p, t }; });
      for (const { p, t } of ps) {
        if (skipping || reduceMotion) { p.textContent = t; continue; }
        p.classList.add("typing");
        for (let i = 0; i <= t.length; i++) {
          if (skipping) { p.textContent = t; break; }
          p.textContent = t.slice(0, i);
          const ch = t[i - 1];
          await wait(/[.,!?—]/.test(ch) ? 140 : 22);
        }
        p.classList.remove("typing");
        await wait(skipping ? 0 : 350);
      }
      sign.classList.add("show");
      $("#skipType").hidden = true;
    }
    $("#skipType").addEventListener("click", () => { skipping = true; });
    const wait = ms => new Promise(r => setTimeout(r, ms));
  })();

  /* ---------------------------------------------------------
     WHY YOU'RE SO RARE
  --------------------------------------------------------- */
  (function rare() {
    const box = $("#rareList");
    (C.rare || []).forEach(r => {
      const it = make("article", "rare-item reveal");
      it.append(make("span", "icon", r.icon || "🤍"), make("h3", "", r.title), make("p", "", r.text));
      box.appendChild(it);
    });
  })();

  /* ---------------------------------------------------------
     25 REASONS jar
  --------------------------------------------------------- */
  (function reasons() {
    const R = C.reasons || [];
    const notes = $("#jarNotes"), card = $("#reasonCard"), num = $("#reasonNum"), text = $("#reasonText");
    const tones = ["#f3a9bd", "#ffd6e0", "#f2d4a2", "#e7849f", "#fff", "#ffc4d3"];
    const shown = Math.min(R.length, 40);
    for (let i = 0; i < shown; i++) {
      const n = make("i");
      n.style.background = tones[i % tones.length];
      n.style.transform = `rotate(${(Math.random() * 50 - 25).toFixed(0)}deg)`;
      notes.appendChild(n);
    }
    let idx = 0;
    $("#pickReason").addEventListener("click", e => {
      if (!R.length) return;
      const i = idx % R.length;
      num.textContent = `${i + 1} / ${R.length}`;
      text.textContent = R[i];
      card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop");
      const left = $$("i:not(.gone)", notes);
      if (left.length) left[left.length - 1].classList.add("gone");
      if (i === R.length - 1) {
        $("#pickReason").textContent = "Start again 💌";
        fx.burst(e.clientX, e.clientY, 60, { hearts: true, speed: 7 });
        setTimeout(() => $$("i", notes).forEach(n => n.classList.remove("gone")), 900);
      } else {
        $("#pickReason").textContent = "Pick another 💌";
      }
      idx++;
    });
    const all = $("#reasonsAll");
    R.forEach(r => all.appendChild(make("li", "", r)));
    $("#allReasons").addEventListener("click", () => {
      all.hidden = !all.hidden;
      $("#allReasons").textContent = all.hidden ? "See all" : "Hide list";
    });
  })();

  /* ---------------------------------------------------------
     GALLERY
  --------------------------------------------------------- */
  (function gallery() {
    const box = $("#polaroids");
    (C.gallery || []).forEach(g => {
      const f = make("figure", "polaroid reveal");
      f.style.margin = "0";
      f.appendChild(make("span", "tape"));
      f.appendChild(photo(g.photo, g.caption));
      if (g.caption) f.appendChild(make("figcaption", "", g.caption));
      f.tabIndex = 0;
      f.setAttribute("role", "button");
      const open = () => openModal(m => {
        const w = make("div", "modal-photo");
        w.appendChild(photo(g.photo, g.caption));
        m.appendChild(w);
        if (g.caption) { const c = make("p", "modal-caption", g.caption); c.id = "modalTitle"; m.appendChild(c); }
      });
      f.addEventListener("click", open);
      f.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
      box.appendChild(f);
    });
  })();

  /* ---------------------------------------------------------
     STAR SKY — memories that form a heart
  --------------------------------------------------------- */
  (function sky() {
    const S = C.stars || [];
    const box = $("#constellation"), svg = $("#constLines"), prog = $("#skyProgress"), done = $("#skyComplete");
    const n = S.length;
    // heart curve points
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = Math.PI + (i / n) * Math.PI * 2; // start at bottom tip
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push([50 + x * 2.6, 48 - y * 2.6]);
    }
    const seen = new Set(store.get("stars", []));
    const stars = S.map((s, i) => {
      const b = make("button", "mstar");
      b.style.left = pts[i][0] + "%"; b.style.top = pts[i][1] + "%";
      b.style.setProperty("--d", (i * .27).toFixed(2) + "s");
      b.setAttribute("aria-label", "Memory star: " + s.title);
      b.addEventListener("click", () => {
        seen.add(i); store.set("stars", [...seen]);
        update(true);
        openModal(m => textBlock(m, s.title, s.text, "⭐", true));
      });
      box.appendChild(b);
      return b;
    });
    const drawn = new Set();
    function update(animate) {
      stars.forEach((b, i) => b.classList.toggle("seen", seen.has(i)));
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const key = i + "-" + j;
        if (seen.has(i) && seen.has(j) && !drawn.has(key)) {
          drawn.add(key);
          const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
          ln.setAttribute("x1", pts[i][0]); ln.setAttribute("y1", pts[i][1]);
          ln.setAttribute("x2", pts[j][0]); ln.setAttribute("y2", pts[j][1]);
          if (!animate) ln.style.animation = "none", ln.style.strokeDashoffset = "0";
          svg.appendChild(ln);
        }
      }
      prog.textContent = seen.size >= n ? "" : `${seen.size} of ${n} memories opened`;
      if (n && seen.size >= n && !box.classList.contains("complete")) {
        box.classList.add("complete");
        done.textContent = C.starsComplete || "";
        done.classList.add("show");
        if (animate) {
          const r = box.getBoundingClientRect();
          setTimeout(() => fx.burst(r.left + r.width / 2, r.top + r.height / 2, 90, { hearts: true, speed: 8 }), 400);
        }
      }
    }
    update(false);

    // twinkling background stars
    const cv = $("#skyCanvas"), ctx = cv.getContext("2d"), sec = $("#sky");
    let dots = [], dpr = 1, vis = false;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = sec.offsetWidth * dpr; cv.height = sec.offsetHeight * dpr;
      dots = Array.from({ length: Math.round(sec.offsetWidth * sec.offsetHeight / 4500) }, () => ({
        x: Math.random() * cv.width, y: Math.random() * cv.height, r: (Math.random() * 1.3 + .3) * dpr, p: Math.random() * 6, s: .01 + Math.random() * .03
      }));
    };
    resize(); addEventListener("resize", resize);
    new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) requestAnimationFrame(tw); }).observe(sec);
    function tw() {
      if (!vis) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const d of dots) {
        d.p += reduceMotion ? 0 : d.s;
        ctx.globalAlpha = .35 + .65 * Math.abs(Math.sin(d.p));
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
      }
      requestAnimationFrame(tw);
    }
  })();

  /* ---------------------------------------------------------
     OPEN WHEN letters
  --------------------------------------------------------- */
  (function openWhen() {
    const grid = $("#owGrid");
    const read = new Set(store.get("openwhen", []));
    (C.openWhen || []).forEach((o, i) => {
      const b = make("button", "ow reveal" + (read.has(i) ? " read" : ""));
      const em = make("span", "ow-emoji", o.emoji || "💌");
      const lab = make("span", "ow-label");
      lab.append(make("b", "", "Open when"), document.createTextNode(o.label));
      b.append(em, lab);
      b.addEventListener("click", () => {
        read.add(i); store.set("openwhen", [...read]); b.classList.add("read");
        openModal(m => {
          textBlock(m, "Open when " + o.label, o.text, o.emoji);
          m.appendChild(make("p", "modal-sign", "— your Beb"));
        });
      });
      grid.appendChild(b);
    });
  })();

  /* ---------------------------------------------------------
     SCRATCH cards
  --------------------------------------------------------- */
  (function scratch() {
    const grid = $("#scratchGrid");
    (C.scratch || []).forEach(s => {
      const card = make("div", "scratch reveal");
      card.appendChild(make("div", "hidden-msg", s.text));
      const cv = make("canvas");
      card.appendChild(cv);
      grid.appendChild(card);
      let ctx, dpr, drawing = false, moves = 0, finished = false;
      function paint() {
        dpr = Math.min(devicePixelRatio || 1, 2);
        const w = card.offsetWidth, h = card.offsetHeight;
        if (!w) return;
        cv.width = w * dpr; cv.height = h * dpr;
        ctx = cv.getContext("2d");
        ctx.scale(dpr, dpr);
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#e9c58f"); g.addColorStop(.35, "#f8e2bd"); g.addColorStop(.6, "#d9a86a"); g.addColorStop(1, "#f3d3a3");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        // sparkle texture
        for (let i = 0; i < 140; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .5})`; ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
        ctx.fillStyle = "rgba(110,28,56,.75)";
        ctx.font = "600 18px Quicksand, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("♥  Scratch me, Fateem  ♥", w / 2, h / 2);
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 34;
      }
      const ro = new ResizeObserver(() => { if (!finished && !moves) paint(); });
      ro.observe(card);
      let last = null;
      const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      cv.addEventListener("pointerdown", e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); scratchAt(last, last); });
      cv.addEventListener("pointermove", e => { if (!drawing) return; const p = pos(e); scratchAt(last, p); last = p; });
      const end = () => { drawing = false; };
      cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
      function scratchAt(a, b) {
        if (!ctx || finished) return;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        if (++moves % 12 === 0) checkDone();
      }
      function checkDone() {
        const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let clear = 0, total = 0;
        for (let i = 3; i < d.length; i += 4 * 40) { total++; if (d[i] === 0) clear++; }
        if (clear / total > .5) {
          finished = true; card.classList.add("done");
          const r = card.getBoundingClientRect();
          fx.burst(r.left + r.width / 2, r.top + r.height / 2, 50, { hearts: true, speed: 6 });
        }
      }
    });
  })();

  /* ---------------------------------------------------------
     COUPONS
  --------------------------------------------------------- */
  (function coupons() {
    const box = $("#couponList");
    const used = new Set(store.get("coupons", []));
    (C.coupons || []).forEach((c, i) => {
      const el = make("div", "coupon reveal" + (used.has(i) ? " used" : ""));
      const left = make("div", "c-left", c.icon || "🎟️");
      const right = make("div", "c-right");
      const btn = make("button", "redeem", "Redeem");
      right.append(make("h3", "", c.title), make("p", "", c.text), btn);
      el.append(left, right, make("span", "stamp", "Redeemed ♥"));
      btn.addEventListener("click", e => {
        used.add(i); store.set("coupons", [...used]); el.classList.add("used");
        fx.burst(e.clientX, e.clientY, 40, { hearts: true, speed: 6 });
      });
      box.appendChild(el);
    });
    $("#couponNote").textContent = C.couponNote || "";
  })();

  /* ---------------------------------------------------------
     QUIZ
  --------------------------------------------------------- */
  (function quiz() {
    const Q = C.quiz || [], card = $("#quizCard");
    let i = 0, score = 0;
    function render() {
      card.innerHTML = "";
      if (i >= Q.length) return finish();
      const q = Q[i];
      card.appendChild(make("p", "quiz-progress", `Question ${i + 1} of ${Q.length}`));
      card.appendChild(make("p", "quiz-hearts", "♥".repeat(score) + "♡".repeat(Q.length - score)));
      card.appendChild(make("h3", "quiz-q", q.q));
      const opts = make("div", "quiz-opts");
      const fb = make("p", "quiz-feedback");
      q.options.forEach((o, k) => {
        const b = make("button", "quiz-opt", o);
        b.addEventListener("click", e => {
          if (opts.dataset.done) return;
          opts.dataset.done = "1";
          const ok = k === q.answer;
          b.classList.add(ok ? "right" : "wrong");
          if (!ok) opts.children[q.answer].classList.add("right");
          else { score++; fx.burst(e.clientX, e.clientY, 30, { hearts: true, speed: 5 }); }
          fb.textContent = ok ? (q.yes || "Yes! 🤍") : (q.no || "Not quite, my love!");
          const next = make("button", "btn btn-primary", i + 1 < Q.length ? "Next question →" : "See my score");
          next.style.marginTop = "1rem";
          next.addEventListener("click", () => { i++; render(); });
          card.appendChild(next);
        });
        opts.appendChild(b);
      });
      card.append(opts, fb);
    }
    function finish() {
      card.appendChild(make("p", "quiz-progress", "Your score"));
      card.appendChild(make("p", "quiz-score", `${score} / ${Q.length}`));
      card.appendChild(make("p", "quiz-feedback", C.quizEnd || ""));
      const again = make("button", "btn btn-ghost", "Play again");
      again.style.marginTop = "1rem";
      again.addEventListener("click", () => { i = 0; score = 0; render(); });
      card.appendChild(again);
      const r = card.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + 40, 90, { up: true, speed: 11 });
    }
    render();
  })();

  /* ---------------------------------------------------------
     FUTURE dreams
  --------------------------------------------------------- */
  (function dreams() {
    const box = $("#dreams");
    const done = new Set(store.get("dreams", []));
    (C.dreams || []).forEach((d, i) => {
      const li = make("li", "dream reveal" + (done.has(i) ? " done" : ""));
      li.tabIndex = 0;
      li.setAttribute("role", "checkbox");
      li.setAttribute("aria-checked", String(done.has(i)));
      li.append(make("span", "d-icon", d.icon || "✨"), make("span", "d-text", d.text), make("span", "d-check"));
      const toggle = e => {
        if (done.has(i)) done.delete(i); else { done.add(i); fx.burst(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2, 30, { hearts: true, speed: 5 }); }
        store.set("dreams", [...done]);
        li.classList.toggle("done", done.has(i));
        li.setAttribute("aria-checked", String(done.has(i)));
      };
      li.addEventListener("click", toggle);
      li.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(e); } });
      box.appendChild(li);
    });
  })();

  /* ---------------------------------------------------------
     WISHES wall
  --------------------------------------------------------- */
  (function wishes() {
    const box = $("#wishWall");
    (C.wishes || []).forEach(w => {
      const d = make("div", "wish reveal");
      d.append(make("p", "", w.text), make("span", "from", "— " + w.from));
      box.appendChild(d);
    });
    const soon = make("div", "wish soon reveal");
    soon.appendChild(make("p", "", "More wishes are on their way to you… 💌"));
    box.appendChild(soon);
  })();

  /* ---------------------------------------------------------
     NOTES
  --------------------------------------------------------- */
  (function notes() {
    const box = $("#notesList");
    (C.notes || []).forEach(n => {
      const d = make("div", "note reveal");
      d.append(make("time", "", n.date || ""), make("p", "", n.text));
      box.appendChild(d);
    });
  })();

  /* ---------------------------------------------------------
     LANTERN wishes
  --------------------------------------------------------- */
  (function lanterns() {
    const sky = $("#lanternSky"), form = $("#lanternForm"), input = $("#lanternInput");
    const release = txt => {
      const l = make("div", "lantern");
      l.style.left = (10 + Math.random() * 65) + "%";
      l.append(make("div", "l-body"), make("span", "l-text", txt));
      sky.appendChild(l);
      setTimeout(() => l.remove(), 11500);
    };
    // a few lanterns float up by themselves the first time she arrives here
    let greeted = false;
    new IntersectionObserver(es => {
      if (es[0].isIntersecting && !greeted) {
        greeted = true;
        ["Happy 25th, Fateem", "🤍", "Forever us"].forEach((t, i) => setTimeout(() => release(t), i * 1400));
      }
    }, { threshold: .4 }).observe($("#lantern"));
    form.addEventListener("submit", e => {
      e.preventDefault();
      release(input.value.trim() || "A secret wish 🤍");
      input.value = "";
      input.blur();
    });
  })();

  /* ---------------------------------------------------------
     FINALE: fireworks + video
  --------------------------------------------------------- */
  (function finale() {
    const F = C.finale || {};
    $("#finaleTitle").textContent = F.title || "";
    $("#finaleText").textContent = F.text || "";
    $("#finaleSign").textContent = F.signature || "";
    const frame = $("#videoFrame");
    const empty = () => {
      frame.innerHTML = "";
      const e = make("div", "v-empty");
      e.append(make("span", "", "🎥"), document.createTextNode("A video message from your Beb will appear here…"));
      frame.appendChild(e);
    };
    if (F.video) {
      const v = document.createElement("video");
      v.controls = true; v.playsInline = true; v.preload = "metadata";
      if (F.videoPoster) {
        const probe = new Image();
        probe.onload = () => { v.poster = F.videoPoster; };
        probe.src = F.videoPoster;
      }
      v.addEventListener("error", empty);
      v.addEventListener("play", () => { if (!song.paused) { song.pause(); v._paused = true; } });
      v.addEventListener("ended", () => { if (v._paused && musicOk) song.play().catch(() => {}); });
      v.src = F.video;
      frame.appendChild(v);
    } else empty();

    $("#hugBtn").addEventListener("click", e => {
      fx.burst(e.clientX, e.clientY, 80, { hearts: true, speed: 9 });
      e.currentTarget.textContent = "Hug sent! 🤗🤍";
    });
    $("#againBtn").addEventListener("click", () => {
      window.scrollTo(0, 0);
      location.reload();
    });

    const cv = $("#fireworks"), ctx = cv.getContext("2d"), sec = $("#finale");
    let vis = false, parts = [], rockets = [], dpr = 1, t = 0;
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = sec.offsetWidth * dpr; cv.height = sec.offsetHeight * dpr; };
    resize(); addEventListener("resize", resize);
    const hues = [340, 350, 20, 40, 320, 0];
    function launch() {
      rockets.push({ x: (.15 + Math.random() * .7) * cv.width, y: cv.height, vy: -(9 + Math.random() * 4) * dpr, ty: (.12 + Math.random() * .35) * cv.height, h: hues[(Math.random() * hues.length) | 0] });
    }
    function explode(r) {
      const n = 70, heart = Math.random() < .35;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        let vx, vy;
        if (heart) {
          vx = 16 * Math.pow(Math.sin(a), 3) * .28; vy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * .28;
        } else {
          const sp = 2 + Math.random() * 4; vx = Math.cos(a) * sp; vy = Math.sin(a) * sp;
        }
        parts.push({ x: r.x, y: r.y, vx: vx * dpr, vy: vy * dpr, life: 70 + Math.random() * 30, h: r.h + Math.random() * 20 - 10 });
      }
    }
    function loop() {
      if (!vis) return;
      t++;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.22)";
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = "lighter";
      if (t % (reduceMotion ? 120 : 38) === 0) launch();
      rockets = rockets.filter(r => {
        r.y += r.vy; r.vy *= .985;
        ctx.fillStyle = `hsl(${r.h},100%,80%)`;
        ctx.fillRect(r.x, r.y, 2 * dpr, 6 * dpr);
        if (r.y <= r.ty || r.vy > -2) { explode(r); return false; }
        return true;
      });
      parts = parts.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += .04 * dpr; p.vx *= .985; p.vy *= .985; p.life--;
        ctx.globalAlpha = Math.max(0, p.life / 90);
        ctx.fillStyle = `hsl(${p.h},95%,70%)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * dpr, 0, 7); ctx.fill();
        return p.life > 0;
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }
    new IntersectionObserver(es => {
      const was = vis; vis = es[0].isIntersecting;
      if (vis && !was) { launch(); requestAnimationFrame(loop); }
    }, { threshold: .25 }).observe(sec);
  })();

  /* ---------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------- */
  function startReveal() {
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(n => io.observe(n));
  }
})();
