// ================================================================= */
// 1. SYNTHETIC AUDIO & SFX ENGINE (WEB AUDIO API)                   */
// ================================================================= */
const AudioFX = {
  enabled: true,
  ctx: null,
  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  },
  resume() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },
  playTick() {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      100,
      this.ctx.currentTime + 0.05,
    );
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  },
  playWebShoot() {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    // Noise buffer for the air friction/thwip
    const bufferSize = this.ctx.sampleRate * 0.15; // 0.15s
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(800, time);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, time + 0.15);
    noiseFilter.Q.setValueAtTime(8, time);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    // High frequency synth tone for the web zip
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(1600, time + 0.1);
    oscGain.gain.setValueAtTime(0.08, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.15);
  },
  playGlitch() {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 0.45;
    // Glitch consists of 3 rapid square wave bursts
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(50 + Math.random() * 600, now + i * 0.12);
      osc.frequency.setValueAtTime(30, now + i * 0.12 + 0.08);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.setValueAtTime(0.06, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.11);
    }
  },
  playCanonAlarm() {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Two oscillators tuned to a tense minor second chord (dissonant warning siren)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(220, now);
    // Siren wobble
    osc1.frequency.linearRampToValueAtTime(330, now + 0.4);
    osc1.frequency.linearRampToValueAtTime(220, now + 0.8);
    osc2.type = "square";
    osc2.frequency.setValueAtTime(225, now);
    osc2.frequency.linearRampToValueAtTime(335, now + 0.4);
    osc2.frequency.linearRampToValueAtTime(225, now + 0.8);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  },
  playSuccess() {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C major arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.05, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  },
  playJazzRiff() {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const playBassNote = (freq, startTime, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    };
    const playSnap = (startTime) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, startTime);
      osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.04);
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.05);
    };
    playBassNote(110.0, now, 0.2); // A2
    playBassNote(138.61, now + 0.2, 0.2); // C#3
    playBassNote(164.81, now + 0.4, 0.2); // E3
    playSnap(now + 0.5); // Snap on offbeat!
    playBassNote(220.0, now + 0.6, 0.4); // A3
  },
};
// Toggle button action listener
document.getElementById("sfx-toggle").addEventListener("click", () => {
  AudioFX.enabled = !AudioFX.enabled;
  const icon = document.getElementById("sfx-toggle").querySelector("i");
  if (AudioFX.enabled) {
    icon.className = "fas fa-volume-up";
    AudioFX.playTick();
  } else {
    icon.className = "fas fa-volume-mute";
  }
});
// ================================================================= */
// 2. DYNAMIC SPIDER-WEB PARTICLE SYSTEM (CANVAS ENGINE)             */
// ================================================================= */
const CanvasEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  mouse: { x: null, y: null, active: false, radius: 160 },
  theme: "spiderverse",
  init() {
    this.canvas = document.getElementById("web-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    this.createParticles();
    window.addEventListener("resize", () => this.resize());

    // Interactive mouse listeners
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    window.addEventListener("mouseleave", () => {
      this.mouse.active = false;
    });
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.mouse.active = true;
      }
    });
    window.addEventListener("touchend", () => {
      this.mouse.active = false;
    });
    this.animate();
  },
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },
  getThemeColors() {
    switch (this.theme) {
      case "classic":
        return {
          particle: "rgba(230, 0, 18, 0.4)",
          web: "rgba(0, 102, 204, 0.15)",
          mouseWeb: "rgba(230, 0, 18, 0.35)",
        };
      case "stealth":
        return {
          particle: "rgba(255, 183, 0, 0.4)",
          web: "rgba(255, 183, 0, 0.1)",
          mouseWeb: "rgba(255, 183, 0, 0.3)",
        };
      case "bully":
        return {
          particle: "rgba(255, 0, 127, 0.4)",
          web: "rgba(0, 255, 204, 0.15)",
          mouseWeb: "rgba(255, 0, 127, 0.35)",
        };
      case "spiderverse":
      default:
        return {
          particle: "rgba(255, 0, 85, 0.4)",
          web: "rgba(0, 240, 255, 0.15)",
          mouseWeb: "rgba(255, 0, 85, 0.35)",
        };
    }
  },
  createParticles() {
    const area = this.canvas.width * this.canvas.height;
    const density = Math.min(Math.floor(area / 18000), 75); // Cap density for performance
    this.particles = [];
    for (let i = 0; i < density; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      });
    }
  },
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const colors = this.getThemeColors();
    // Update & draw particles
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      // Bounce bounds
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = colors.particle;
      this.ctx.fill();
    });
    // Draw spiderweb mesh between nodes
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.35;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = colors.web.replace(/[\d.]+\)$/, `${alpha})`);
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
      // Draw elastic web to cursor anchor
      if (this.mouse.active) {
        const mouseDist = Math.hypot(p1.x - this.mouse.x, p1.y - this.mouse.y);
        if (mouseDist < this.mouse.radius) {
          const alpha = (1 - mouseDist / this.mouse.radius) * 0.75;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = colors.mouseWeb.replace(
            /[\d.]+\)$/,
            `${alpha})`,
          );
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => this.animate());
  },
};
// ================================================================= */
// 3. BASE64 PORTAL URL CRYPT ENGINE                                 */
// ================================================================= */
const CryptEngine = {
  // Compress object values into URL parameter safely
  encode(obj) {
    try {
      const jsonStr = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(jsonStr)));
    } catch (e) {
      console.error("Encoding failed", e);
      return null;
    }
  },
  // Extract object values from URL parameter safely
  decode(str) {
    try {
      const jsonStr = decodeURIComponent(escape(atob(str)));
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Decoding failed", e);
      return null;
    }
  },
};
// ================================================================= */
// 4. CREATOR FLOW & DASHBOARD SYNC                                  */
// ================================================================= */
const CreatorFlow = {
  form: null,
  themeCards: [],
  behaviorCards: [],
  init() {
    this.form = document.getElementById("proposal-form");
    this.themeCards = document.querySelectorAll(".theme-card");
    this.behaviorCards = document.querySelectorAll(".behavior-card");
    // Default Date setup (Today + 7 days, 19:30)
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const dateStr = d.toISOString().split("T")[0];
    document.getElementById("date-val").value = dateStr;
    document.getElementById("time-val").value = "19:30";
    // Setup input dynamic sync on values
    const syncInputs = [
      "crush-name",
      "sender-name",
      "movie-title",
      "invite-message",
      "date-val",
      "time-val",
      "location-val",
    ];
    syncInputs.forEach((id) => {
      document
        .getElementById(id)
        .addEventListener("input", () => this.syncPreview());
    });
    // Theme selector card bindings
    this.themeCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        AudioFX.playTick();
        this.themeCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        card.querySelector("input").checked = true;

        // Sync preview viewport theme
        const theme = card.dataset.theme;
        CanvasEngine.theme = theme;

        const previewViewport = document.getElementById("preview-viewport");
        previewViewport.className = `preview-viewport theme-${theme}`;
        this.syncPreview();
      });
    });
    // No Behavior selector card bindings
    this.behaviorCards.forEach((card) => {
      card.addEventListener("click", () => {
        AudioFX.playTick();
        this.behaviorCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        card.querySelector("input").checked = true;
        this.syncPreview();
      });
    });
    // Generate Button Trigger
    document.getElementById("btn-generate").addEventListener("click", () => {
      this.generatePortalLink();
    });
    this.syncPreview();
  },
  syncPreview() {
    const crush = document.getElementById("crush-name").value || "Gwen";
    const sender = document.getElementById("sender-name").value || "Miles";
    const movie =
      document.getElementById("movie-title").value ||
      "Spider-Man: Brand New Day";
    const msg =
      document.getElementById("invite-message").value ||
      "Will you swing by the cinema with me?";
    const dateVal = document.getElementById("date-val").value;
    const timeVal = document.getElementById("time-val").value;
    const loc = document.getElementById("location-val").value || "IMAX Theater";
    const theme = document.querySelector('input[name="theme"]:checked').value;
    // Render Preview markup in the mobile screen mockup
    const viewport = document.getElementById("preview-viewport");

    // Parse Date helper for layout preview
    let dateFormatted = `${dateVal} @ ${timeVal}`;
    if (dateVal) {
      try {
        const parts = dateVal.split("-");
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const options = { weekday: "long", month: "short", day: "numeric" };
        dateFormatted = `${dateObj.toLocaleDateString("en-US", options)} @ ${timeVal}`;
      } catch (err) {}
    }
    viewport.innerHTML = `
      <div class="proposal-card glass-panel" style="width: calc(100% - 20px); max-height: calc(100% - 20px); font-size: 0.85rem; padding: 20px 15px; overflow: hidden;">
        <div class="web-corner top-left" style="width:30px; height:30px; background-size: contain;"></div>
        <div class="web-corner top-right" style="width:30px; height:30px;"></div>
        
        <div class="card-badge" style="font-size:0.6rem; top:12px; right:15px;">${theme === "bully" ? "Pizza Time 🍕" : "Earth-1610"}</div>
        
        <div class="card-header" style="margin-bottom: 12px; gap:8px;">
          ${
            theme === "bully"
              ? `
            <span style="font-size: 1.25rem;">🍕</span>
          `
              : `
            <svg viewBox="0 0 100 100" width="22" height="22">
              <path d="M50,15 L45,35 L35,30 L42,45 L30,48 L45,55 L25,65 L44,63 L30,85 L48,70 L50,88 L52,70 L70,85 L56,63 L75,65 L55,55 L70,48 L58,45 L65,30 L55,35 Z" fill="var(--spider-accent)" />
            </svg>
          `
          }
          <h2 class="crush-greeting" style="font-size: 1.15rem;">Hey ${crush}!</h2>
        </div>
        <p class="sender-ask" style="font-size:0.65rem; margin-bottom:5px;">${sender} asks...</p>
        <div class="invitation-text-box" style="padding:10px; margin-bottom:12px; border-left-width: 2px;">
          <p style="font-size: 0.8rem; line-height:1.4;">${msg}</p>
        </div>
        <div class="movie-details-badge" style="padding:10px; gap:8px; margin-bottom:15px; font-size:0.75rem;">
          <div class="detail-item" style="gap:8px;">
            <i class="fa-solid fa-film" style="font-size:0.9rem;"></i>
            <span class="detail-val">${movie}</span>
          </div>
          <div class="detail-item" style="gap:8px;">
            <i class="fa-solid fa-calendar-days" style="font-size:0.9rem;"></i>
            <span class="detail-val" style="font-size:0.7rem;">${dateFormatted}</span>
          </div>
          <div class="detail-item" style="gap:8px;">
            <i class="fa-solid fa-location-dot" style="font-size:0.9rem;"></i>
            <span class="detail-val" style="font-size:0.7rem;">${loc}</span>
          </div>
        </div>
        <div class="card-footer" style="gap:8px;">
          <button type="button" class="glow-btn neon-green decision-btn" style="padding:8px 4px; font-size:0.7rem;">YES</button>
          <button type="button" class="glow-btn neon-red decision-btn" style="padding:8px 4px; font-size:0.7rem;">NO</button>
        </div>
      </div>
    `;
  },
  generatePortalLink() {
    AudioFX.playGlitch();
    const crush = document.getElementById("crush-name").value.trim();
    const sender = document.getElementById("sender-name").value.trim();
    const movie = document.getElementById("movie-title").value.trim();
    const msg = document.getElementById("invite-message").value.trim();
    const dateVal = document.getElementById("date-val").value;
    const timeVal = document.getElementById("time-val").value;
    const loc = document.getElementById("location-val").value.trim();

    const theme = document.querySelector('input[name="theme"]:checked').value;
    const behavior = document.querySelector(
      'input[name="no-behavior"]:checked',
    ).value;
    const tbd =
      document.querySelector('input[name="decision-mode"]:checked')?.value ===
      "receiver";
    const tgToken = document.getElementById("tg-token")?.value.trim();
    const tgChatId = document.getElementById("tg-chat-id")?.value.trim();
    if (
      !crush ||
      !sender ||
      !movie ||
      !msg ||
      (!tbd && (!dateVal || !timeVal || !loc))
    ) {
      alert(
        "Please fill all required inputs to stabilize the multiverse portal link!",
      );
      return;
    }
    const payload = {
      c: crush,
      s: sender,
      m: msg,
      d: dateVal,
      t: timeVal,
      l: loc,
      mo: movie,
      th: theme,
      be: behavior,
      tbd: tbd,
    };
    if (tgToken && tgChatId) {
      payload.tgTk = tgToken;
      payload.tgId = tgChatId;
    }
    const key = CryptEngine.encode(payload);
    const generatedUrl = `${window.location.origin}${window.location.pathname}?portal=${key}`;
    // Populate Modal Inputs
    const linkInput = document.getElementById("generated-link");
    linkInput.value = generatedUrl;
    const testLinkBtn = document.getElementById("btn-test-link");
    testLinkBtn.href = generatedUrl;
    // Show Modal
    const modal = document.getElementById("portal-modal");
    modal.classList.remove("hidden");
    // Auto Copy to clipboard
    navigator.clipboard.writeText(generatedUrl).then(() => {
      const copyBtnText = document
        .getElementById("btn-copy-link")
        .querySelector(".btn-text");
      copyBtnText.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
      setTimeout(() => {
        copyBtnText.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
      }, 2500);
    });
  },
};
// Modal Close logic
document.getElementById("btn-close-modal").addEventListener("click", () => {
  AudioFX.playTick();
  document.getElementById("portal-modal").classList.add("hidden");
});
document.getElementById("btn-copy-link").addEventListener("click", () => {
  AudioFX.playTick();
  const input = document.getElementById("generated-link");
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    const btnText = document
      .getElementById("btn-copy-link")
      .querySelector(".btn-text");
    btnText.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
    setTimeout(() => {
      btnText.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
    }, 2000);
  });
});
// ================================================================= */
// 5. PROPOSAL RECEIVER CLIENT ENGINE                                */
// ================================================================= */
const ProposalReceiver = {
  data: null,
  noDodgeCount: 0,
  parseLocalDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const dateParts = dateStr.split("-");
    const timeParts = timeStr.split(":");
    if (dateParts.length !== 3 || timeParts.length < 2) return null;
    return new Date(
      Number(dateParts[0]),
      Number(dateParts[1]) - 1,
      Number(dateParts[2]),
      Number(timeParts[0]),
      Number(timeParts[1]),
    );
  },
  formatDisplayDatetime(dateStr, timeStr, tbd = false) {
    if (tbd || !dateStr || !timeStr) {
      return "To Be Decided";
    }
    const dateObj = this.parseLocalDateTime(dateStr, timeStr);
    if (!dateObj || Number.isNaN(dateObj.getTime())) {
      return `${dateStr} @ ${timeStr}`;
    }
    const options = {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return dateObj.toLocaleString("en-US", options).replace(",", " @");
  },
  formatICSDatetime(dateStr, timeStr) {
    const dateObj = this.parseLocalDateTime(dateStr, timeStr);
    if (!dateObj || Number.isNaN(dateObj.getTime())) return "";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${dateObj.getFullYear()}${pad(dateObj.getMonth() + 1)}${pad(dateObj.getDate())}T${pad(dateObj.getHours())}${pad(dateObj.getMinutes())}00`;
  },
  init(decodedData) {
    this.data = decodedData;
    // Set engine theme
    CanvasEngine.theme = this.data.th || "spiderverse";
    document.body.className = `proposal-mode theme-${this.data.th || "spiderverse"}`;
    // Set details markup
    document.getElementById("display-crush-name").innerText = this.data.c;
    document.getElementById("display-sender-name").innerText = this.data.s;
    document.getElementById("display-movie-title").innerText = this.data.mo;
    document.getElementById("display-message").innerText = this.data.m;

    if (this.data.tbd) {
      document.getElementById("display-location").innerText = "To Be Decided";
    } else {
      document.getElementById("display-location").innerText = this.data.l;
    }
    // Dimension custom naming
    if (this.data.th === "bully") {
      document.getElementById("theme-badge").innerText = `Pizza Time 🍕`;
      document.getElementById("display-dimension").innerText = `69`;

      const symbolContainer = document.querySelector(".spider-symbol-small");
      if (symbolContainer) {
        symbolContainer.innerHTML = `<span style="font-size: 2.2rem; animation: logo-float 4s ease-in-out infinite; display: inline-block; filter: drop-shadow(0 0 8px var(--spider-accent));">🍕</span>`;
      }
    } else {
      const dimId = Math.floor(Math.random() * 800) + 100;
      document.getElementById("display-dimension").innerText = dimId;
      document.getElementById("theme-badge").innerText = `Earth-${dimId}`;
    }

    // Dates formatting
    const dateFormatted = this.formatDisplayDatetime(
      this.data.d,
      this.data.t,
      this.data.tbd,
    );
    const dateEl =
      document.getElementById("display-datetime") ||
      document.getElementById("display-date-time");
    if (dateEl) dateEl.innerText = dateFormatted;
    // Show receiver overlay & hide builder
    document.getElementById("creator-dashboard").classList.add("hidden");
    document.getElementById("proposal-screen").classList.remove("hidden");
    // Attach Event Listeners
    document
      .getElementById("btn-open-portal")
      .addEventListener("click", () => this.openTransmission());

    // YES action bindings
    document
      .getElementById("btn-yes")
      .addEventListener("click", () => this.triggerYesDate());

    // NO actions base routing
    const noBtn = document.getElementById("btn-no");

    if (this.data.be === "dodge") {
      noBtn.addEventListener("mouseenter", (e) => this.dodgeNoButton(e));
      noBtn.addEventListener("touchstart", (e) => this.dodgeNoButton(e));
      noBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.dodgeNoButton(e);
      });
    } else if (this.data.be === "canon") {
      noBtn.addEventListener("click", () => this.triggerCanonAlert());
    } else if (this.data.be === "websnap") {
      noBtn.addEventListener("click", () => this.triggerWebSnapNoButton());
    }
    // Canon timeline fix action
    document
      .getElementById("btn-fix-timeline")
      .addEventListener("click", () => {
        document.getElementById("canon-event-overlay").classList.add("hidden");
        this.triggerYesDate();
      });
    // Calendar Integration
    document
      .getElementById("btn-add-calendar")
      .addEventListener("click", () => this.downloadCalendarICS());

    // Screenshot / share simulation
    document
      .getElementById("btn-screenshot")
      .addEventListener("click", () => this.shareConfirmedMessage());
  },
  openTransmission() {
    AudioFX.playGlitch();

    // Animate loader away
    const landing = document.getElementById("portal-landing");
    landing.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    landing.style.opacity = "0";
    landing.style.transform = "scale(0.8)";

    setTimeout(() => {
      landing.classList.add("hidden");
      const cardView = document.getElementById("proposal-card-view");
      cardView.classList.remove("hidden");
    }, 600);
  },
  dodgeNoButton(event) {
    AudioFX.playTick();
    const noBtn = document.getElementById("btn-no");
    const card = document.getElementById("main-invite-card");

    // Calculate randomized boundaries relative to the viewport/card
    const cardRect = card.getBoundingClientRect();

    // Max values for placements inside card bounds safely (ignoring overflow bounds)
    const maxX = cardRect.width - noBtn.offsetWidth - 30;
    const maxY = cardRect.height - noBtn.offsetHeight - 50;
    // Randomized values
    let newX = Math.random() * maxX;
    let newY = Math.random() * maxY;
    // Ensure it doesn't overlap YES button area which is mostly fixed grid (left bottom area)
    if (newX < cardRect.width / 2) {
      newX += cardRect.width / 3;
    }
    noBtn.style.position = "absolute";
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
    noBtn.style.zIndex = "99";
    // Increment dodge count, update text periodically to tease the user
    this.noDodgeCount++;
    if (this.noDodgeCount > 3 && this.noDodgeCount <= 6) {
      noBtn.innerText = "Error: Out of Web!";
    } else if (this.noDodgeCount > 6) {
      noBtn.innerText = "Dimension Error 404";
    }
  },
  triggerCanonAlert() {
    AudioFX.playCanonAlarm();

    const dim = document.getElementById("display-dimension").innerText;
    document.getElementById("canon-dimension-display").innerText = dim;
    document.getElementById("canon-dimension-display2").innerText = dim;
    const canonOverlay = document.getElementById("canon-event-overlay");
    canonOverlay.classList.remove("hidden");
    // Sound repeating interval during warning (tense warning loop)
    let alarmLoops = 0;
    const alarmInterval = setInterval(() => {
      if (canonOverlay.classList.contains("hidden") || alarmLoops > 4) {
        clearInterval(alarmInterval);
      } else {
        AudioFX.playCanonAlarm();
        alarmLoops++;
      }
    }, 900);
  },
  triggerWebSnapNoButton() {
    // THWIP web shoots from Yes to No pulling No button and turning it to Yes
    AudioFX.playWebShoot();
    const yesBtn = document.getElementById("btn-yes");
    const noBtn = document.getElementById("btn-no");

    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    // Create Temporary Web shooter SVG overlay
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "web-line-svg");

    // Draw Bezier web string between buttons
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "web-stroke");

    const startX = yesRect.left + yesRect.width / 2;
    const startY = yesRect.top + yesRect.height / 2;
    const endX = noRect.left + noRect.width / 2;
    const endY = noRect.top + noRect.height / 2;

    const cpX = (startX + endX) / 2;
    const cpY = Math.min(startY, endY) - 50; // curve upwards
    path.setAttribute(
      "d",
      `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`,
    );
    svg.appendChild(path);
    document.body.appendChild(svg);
    // Apply card shake
    const card = document.getElementById("main-invite-card");
    card.classList.add("web-shake");
    // Animate pulling No button
    noBtn.style.transition =
      "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2)";
    noBtn.style.transform = `translate(${yesRect.left - noRect.left}px, ${yesRect.top - noRect.top}px) scale(0.3)`;
    noBtn.style.opacity = "0";
    setTimeout(() => {
      svg.remove();
      card.classList.remove("web-shake");
      this.triggerYesDate();
    }, 450);
  },
  triggerYesDate() {
    if (this.data.tbd && !this.data.chosen) {
      // Show receiver choice view first
      document.getElementById("proposal-card-view").classList.add("hidden");
      document
        .getElementById("receiver-choice-view")
        .classList.remove("hidden");

      document.getElementById("btn-confirm-choice").onclick = () => {
        const rDate = document.getElementById("receiver-date").value;
        const rTime = document.getElementById("receiver-time").value;
        const rLoc = document.getElementById("receiver-location").value;
        if (!rDate || !rTime) return alert("Please pick a date and time!");

        this.data.d = rDate;
        this.data.t = rTime;
        this.data.l = rLoc;
        this.data.tbd = false; // receiver has chosen the date/time
        this.data.chosen = true; // Mark as chosen

        document.getElementById("receiver-choice-view").classList.add("hidden");
        this.triggerYesDate(); // call again to complete
      };
      return;
    }
    if (this.data.th === "bully") {
      AudioFX.playJazzRiff();
    } else {
      AudioFX.playSuccess();
    }

    // Trigger web strands/confetti spray
    this.spawnConfetti();
    // Fire Telegram Notification
    if (this.data.tgTk && this.data.tgId) {
      this.sendTelegramNotification();
    }
    // Fill success ticket values
    document.getElementById("ticket-movie-title").innerText = this.data.mo;
    document.getElementById("ticket-people").innerText =
      `${this.data.c} & ${this.data.s}`;
    document.getElementById("ticket-location").innerText = this.data.l;
    // Apply Emo Maguire funny stamps
    const stamp = document.querySelector(".canon-stamp");
    if (this.data.th === "bully") {
      stamp.innerText = "PIZZA TIME! 🍕";
      document.getElementById("success-prompt-text").innerText =
        "Double lock! Emo dance stabilized. See you there!";
    } else {
      stamp.innerText = "CANON EVENT LOCKED 🔒";
      document.getElementById("success-prompt-text").innerText =
        "A ticket has been registered in the arachnid database. See you in the theater!";
    }
    // Date formatting helper
    const dateFormatted = this.formatDisplayDatetime(
      this.data.d,
      this.data.t,
      this.data.tbd,
    );
    document.getElementById("ticket-datetime").innerText = dateFormatted;
    // Hide card view, show success ticket
    document.getElementById("proposal-card-view").classList.add("hidden");

    const successView = document.getElementById("proposal-success-view");
    successView.classList.remove("hidden");
  },
  sendTelegramNotification() {
    const niceDate = this.formatDisplayDatetime(
      this.data.d,
      this.data.t,
      this.data.tbd,
    );
    const text = `🕸️ Great news, ${this.data.s}!\n\n${this.data.c} just said YES to your date for ${this.data.mo}!\n\n📍 Location: ${this.data.l}\n⏰ Time: ${niceDate}\n🌌 Theme: ${this.data.th}`;

    const url = `https://api.telegram.org/bot${this.data.tgTk}/sendMessage`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: this.data.tgId,
        text: text,
      }),
    }).catch((err) => console.error("Telegram notification failed", err));
  },
  spawnConfetti() {
    const numConfetti = 80;
    const container = document.body;
    for (let i = 0; i < numConfetti; i++) {
      // Alternate between web strands and red/blue square ticks
      const isWebStrand = Math.random() > 0.5;
      const el = document.createElement("div");

      el.className = isWebStrand ? "confetti-web" : "confetti";

      // Starting coordinates from screen bottom corners
      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? -10 : window.innerWidth + 10;
      const startY = window.innerHeight - Math.random() * 100;

      el.style.left = `${startX}px`;
      el.style.top = `${startY}px`;

      // Dynamic colors if it's general confetti
      if (!isWebStrand) {
        const colors = ["#ff0055", "#00f0ff", "#e60012", "#0066cc", "#ffe600"];
        el.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
      }
      container.appendChild(el);
      // Simple physics curve
      const angle = (fromLeft ? -45 : -135) + (Math.random() - 0.5) * 35;
      const rad = angle * (Math.PI / 180);
      const velocity = 15 + Math.random() * 15;

      let vx = Math.cos(rad) * velocity;
      let vy = Math.sin(rad) * velocity;
      let px = startX;
      let py = startY;

      const gravity = 0.5;
      const animationTimer = setInterval(() => {
        px += vx;
        py += vy;
        vy += gravity; // pull down
        vx *= 0.98; // air resistance
        el.style.left = `${px}px`;
        el.style.top = `${py}px`;
        if (
          py > window.innerHeight + 20 ||
          px < -30 ||
          px > window.innerWidth + 30
        ) {
          clearInterval(animationTimer);
          el.remove();
        }
      }, 16);
    }
  },
  downloadCalendarICS() {
    AudioFX.playTick();
    const movie = this.data.mo;
    const dateVal = this.data.d;
    const timeVal = this.data.t;
    const location = this.data.l;
    // Formatting date to ICS string format (YYYYMMDDTHHMMSSZ)
    // Assume Local time conversion
    let startDateString = "";
    if (dateVal && timeVal) {
      try {
        const parts = dateVal.split("-");
        const timeParts = timeVal.split(":");
        const d = new Date(
          parts[0],
          parts[1] - 1,
          parts[2],
          timeParts[0],
          timeParts[1],
        );

        const formatICSDate = (date) => {
          const pad = (n) => n.toString().padStart(2, "0");
          return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
        };
        startDateString = formatICSDate(d);

        // Add 3 hours for date end time
        d.setHours(d.getHours() + 3);
        const endDateString = formatICSDate(d);
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Across the Dateverse//Spider-Man Invitation//EN
BEGIN:VEVENT
UID:${Date.now()}@spiderman-dateverse
SEQUENCE:0
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${startDateString}
DTEND:${endDateString}
SUMMARY:Spider-Man Movie Date with ${this.data.s}! 🕷️🎟️
DESCRIPTION:Confirmed canon event to watch "${movie}"! Message: "${this.data.m}"
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
        const blob = new Blob([icsContent], {
          type: "text/calendar;charset=utf-8",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Spiderman_Date_Event.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        alert(
          "Failed to synthesize ICS calendar file automatically. Please save details manually!",
        );
      }
    }
  },
  shareConfirmedMessage() {
    AudioFX.playTick();
    const shareText = `Date confirmed! 🎟️🕷️\nMovie: ${this.data.mo}\nDate/Time: ${this.data.d} @ ${this.data.t}\nLocation: ${this.data.l}\nCanon timeline stabilized successfully!`;

    if (navigator.share) {
      navigator
        .share({
          title: "Spidey Date Ticket Confirmed",
          text: shareText,
        })
        .catch(() => {
          navigator.clipboard.writeText(shareText).then(() => {
            alert(
              "Date details copied to clipboard! Send it to them to double lock the canon event!",
            );
          });
        });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert(
          "Date details copied to clipboard! Send it to them to double lock the canon event!",
        );
      });
    }
  },
};
// ================================================================= */
// 6. ENGINE STARTUP & INITIAL ROUTER                                */
// ================================================================= */
window.addEventListener("DOMContentLoaded", () => {
  // Initialize Background Web particles Canvas
  CanvasEngine.init();
  // Simple Router based on URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const portalCode = urlParams.get("portal");
  if (portalCode) {
    // Receivers Page Mode
    const decoded = CryptEngine.decode(portalCode);
    if (decoded) {
      ProposalReceiver.init(decoded);
    } else {
      // Decode fail - redirect to creator
      alert(
        "Multiverse Portal decrypted with key error! Generating portal repair...",
      );
      window.location.href = window.location.origin + window.location.pathname;
    }
  } else {
    // Creator Customizer mode
    CreatorFlow.init();

    // Add document click listener for first-user-gesture audio lock removal
    document.addEventListener(
      "click",
      () => {
        AudioFX.init();
      },
      { once: true },
    );
  }
});
