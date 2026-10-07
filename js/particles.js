/**
 * High-Performance Interactive Canvas Particle & Constellation Engine
 * Created for Shibihhh's Web Animation Portfolio
 */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Configurable state
    this.config = {
      particleCount: 85,
      baseSpeed: 0.9,
      connectDistance: 130,
      mouseRadius: 160,
      mouseMode: 'attract', // 'attract', 'repel', 'none'
      theme: 'cyan', // 'cyan', 'purple', 'emerald', 'amber', 'cyber'
      enableShockwave: true
    };

    // Color palettes
    this.palettes = {
      cyan: {
        primary: 'rgba(0, 245, 212, ',
        secondary: 'rgba(0, 180, 216, ',
        glow: '#00f5d4'
      },
      purple: {
        primary: 'rgba(168, 85, 247, ',
        secondary: 'rgba(126, 34, 206, ',
        glow: '#a855f7'
      },
      emerald: {
        primary: 'rgba(16, 185, 129, ',
        secondary: 'rgba(5, 150, 105, ',
        glow: '#10b981'
      },
      amber: {
        primary: 'rgba(245, 158, 11, ',
        secondary: 'rgba(217, 119, 6, ',
        glow: '#f59e0b'
      },
      cyber: {
        primary: 'rgba(255, 0, 128, ',
        secondary: 'rgba(0, 245, 212, ',
        glow: '#ff0080'
      }
    };

    this.particles = [];
    this.shockwaves = [];
    this.mouse = {
      x: -1000,
      y: -1000,
      isActive: false
    };

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.initCanvas();
    this.initEvents();
    this.spawnParticles();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  spawnParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle(x, y, vx, vy) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.3 + Math.random() * 0.9) * this.config.baseSpeed;
    return {
      x: x !== undefined ? x : Math.random() * this.width,
      y: y !== undefined ? y : Math.random() * this.height,
      vx: vx !== undefined ? vx : Math.cos(angle) * speed,
      vy: vy !== undefined ? vy : Math.sin(angle) * speed,
      radius: Math.random() * 2.2 + 1.2,
      baseRadius: Math.random() * 2.2 + 1.2,
      alpha: Math.random() * 0.6 + 0.3,
      pulse: Math.random() * Math.PI,
      pulseSpeed: 0.02 + Math.random() * 0.03
    };
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.initCanvas();
      // Keep within bounds
      this.particles.forEach(p => {
        if (p.x > this.width) p.x = Math.random() * this.width;
        if (p.y > this.height) p.y = Math.random() * this.height;
      });
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.isActive = true;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.isActive = false;
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    // Touch support for mobile devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.mouse.isActive = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.isActive = false;
    });

    // Shockwave burst on click
    window.addEventListener('click', (e) => {
      // Don't trigger if clicking interactive form controls
      if (e.target.closest('button, input, select, a, textarea')) return;
      this.createShockwave(e.clientX, e.clientY);
      this.burstParticles(e.clientX, e.clientY, 15);
    });
  }

  createShockwave(x, y) {
    if (!this.config.enableShockwave) return;
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: 180,
      alpha: 0.8,
      speed: 6
    });
  }

  burstParticles(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = Math.random() * 4 + 2;
      this.particles.push(this.createParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      ));
    }
    // Trim back down smoothly
    if (this.particles.length > this.config.particleCount + 30) {
      this.particles.splice(0, this.particles.length - (this.config.particleCount + 10));
    }
  }

  updateConfig(key, value) {
    this.config[key] = value;
    if (key === 'particleCount') {
      const diff = value - this.particles.length;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) this.particles.push(this.createParticle());
      } else if (diff < 0) {
        this.particles.splice(0, Math.abs(diff));
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const palette = this.palettes[this.config.theme] || this.palettes.cyan;

    // 1. Draw Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha -= 0.02;

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `${palette.primary}${sw.alpha})`;
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
    }

    // 2. Update & Draw Particles
    const pCount = this.particles.length;
    for (let i = 0; i < pCount; i++) {
      const p = this.particles[i];

      // Natural movement
      p.x += p.vx * this.config.baseSpeed;
      p.y += p.vy * this.config.baseSpeed;

      // Pulse radius slightly
      p.pulse += p.pulseSpeed;
      const currentRadius = p.baseRadius + Math.sin(p.pulse) * 0.6;

      // Mouse gravity interaction
      if (this.mouse.isActive && this.config.mouseMode !== 'none') {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.config.mouseRadius && dist > 1) {
          const force = (1 - dist / this.config.mouseRadius) * 0.18;
          if (this.config.mouseMode === 'attract') {
            p.x += (dx / dist) * force * 15;
            p.y += (dy / dist) * force * 15;
          } else if (this.config.mouseMode === 'repel') {
            p.x -= (dx / dist) * force * 20;
            p.y -= (dy / dist) * force * 20;
          }
        }
      }

      // Screen edge wrap
      if (p.x < -10) p.x = this.width + 10;
      else if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      else if (p.y > this.height + 10) p.y = -10;

      // Draw particle circle with soft glow
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
      this.ctx.fillStyle = `${palette.primary}${p.alpha})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = palette.glow;
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset

      // 3. Connect close particles with constellation lines
      for (let j = i + 1; j < pCount; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.config.connectDistance) {
          const lineAlpha = (1 - dist / this.config.connectDistance) * 0.35;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `${palette.secondary}${lineAlpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }

      // Connect to mouse if active and close
      if (this.mouse.isActive) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.config.mouseRadius) {
          const mouseLineAlpha = (1 - dist / this.config.mouseRadius) * 0.55;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = `${palette.primary}${mouseLineAlpha})`;
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(this.animate);
  }
}

window.ParticleEngine = ParticleEngine;
