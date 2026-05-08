/**
 * Three.js Background — Subtle Starfield + Warp Mode
 */

import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let warpActive = false;
let warpSpeed = 0;
let stars = null;
let starsMaterial = null;
let camera = null;

export function triggerWarp() {
  warpActive = true;
  warpSpeed = 0;
}

export function initThreeBackground() {
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  if (isLowEnd) return;

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // ─── Scene Setup ───
  const scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Show canvas immediately (for preloader warp)
  canvas.classList.add('visible');

  // ─── Star Particles ───
  const STAR_COUNT = isMobile ? 400 : 1200;
  const starsGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const origPositions = new Float32Array(STAR_COUNT * 3); // Store originals for reset

  for (let i = 0; i < STAR_COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 50;
    positions[i3 + 1] = (Math.random() - 0.5) * 50;
    positions[i3 + 2] = (Math.random() - 0.5) * 50 - 10;

    origPositions[i3]     = positions[i3];
    origPositions[i3 + 1] = positions[i3 + 1];
    origPositions[i3 + 2] = positions[i3 + 2];

    sizes[i] = Math.random() * 1.5 + 0.3;
    phases[i] = Math.random() * Math.PI * 2;
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starsGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  starsGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  starsMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uWarp: { value: 0.0 }, // 0 = normal, 1 = full warp
    },
    vertexShader: `
      attribute float aSize;
      attribute float aPhase;
      varying float vAlpha;
      varying float vWarp;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uWarp;

      void main() {
        // Twinkle
        float twinkle = sin(uTime * 0.4 + aPhase) * 0.5 + 0.5;
        vAlpha = 0.1 + twinkle * 0.2;
        vWarp = uWarp;

        // During warp, boost alpha
        vAlpha = mix(vAlpha, 0.6 + twinkle * 0.4, uWarp);

        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        float baseSize = aSize * uPixelRatio * (150.0 / -mvPos.z);

        // During warp, stretch point size
        baseSize = mix(baseSize, baseSize * 3.0, uWarp);
        gl_PointSize = clamp(baseSize, 0.5, 8.0);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vWarp;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        if (d > 0.5) discard;

        // During warp, make stars into streaks (elongate vertically)
        float streak = mix(1.0, smoothstep(0.5, 0.0, abs(uv.y) * 2.0), vWarp * 0.7);
        float alpha = smoothstep(0.5, 0.05, d) * vAlpha * streak;

        // Slight blue-white color, whiter during warp
        vec3 color = mix(vec3(0.85, 0.88, 0.95), vec3(0.95, 0.97, 1.0), vWarp);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // ─── Mouse Parallax ───
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ─── Scroll Depth ───
  let scrollProgress = 0;
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => { scrollProgress = self.progress; },
  });

  // ─── Animation Loop ───
  const clock = new THREE.Clock();
  const posAttr = starsGeometry.getAttribute('position');

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    starsMaterial.uniforms.uTime.value = elapsed;

    if (warpActive) {
      // Accelerate warp
      warpSpeed = Math.min(warpSpeed + 0.008, 1.0);
      starsMaterial.uniforms.uWarp.value = warpSpeed;

      // Move stars toward camera (z+) for warp rush
      for (let i = 0; i < STAR_COUNT; i++) {
        const i3 = i * 3;
        posAttr.array[i3 + 2] += warpSpeed * 2.0;

        // Reset star if it passes camera
        if (posAttr.array[i3 + 2] > 10) {
          posAttr.array[i3 + 2] = -40 - Math.random() * 20;
          posAttr.array[i3] = (Math.random() - 0.5) * 50;
          posAttr.array[i3 + 1] = (Math.random() - 0.5) * 50;
        }
      }
      posAttr.needsUpdate = true;

      // Increase FOV during warp for stretch feel
      camera.fov = 60 + warpSpeed * 40;
      camera.updateProjectionMatrix();

      // After warp completes, slow down
      if (warpSpeed >= 1.0) {
        warpActive = false;
        // Gradually return to normal
        const returnInterval = setInterval(() => {
          warpSpeed = Math.max(warpSpeed - 0.02, 0);
          starsMaterial.uniforms.uWarp.value = warpSpeed;
          camera.fov = 60 + warpSpeed * 40;
          camera.updateProjectionMatrix();
          if (warpSpeed <= 0) clearInterval(returnInterval);
        }, 30);
      }
    } else {
      // Normal mode
      stars.rotation.y = elapsed * 0.008;
      stars.rotation.x = elapsed * 0.004;

      camera.position.x += (mouseX * 0.15 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.15 - camera.position.y) * 0.03;
      camera.position.z = 5 - scrollProgress * 1.5;
    }

    renderer.render(scene, camera);
  }

  animate();

  // ─── Resize ───
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}
