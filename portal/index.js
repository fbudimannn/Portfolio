import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
const root = document.getElementById('root') ?? document.body;
root.appendChild(renderer.domElement);

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.0, 0.4, 0.1
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// Clock
const clock = new THREE.Clock();
const startTime = clock.getElapsedTime();
let animTime = 0;

// Animation timing
const PHASE_SPARK = 0.0;
const PHASE_EXPAND = 0.5;
const PHASE_FULL = 3.0;
const PHASE_COLLAPSE = 22.0;
const PHASE_END = 25.0;

// ===== MAIN RING PARTICLES =====
const ringParticleCount = 8000;
const ringGeometry = new THREE.BufferGeometry();
const ringPositions = new Float32Array(ringParticleCount * 3);
const ringSizes = new Float32Array(ringParticleCount);
const ringColors = new Float32Array(ringParticleCount * 3);
const ringData = new Float32Array(ringParticleCount * 4); // angle, speed, radiusOffset, phase

for (let i = 0; i < ringParticleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    const radiusOffset = (Math.random() - 0.5) * 0.6;
    const phase = Math.random() * Math.PI * 2;

    ringData[i * 4] = angle;
    ringData[i * 4 + 1] = speed;
    ringData[i * 4 + 2] = radiusOffset;
    ringData[i * 4 + 3] = phase;

    ringPositions[i * 3] = 0;
    ringPositions[i * 3 + 1] = 0;
    ringPositions[i * 3 + 2] = 0;

    ringSizes[i] = 0.02 + Math.random() * 0.06;

    // Blue/cyan color palette (Dr. Strange style)
    const colorChoice = Math.random();
    if (colorChoice < 0.4) {
        // Electric blue
        ringColors[i * 3] = 0.1 + Math.random() * 0.15;
        ringColors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
        ringColors[i * 3 + 2] = 1.0;
    } else if (colorChoice < 0.7) {
        // Bright cyan
        ringColors[i * 3] = 0.0 + Math.random() * 0.15;
        ringColors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        ringColors[i * 3 + 2] = 1.0;
    } else if (colorChoice < 0.9) {
        // Deep blue
        ringColors[i * 3] = 0.05 + Math.random() * 0.1;
        ringColors[i * 3 + 1] = 0.2 + Math.random() * 0.3;
        ringColors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    } else {
        // White-hot sparks
        ringColors[i * 3] = 0.7 + Math.random() * 0.3;
        ringColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        ringColors[i * 3 + 2] = 1.0;
    }
}

ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
ringGeometry.setAttribute('size', new THREE.BufferAttribute(ringSizes, 1));
ringGeometry.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));

const ringMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
        uGlobalAlpha: { value: 1.0 }
    },
    vertexShader: `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uPixelRatio;
    void main() {
      vColor = color;
      vAlpha = 1.0;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * uPixelRatio * (200.0 / -mvPos.z);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
    fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uGlobalAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, d);
      alpha *= alpha;
      gl_FragColor = vec4(vColor * 1.5, alpha * vAlpha * uGlobalAlpha);
    }
  `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
});

const ringPoints = new THREE.Points(ringGeometry, ringMaterial);
ringPoints.name = 'ringParticles';
scene.add(ringPoints);

// ===== TRAILING SPARK PARTICLES (falling/gravity affected) =====
const trailCount = 5000;
const trailGeom = new THREE.BufferGeometry();
const trailPos = new Float32Array(trailCount * 3);
const trailSizes = new Float32Array(trailCount);
const trailColors = new Float32Array(trailCount * 3);
const trailVelocities = new Float32Array(trailCount * 3);
const trailLifetimes = new Float32Array(trailCount * 2); // life, maxLife
const trailActive = new Uint8Array(trailCount);

for (let i = 0; i < trailCount; i++) {
    trailPos[i * 3] = 0;
    trailPos[i * 3 + 1] = -100;
    trailPos[i * 3 + 2] = 0;
    trailSizes[i] = 0.01 + Math.random() * 0.04;
    trailLifetimes[i * 2] = 0;
    trailLifetimes[i * 2 + 1] = 1;
    trailActive[i] = 0;
    // Blue/cyan trails
    trailColors[i * 3] = 0.05 + Math.random() * 0.15;
    trailColors[i * 3 + 1] = 0.4 + Math.random() * 0.4;
    trailColors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
}

trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
trailGeom.setAttribute('size', new THREE.BufferAttribute(trailSizes, 1));
trailGeom.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

const trailMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
        uGlobalAlpha: { value: 1.0 }
    },
    vertexShader: `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    uniform float uPixelRatio;
    void main() {
      vColor = color;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * uPixelRatio * (150.0 / -mvPos.z);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
    fragmentShader: `
    varying vec3 vColor;
    uniform float uGlobalAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.05, d);
      gl_FragColor = vec4(vColor * 1.2, alpha * uGlobalAlpha);
    }
  `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
});

const trailPoints = new THREE.Points(trailGeom, trailMaterial);
trailPoints.name = 'trailParticles';
scene.add(trailPoints);

let nextTrailIndex = 0;

function spawnTrailParticle(x, y, z, vx, vy, vz) {
    const i = nextTrailIndex;
    nextTrailIndex = (nextTrailIndex + 1) % trailCount;

    trailPos[i * 3] = x;
    trailPos[i * 3 + 1] = y;
    trailPos[i * 3 + 2] = z;
    trailVelocities[i * 3] = vx;
    trailVelocities[i * 3 + 1] = vy;
    trailVelocities[i * 3 + 2] = vz;
    trailLifetimes[i * 2] = 0;
    trailLifetimes[i * 2 + 1] = 1.5 + Math.random() * 2.5;
    trailActive[i] = 1;
}

// ===== GROUND SPARKS (accumulated at bottom) =====
const groundCount = 4000;
const groundGeom = new THREE.BufferGeometry();
const groundPos = new Float32Array(groundCount * 3);
const groundSizes = new Float32Array(groundCount);
const groundColors = new Float32Array(groundCount * 3);
const groundAlphas = new Float32Array(groundCount);
const groundData = new Float32Array(groundCount * 2); // flickerPhase, flickerSpeed

for (let i = 0; i < groundCount; i++) {
    groundPos[i * 3] = (Math.random() - 0.5) * 6;
    groundPos[i * 3 + 1] = -2.2 + Math.random() * 0.15;
    groundPos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    groundSizes[i] = 0.008 + Math.random() * 0.025;
    groundAlphas[i] = 0;
    groundData[i * 2] = Math.random() * Math.PI * 2;
    groundData[i * 2 + 1] = 2 + Math.random() * 6;
    // Blue/cyan ground sparks
    groundColors[i * 3] = 0.05 + Math.random() * 0.1;
    groundColors[i * 3 + 1] = 0.4 + Math.random() * 0.4;
    groundColors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
}

groundGeom.setAttribute('position', new THREE.BufferAttribute(groundPos, 3));
groundGeom.setAttribute('aSize', new THREE.BufferAttribute(groundSizes, 1));
groundGeom.setAttribute('color', new THREE.BufferAttribute(groundColors, 3));
groundGeom.setAttribute('aAlpha', new THREE.BufferAttribute(groundAlphas, 1));

const groundMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
        uGlobalAlpha: { value: 1.0 }
    },
    vertexShader: `
    attribute float aSize;
    attribute float aAlpha;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uPixelRatio;
    void main() {
      vColor = color;
      vAlpha = aAlpha;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * uPixelRatio * (150.0 / -mvPos.z);
      gl_Position = projectionMatrix * mvPos;
    }
  `,
    fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uGlobalAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, d);
      gl_FragColor = vec4(vColor, alpha * vAlpha * uGlobalAlpha);
    }
  `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
});

const groundPoints = new THREE.Points(groundGeom, groundMaterial);
groundPoints.name = 'groundSparks';
scene.add(groundPoints);

// ===== INNER RING GLOW (torus) =====
const glowRingGeom = new THREE.TorusGeometry(1.8, 0.04, 16, 100);
const glowRingMat = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0 },
        uScale: { value: 0 }
    },
    vertexShader: `
    uniform float uScale;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec3 pos = position * uScale;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform float uAlpha;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
      vec3 col = mix(vec3(0.05, 0.3, 1.0), vec3(0.2, 0.8, 1.0), fresnel);
      float flicker = 0.85 + 0.15 * sin(uTime * 8.0 + vPosition.x * 5.0);
      gl_FragColor = vec4(col * 2.0 * flicker, uAlpha * (0.4 + fresnel * 0.6));
    }
  `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
});

const glowRing = new THREE.Mesh(glowRingGeom, glowRingMat);
glowRing.name = 'glowRing';
scene.add(glowRing);

// ===== OUTER GLOW RING =====
const outerGlowGeom = new THREE.TorusGeometry(1.8, 0.15, 16, 100);
const outerGlowMat = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0 },
        uScale: { value: 0 }
    },
    vertexShader: `
    uniform float uScale;
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position * uScale;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform float uAlpha;
    varying vec3 vNormal;
    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      vec3 col = vec3(0.1, 0.5, 1.0);
      gl_FragColor = vec4(col * 1.5, uAlpha * fresnel * 0.3);
    }
  `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
});

const outerGlow = new THREE.Mesh(outerGlowGeom, outerGlowMat);
outerGlow.name = 'outerGlow';
scene.add(outerGlow);

// ===== WORMHOLE TUNNEL (inside portal) =====
const tunnelGeom = new THREE.CylinderGeometry(1.6, 0.3, 12, 32, 60, true);
const tunnelMat = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0 }
    },
    vertexShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    void main() {
      vUv = uv;
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform float uAlpha;
    varying vec2 vUv;
    varying vec3 vPos;
    
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    void main() {
      float depth = vUv.y;
      float angle = atan(vPos.x, vPos.z);
      
      // Spiral streaks
      float spiral = sin(angle * 3.0 + depth * 20.0 - uTime * 4.0) * 0.5 + 0.5;
      spiral = pow(spiral, 4.0);
      
      // Star-like points
      float stars = hash(vec2(floor(angle * 20.0), floor(depth * 40.0 - uTime * 2.0)));
      stars = step(0.97, stars);
      
      // Depth fade
      float depthFade = smoothstep(0.0, 0.3, depth) * smoothstep(1.0, 0.4, depth);
      
      // Color - deep blue/purple space wormhole
      vec3 spaceColor = mix(vec3(0.01, 0.02, 0.08), vec3(0.05, 0.08, 0.2), depth);
      vec3 streakColor = mix(vec3(0.1, 0.4, 1.0), vec3(0.3, 0.2, 0.9), depth);
      vec3 starColor = vec3(0.8, 0.9, 1.0);
      
      vec3 col = spaceColor + streakColor * spiral * 0.3 + starColor * stars * 0.8;
      float alpha = depthFade * uAlpha * (0.3 + spiral * 0.2 + stars * 0.5);
      
      gl_FragColor = vec4(col, alpha);
    }
  `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
});

const tunnel = new THREE.Mesh(tunnelGeom, tunnelMat);
tunnel.name = 'wormholeTunnel';
tunnel.rotation.x = Math.PI / 2;
tunnel.position.z = -6;
scene.add(tunnel);

// ===== CENTRAL SPARK (initial) =====
const sparkGeom = new THREE.SphereGeometry(0.05, 16, 16);
const sparkMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.3, 0.7, 1.0),
    transparent: true,
    opacity: 0
});
const centralSpark = new THREE.Mesh(sparkGeom, sparkMat);
centralSpark.name = 'centralSpark';
scene.add(centralSpark);

// ===== VOLUMETRIC LIGHT RAYS (REMOVED - user requested no lines) =====
const lightRays = [];

// ===== EASING =====
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
function easeInQuart(t) { return t * t * t * t; }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

// ===== ANIMATION LOOP =====
const RING_RADIUS = 1.8;

function animate() {
    const delta = clock.getDelta();
    animTime += delta;

    // Phase calculations
    let portalScale = 0;
    let portalAlpha = 0;
    let sparkAlpha = 0;

    if (animTime < PHASE_EXPAND) {
        // Initial spark phase
        sparkAlpha = Math.min(animTime / 0.2, 1.0);
        portalScale = 0;
    } else if (animTime < PHASE_FULL) {
        // Expansion phase
        const t = (animTime - PHASE_EXPAND) / (PHASE_FULL - PHASE_EXPAND);
        const eased = easeOutQuart(t);
        portalScale = eased;
        portalAlpha = eased;
        sparkAlpha = 1.0 - t;
    } else if (animTime < PHASE_COLLAPSE) {
        // Full portal phase
        portalScale = 1.0;
        portalAlpha = 1.0;
        sparkAlpha = 0;
    } else if (animTime < PHASE_END) {
        // Collapse phase
        const t = (animTime - PHASE_COLLAPSE) / (PHASE_END - PHASE_COLLAPSE);
        const eased = easeInQuart(t);
        portalScale = 1.0 - eased;
        portalAlpha = 1.0 - eased;
        sparkAlpha = 0;
    } else {
        // Reset
        animTime = 0;
        // Reset ground sparks
        const gAlphas = groundGeom.attributes.aAlpha.array;
        for (let i = 0; i < groundCount; i++) gAlphas[i] = 0;
        groundGeom.attributes.aAlpha.needsUpdate = true;
    }

    // Central spark
    centralSpark.material.opacity = sparkAlpha;
    const sparkPulse = 1 + Math.sin(animTime * 30) * 0.3;
    centralSpark.scale.setScalar(sparkAlpha > 0 ? sparkPulse * (1 + portalScale * 2) : 0.001);

    // Glow ring
    glowRingMat.uniforms.uTime.value = animTime;
    glowRingMat.uniforms.uAlpha.value = portalAlpha;
    glowRingMat.uniforms.uScale.value = portalScale;

    outerGlowMat.uniforms.uTime.value = animTime;
    outerGlowMat.uniforms.uAlpha.value = portalAlpha * 0.6;
    outerGlowMat.uniforms.uScale.value = portalScale;

    // Tunnel
    tunnelMat.uniforms.uTime.value = animTime;
    tunnelMat.uniforms.uAlpha.value = portalAlpha * 0.8;
    tunnel.scale.setScalar(portalScale);

    // Ring particles
    const rPos = ringGeometry.attributes.position.array;
    for (let i = 0; i < ringParticleCount; i++) {
        const angle = ringData[i * 4] + animTime * ringData[i * 4 + 1];
        const rOff = ringData[i * 4 + 2];
        const phase = ringData[i * 4 + 3];

        const r = (RING_RADIUS + rOff + Math.sin(animTime * 3 + phase) * 0.15) * portalScale;
        const wobble = Math.sin(angle * 3 + animTime * 2 + phase) * 0.1 * portalScale;

        rPos[i * 3] = Math.cos(angle) * r;
        rPos[i * 3 + 1] = Math.sin(angle) * r + wobble;
        rPos[i * 3 + 2] = (Math.sin(angle * 2 + phase + animTime) * 0.15) * portalScale;
    }
    ringGeometry.attributes.position.needsUpdate = true;
    ringMaterial.uniforms.uGlobalAlpha.value = portalAlpha;

    // Spawn trail particles from ring
    if (portalAlpha > 0.1) {
        const spawnRate = Math.floor(30 * portalAlpha);
        for (let s = 0; s < spawnRate; s++) {
            const angle = Math.random() * Math.PI * 2;
            const r = RING_RADIUS * portalScale;
            const x = Math.cos(angle) * r + (Math.random() - 0.5) * 0.3;
            const y = Math.sin(angle) * r + (Math.random() - 0.5) * 0.3;
            const z = (Math.random() - 0.5) * 0.3;

            // Velocity: tangential + outward + gravity pull
            const tangentX = -Math.sin(angle) * 0.5;
            const tangentY = Math.cos(angle) * 0.5;
            const outX = Math.cos(angle) * (0.2 + Math.random() * 0.5);
            const outY = Math.sin(angle) * (0.2 + Math.random() * 0.5);

            spawnTrailParticle(
                x, y, z,
                (tangentX + outX) * 0.4,
                (tangentY + outY) * 0.4 - 0.1,
                (Math.random() - 0.5) * 0.2
            );
        }
    }

    // Update trail particles
    const tPos = trailGeom.attributes.position.array;
    const gravity = -1.2;
    for (let i = 0; i < trailCount; i++) {
        if (!trailActive[i]) continue;

        trailLifetimes[i * 2] += delta;
        if (trailLifetimes[i * 2] > trailLifetimes[i * 2 + 1]) {
            trailActive[i] = 0;
            tPos[i * 3 + 1] = -100;
            continue;
        }

        trailVelocities[i * 3 + 1] += gravity * delta;
        // Drag
        trailVelocities[i * 3] *= 0.995;
        trailVelocities[i * 3 + 1] *= 0.995;
        trailVelocities[i * 3 + 2] *= 0.995;

        tPos[i * 3] += trailVelocities[i * 3] * delta;
        tPos[i * 3 + 1] += trailVelocities[i * 3 + 1] * delta;
        tPos[i * 3 + 2] += trailVelocities[i * 3 + 2] * delta;

        // Ground collision
        if (tPos[i * 3 + 1] < -2.2) {
            tPos[i * 3 + 1] = -2.2;
            trailVelocities[i * 3 + 1] *= -0.2;
            trailVelocities[i * 3] *= 0.5;
            trailVelocities[i * 3 + 2] *= 0.5;
        }
    }
    trailGeom.attributes.position.needsUpdate = true;
    trailMaterial.uniforms.uGlobalAlpha.value = portalAlpha;

    // Ground spark accumulation
    const gAlphas = groundGeom.attributes.aAlpha.array;
    if (portalAlpha > 0.2 && animTime > PHASE_FULL) {
        const groundRate = 0.3;
        for (let i = 0; i < groundCount; i++) {
            if (gAlphas[i] < 1.0) {
                const distFromCenter = Math.abs(groundPos[i * 3]);
                const prob = (1.0 - distFromCenter / 3.0) * groundRate * delta;
                if (Math.random() < prob && gAlphas[i] < 0.8) {
                    gAlphas[i] += delta * 0.5;
                }
            }
            // Flicker
            const flicker = Math.sin(animTime * groundData[i * 2 + 1] + groundData[i * 2]) * 0.3 + 0.7;
            gAlphas[i] = Math.min(gAlphas[i], 0.8) * flicker;
        }
    } else if (animTime > PHASE_EXPAND && animTime < PHASE_FULL) {
        // During expansion, start showing some ground sparks
        const t = (animTime - PHASE_EXPAND) / (PHASE_FULL - PHASE_EXPAND);
        for (let i = 0; i < groundCount; i++) {
            if (Math.random() < 0.01 * t) {
                gAlphas[i] = Math.min(gAlphas[i] + delta * 0.3, 0.5 * t);
            }
            const flicker = Math.sin(animTime * groundData[i * 2 + 1] + groundData[i * 2]) * 0.3 + 0.7;
            gAlphas[i] *= flicker;
        }
    }

    // Fade ground sparks during collapse
    if (animTime > PHASE_COLLAPSE) {
        const fadeT = (animTime - PHASE_COLLAPSE) / (PHASE_END - PHASE_COLLAPSE);
        for (let i = 0; i < groundCount; i++) {
            gAlphas[i] *= (1.0 - fadeT);
        }
    }
    groundGeom.attributes.aAlpha.needsUpdate = true;
    groundMaterial.uniforms.uGlobalAlpha.value = Math.min(portalAlpha * 2, 1.0);

    // Light rays removed

    // Bloom adjustments
    bloomPass.strength = 1.5 + portalAlpha * 1.0;

    composer.render();
}

renderer.setAnimationLoop(animate);

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});