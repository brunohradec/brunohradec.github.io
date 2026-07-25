(function () {
    const canvas = document.getElementById('aquarium');
    const ctx = canvas.getContext('2d');

    let width, height, dpr;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        width = document.documentElement.clientWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    // total number of fishes swimming on the screen, smaller on mobile screens
    const FISH_COUNT = window.innerWidth < 768 ? 5 : 9;;   

    const FLEE_RADIUS = 140;        // how close cursor needs to be to spook a fish
    const FLEE_FORCE = 0.9;         // strength of the running away acceleration
    const MAX_SPEED = 4.5;          // max speed of the fishes
    const CRUISE_SPEED = 0.6;       // gentle idle swimming speed
    const FRICTION = 0.96;          // to prevent the fish from accelerating forever
    const WANDER_STRENGTH = 0.05;   // how often does a fish change direction

    // colors the fishes can appear in
    const COLORS = ['#df752a', '#e9a033', '#db9514'];

    // tracking the current position of the mouse pointer.
    const pointer = { x: -9999, y: -9999, active: false };

    function setPointer(x, y) {
        pointer.x = x;
        pointer.y = y;
        pointer.active = true;
    }

    function clearPointer() {
        pointer.active = false;
    }

    // handling the mouse pointer
    window.addEventListener('mousemove', (e) => setPointer(e.clientX, e.clientY), { passive: true });
    window.addEventListener('mouseleave', clearPointer, { passive: true });
    
    // handling the touch events on a touch screen
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            setPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            setPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchend', clearPointer, { passive: true });
    window.addEventListener('touchcancel', clearPointer, { passive: true });

    class Fish {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * CRUISE_SPEED;
            this.vy = (Math.random() - 0.5) * CRUISE_SPEED;
            this.size = 14 + Math.random() * 12;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.wanderAngle = Math.random() * Math.PI * 2;
            this.tailPhase = Math.random() * Math.PI * 2;
            this.facing = 1; // 1 = right, -1 = left
        }

        update() {
            // idle wander
            this.wanderAngle += (Math.random() - 0.5) * 0.5;
            this.vx += Math.cos(this.wanderAngle) * WANDER_STRENGTH;
            this.vy += Math.sin(this.wanderAngle) * WANDER_STRENGTH;

            // flee from pointer
            if (pointer.active) {
                const dx = this.x - pointer.x;
                const dy = this.y - pointer.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                if (dist < FLEE_RADIUS) {
                    const strength = (1 - dist / FLEE_RADIUS) * FLEE_FORCE;
                    this.vx += (dx / dist) * strength * 4;
                    this.vy += (dy / dist) * strength * 4;
                }
            }

            // Friction / speed cap
            this.vx *= FRICTION;
            this.vy *= FRICTION;
            
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > MAX_SPEED) {
                this.vx = (this.vx / speed) * MAX_SPEED;
                this.vy = (this.vy / speed) * MAX_SPEED;
            }

            this.x += this.vx;
            this.y += this.vy;

            // softly bounce off edges
            const margin = 30;
            if (this.x < margin) { this.vx += 0.3; }
            if (this.x > width - margin) { this.vx -= 0.3; }
            if (this.y < margin) { this.vy += 0.3; }
            if (this.y > height - margin) { this.vy -= 0.3; }

            if (Math.abs(this.vx) > 0.05) {
                this.facing = this.vx > 0 ? 1 : -1;
            }

            this.tailPhase += 0.25 + Math.min(speed * 0.15, 0.6);
        }

        draw(ctx) {
            const angle = Math.atan2(this.vy, this.vx);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);

            // keep body orientation natural
            if (this.facing < 0) ctx.scale(1, -1); 

            const s = this.size;
            const tailWag = Math.sin(this.tailPhase) * 0.5;

            ctx.fillStyle = this.color;

            // tail
            ctx.beginPath();
            ctx.moveTo(-s * 0.9, 0);
            ctx.quadraticCurveTo(-s * 1.5, -s * 0.6 + tailWag * s * 0.4, -s * 1.7, tailWag * s * 0.7);
            ctx.quadraticCurveTo(-s * 1.5, s * 0.6 + tailWag * s * 0.4, -s * 0.9, 0);
            ctx.fill();

            // body
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.9, s * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();

            // fin
            ctx.beginPath();
            ctx.moveTo(-s * 0.1, -s * 0.5);
            ctx.quadraticCurveTo(s * 0.15, -s * 0.95, s * 0.35, -s * 0.45);
            ctx.closePath();
            ctx.fill();

            // eye
            ctx.fillStyle = 'rgba(20,20,20,0.85)';
            ctx.beginPath();
            ctx.arc(s * 0.55, -s * 0.1, s * 0.09, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    const fishes = Array.from({ length: FISH_COUNT }, () => new Fish());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (const fish of fishes) {
            fish.update();
            fish.draw(ctx);
        }
        requestAnimationFrame(animate);
    }

    animate();
})();