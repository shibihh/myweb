/**
 * Interactive Animations, Sound Synthesizer, 3D Tilt, Terminal & UI Controls
 * For Shibihhh's Web Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Global Particle Engine
  const particleEngine = new ParticleEngine('particles-canvas');
  window.engine = particleEngine;

  // 1. Web Audio Synthesizer (Zero External Assets)
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.enabled = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) this.init();
      return this.enabled;
    }

    playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.05) {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio policy ignore
      }
    }

    click() {
      this.playTone(620, 'triangle', 0.05, 0.04);
    }

    hover() {
      this.playTone(320, 'sine', 0.03, 0.015);
    }

    success() {
      if (!this.enabled || !this.ctx) return;
      this.playTone(523.25, 'sine', 0.1, 0.05); // C5
      setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.05), 90); // E5
      setTimeout(() => this.playTone(783.99, 'sine', 0.18, 0.06), 180); // G5
    }
  }

  const sound = new SoundSynth();

  // Audio Toggle Button
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isSoundOn = sound.toggle();
      soundBtn.classList.toggle('active', isSoundOn);
      soundBtn.innerHTML = isSoundOn 
        ? `<i class="fa-solid fa-volume-high"></i> <span>Audio: ON</span>` 
        : `<i class="fa-solid fa-volume-xmark"></i> <span>Audio: OFF</span>`;
      if (isSoundOn) sound.success();
    });
  }

  // Hover sound hooks for interactive elements
  document.querySelectorAll('a, button, .interactive-card, .btn').forEach(el => {
    el.addEventListener('mouseenter', () => sound.hover());
    el.addEventListener('click', () => sound.click());
  });

  // 2. Typing Effect for Hero Subtitle
  const typedTarget = document.getElementById('typed-text');
  if (typedTarget && window.PROFILE_DATA && window.PROFILE_DATA.titles) {
    const titles = window.PROFILE_DATA.titles;
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function typeLoop() {
      const currentTitle = titles[titleIndex];
      if (isDeleting) {
        typedTarget.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 45;
      } else {
        typedTarget.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 95;
      }

      if (!isDeleting && charIndex === currentTitle.length) {
        typeDelay = 1800; // Pause at end of text
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        typeDelay = 400; // Brief pause before typing next
      }

      setTimeout(typeLoop, typeDelay);
    }
    typeLoop();
  }

  // 3. Custom Glowing Cursor Follower
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');

  if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateCursor() {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Enlarge cursor on interactive elements
    document.querySelectorAll('a, button, input, textarea, .tilt-card').forEach(item => {
      item.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('cursor-hover');
      });
      item.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('cursor-hover');
      });
    });
  }

  // 4. 3D Tilt Card Interaction with Specular Glare
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      
      // Dynamic glare variable
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // 5. Interactive Developer Terminal
  const termInput = document.getElementById('terminal-input');
  const termBody = document.getElementById('terminal-output');
  const quickCmdBtns = document.querySelectorAll('.cmd-pill');

  const COMMANDS = {
    help: () => `
<div class="term-line output">
  <span class="term-cyan">Available commands:</span><br>
  - <span class="term-yellow">bio</span>       : View personal overview & engineering background<br>
  - <span class="term-yellow">data</span>      : Display B.Tech stats, metrics & specs<br>
  - <span class="term-yellow">skills</span>    : List technical stack & proficiencies<br>
  - <span class="term-yellow">projects</span>  : Show featured web development projects<br>
  - <span class="term-yellow">contact</span>   : Get social links & contact details<br>
  - <span class="term-yellow">clear</span>     : Clear the terminal screen<br>
  - <span class="term-yellow">whoami</span>    : Display current identity & role
</div>`,
    bio: () => `
<div class="term-line output">
  <span class="term-accent">== [ SHIBIHHH // BIO DATA ] ==</span><br>
  Name: <b>${PROFILE_DATA.name}</b> (${PROFILE_DATA.nickname})<br>
  Degree: <b>${PROFILE_DATA.about.degree}</b> in ${PROFILE_DATA.about.branch}<br>
  Focus: ${PROFILE_DATA.about.focus}<br>
  Status: <span class="term-green">● ${PROFILE_DATA.status}</span><br>
  Summary: "${PROFILE_DATA.about.summary}"
</div>`,
    data: () => `
<div class="term-line output">
  <span class="term-accent">== [ SYSTEM METRICS & B.TECH DATA ] ==</span><br>
  ${PROFILE_DATA.metrics.map(m => `• <b>${m.label}</b>: <span class="term-cyan">${m.value}</span> (${m.note})`).join('<br>')}
</div>`,
    skills: () => `
<div class="term-line output">
  <span class="term-accent">== [ TECHNICAL PROFICIENCIES ] ==</span><br>
  <span class="term-yellow">Frontend:</span> ${PROFILE_DATA.skills.frontend.map(s => s.name).join(', ')}<br>
  <span class="term-yellow">Engineering:</span> ${PROFILE_DATA.skills.engineering.map(s => s.name).join(', ')}
</div>`,
    projects: () => `
<div class="term-line output">
  <span class="term-accent">== [ FEATURED WORK ] ==</span><br>
  ${PROFILE_DATA.projects.map(p => `• <b>${p.title}</b> [${p.category}] - ${p.description}`).join('<br>')}
</div>`,
    contact: () => `
<div class="term-line output">
  <span class="term-accent">== [ CONTACT CHANNELS ] ==</span><br>
  Email: <a href="mailto:${PROFILE_DATA.email}" class="term-cyan">${PROFILE_DATA.email}</a><br>
  GitHub: <a href="${PROFILE_DATA.github}" target="_blank" class="term-cyan">${PROFILE_DATA.github}</a><br>
  LinkedIn: <a href="${PROFILE_DATA.linkedin}" target="_blank" class="term-cyan">${PROFILE_DATA.linkedin}</a>
</div>`,
    whoami: () => `
<div class="term-line output">
  user: <span class="term-cyan">guest@shibihhh-portfolio</span><br>
  host: <span class="term-yellow">btech-web-workstation</span><br>
  privileges: <span class="term-green">AUTHORIZED_EXPLORER</span>
</div>`,
    clear: () => {
      if (termBody) termBody.innerHTML = '';
      return '';
    }
  };

  function executeCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!termBody) return;

    if (cmd !== 'clear') {
      const userCmdLine = document.createElement('div');
      userCmdLine.className = 'term-line user-input-echo';
      userCmdLine.innerHTML = `<span class="term-prompt">shibihhh@dev:~$</span> <span class="term-cmd-text">${escapeHtml(cmdRaw)}</span>`;
      termBody.appendChild(userCmdLine);
    }

    if (cmd in COMMANDS) {
      const outputHtml = COMMANDS[cmd]();
      if (outputHtml) {
        const outElem = document.createElement('div');
        outElem.innerHTML = outputHtml;
        termBody.appendChild(outElem);
      }
    } else if (cmd === '') {
      // do nothing
    } else {
      const errElem = document.createElement('div');
      errElem.className = 'term-line error';
      errElem.innerHTML = `command not found: <span class="term-red">${escapeHtml(cmd)}</span>. Type <span class="term-yellow">'help'</span> for a list of available commands.`;
      termBody.appendChild(errElem);
    }

    termBody.scrollTop = termBody.scrollHeight;
    sound.click();
  }

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCommand(termInput.value);
        termInput.value = '';
      }
    });
  }

  quickCmdBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) executeCommand(cmd);
    });
  });

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 6. Animation Lab Sandbox Controls
  const pCountSlider = document.getElementById('slider-particles');
  const pSpeedSlider = document.getElementById('slider-speed');
  const pDistSlider = document.getElementById('slider-distance');
  const pCountVal = document.getElementById('val-particles');
  const pSpeedVal = document.getElementById('val-speed');
  const pDistVal = document.getElementById('val-distance');
  const burstBtn = document.getElementById('btn-burst');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const modeBtns = document.querySelectorAll('.mode-btn');

  if (pCountSlider && pCountVal) {
    pCountSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      pCountVal.textContent = val;
      particleEngine.updateConfig('particleCount', val);
    });
  }

  if (pSpeedSlider && pSpeedVal) {
    pSpeedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      pSpeedVal.textContent = `${val.toFixed(1)}x`;
      particleEngine.updateConfig('baseSpeed', val);
    });
  }

  if (pDistSlider && pDistVal) {
    pDistSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      pDistVal.textContent = `${val}px`;
      particleEngine.updateConfig('connectDistance', val);
    });
  }

  if (burstBtn) {
    burstBtn.addEventListener('click', () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particleEngine.burstParticles(centerX, centerY, 35);
      particleEngine.createShockwave(centerX, centerY);
      sound.success();
    });
  }

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      particleEngine.updateConfig('theme', theme);
      document.documentElement.setAttribute('data-accent-theme', theme);
      sound.click();
    });
  });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      particleEngine.updateConfig('mouseMode', mode);
      sound.click();
    });
  });

  // 7. Scroll Reveal & Active Nav Link Highlight
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => observer.observe(el));

  // Navbar Active on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const sectionHeight = sec.offsetHeight;
      const sectionTop = sec.offsetTop - 120;
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    // Glass navbar shadow effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
      sound.click();
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // 8. Contact Form Handling with Particle Celebration
  const contactForm = document.getElementById('contact-form');
  const formSuccessModal = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');

      if (!nameInput.value || !emailInput.value || !messageInput.value) {
        alert('Please fill out all fields before sending!');
        return;
      }

      // Trigger Celebration Burst
      const rect = contactForm.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      particleEngine.burstParticles(centerX, centerY, 40);
      particleEngine.createShockwave(centerX, centerY);
      sound.success();

      // Show success message
      if (formSuccessModal) {
        formSuccessModal.classList.add('visible');
        setTimeout(() => {
          formSuccessModal.classList.remove('visible');
        }, 4000);
      }

      contactForm.reset();
    });
  }

  // Copy Email to Clipboard
  const copyBtn = document.getElementById('btn-copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = PROFILE_DATA.email || "shibihhh.dev@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied to Clipboard!`;
        sound.success();
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2200);
      });
    });
  }
});
