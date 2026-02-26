// Enable strict mode for cleaner, safer JavaScript.
'use strict';

// ---------------------------------------------------------------------------
// ARCHITECTURE
//
//  CONFIG ──► Scene.constructor()
//                 └─ creates Entity[]  ──► stored as this.entities
//
//  Loop.start()
//      └─ tick() ──► Scene.update()   ──► Entity.update()  (physics)
//                └─► Scene.draw()    ──► Entity.draw()   (rendering)
//
//  How to customise:
//    1. Tweak CONFIG values to change behaviour without touching the classes.
//    2. Replace Particle with your own entity class (Firework, RainStream…).
//       Rename Scene to match (FireworksScene, RainScene…).
//    3. Loop and Helper are boilerplate — leave them as-is.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CONFIG
// All the tunable numbers live here — speeds, sizes, counts, colours.
// Keep magic numbers out of the classes below.
// ---------------------------------------------------------------------------

const CONFIG = Object.freeze({
    CANVAS_ID: 'canvas-boilerplate',
    TIME_STEP: 16,          // ms between updates (~60fps). Bump this up to slow things down.
    PARTICLE_COUNT: 50,     // How many particles to spawn on load.
    PARTICLE: {
        RADIUS: 4,          // Size of each particle in pixels.
        SPEED: 2,           // Base movement speed.
    },
    COLOURS: {
        BACKGROUND: 'rgba(0, 0, 0, 0.15)', // Semi-transparent fill each frame — lower alpha = longer trails.
    }
});

// ---------------------------------------------------------------------------
// ENTITY
// A single element of your effect.
// Rename this to something that fits your project (e.g. Firework, RainStream).
// Handles its own position, movement, and drawing.
// ---------------------------------------------------------------------------

class Particle {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.radius = CONFIG.PARTICLE.RADIUS;

        // Drop it somewhere random on the canvas.
        this.x = Helper.random(this.radius, canvas.width - this.radius);
        this.y = Helper.random(this.radius, canvas.height - this.radius);

        // Pick a random direction and set off.
        const angle = Math.random() * Math.PI * 2;
        this.velX = Math.cos(angle) * CONFIG.PARTICLE.SPEED;
        this.velY = Math.sin(angle) * CONFIG.PARTICLE.SPEED;

        this.colour = Helper.getRandomColour();
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;

        // Bounce off the edges.
        if (this.x <= this.radius || this.x >= this.canvas.width - this.radius) {
            this.velX *= -1;
        }
        if (this.y <= this.radius || this.y >= this.canvas.height - this.radius) {
            this.velY *= -1;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colour;
        this.ctx.fill();
    }
}

// ---------------------------------------------------------------------------
// SCENE
// Owns all the entities — creates, updates, and draws them each frame.
// Spawning logic, global state, and inter-entity behaviour all go here.
// Rename this to match your effect (e.g. FireworksScene, RainScene).
// ---------------------------------------------------------------------------

class Scene {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.entities = [];

        // Spawn the initial entities.
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            this.entities.push(new Particle(ctx, canvas));
        }
    }

    update() {
        for (const entity of this.entities) {
            entity.update();
        }
    }

    draw() {
        // Lay down a semi-transparent fill each frame — this is what creates the trails.
        // Adjust the alpha in CONFIG.COLOURS.BACKGROUND to control how fast they fade.
        this.ctx.fillStyle = CONFIG.COLOURS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const entity of this.entities) {
            entity.draw();
        }
    }
}

// ---------------------------------------------------------------------------
// LOOP
// Fixed-timestep animation loop — no need to touch this.
// Just pass it a Scene with update() and draw() and it handles the rest.
// ---------------------------------------------------------------------------

class Loop {
    constructor(scene, timeStep) {
        this.scene = scene;
        this.timeStep = timeStep;
        this.lastTime = 0;
        this.accumulator = 0;
        this.tick = this.tick.bind(this);
    }

    start() {
        this.rafId = requestAnimFrame(this.tick);
    }

    // Not used here — call this if you ever need to halt the loop.
    stop() {
        cancelAnimationFrame(this.rafId);
    }

    tick(currentTimestamp) {
        const timeDelta = currentTimestamp - this.lastTime;
        this.lastTime = currentTimestamp;
        this.accumulator += timeDelta;

        // Only update and draw once enough time has built up.
        if (this.accumulator > this.timeStep) {
            this.accumulator = 0;
            this.scene.update();
            this.scene.draw();
        }

        this.rafId = requestAnimFrame(this.tick);
    }
}

// ---------------------------------------------------------------------------
// HELPER
// Pure utility methods — nothing project-specific goes in here.
// ---------------------------------------------------------------------------

class Helper {
    // Random integer between min and max (inclusive).
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Random hex colour.
    static getRandomColour() {
        const letters = '0123456789ABCDEF';
        let colour = '#';
        for (let i = 0; i < 6; i++) {
            colour += letters[Math.floor(Math.random() * 16)];
        }
        return colour;
    }
}

// ---------------------------------------------------------------------------

// Kick everything off once the page has loaded.
window.addEventListener('load', () => {
    const canvas = document.getElementById(CONFIG.CANVAS_ID);
    if (!canvas) {
        console.error(`Canvas element with id="${CONFIG.CANVAS_ID}" not found.`);
        return;
    }

    const ctx = canvas.getContext('2d');
    const scene = new Scene(ctx, canvas);
    new Loop(scene, CONFIG.TIME_STEP).start();
});

// Polyfill for cross-browser requestAnimationFrame support.
window.requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            // Fallback to 30 FPS
            window.setTimeout(callback, 1000 / 30);
        }
    );
})();
