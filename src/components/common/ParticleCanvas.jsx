import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Custom Cosmic Purple & Orchid Wireframe Stardust Canvas.
 * Color Palette:
 * - #110515 (Deep Midnight Plum Void)
 * - #221545 (Deep Nebula Indigo)
 * - #B26FCB (Radiant Orchid Highlight)
 * - #68388D (Cosmic Purple Primary)
 * - #855AB4 (Medium Amethyst Secondary)
 * - #000000 (Pure Black Depth)
 */
export default function ParticleCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Deep Cosmic Fog (#110515)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x110515, 0.0011);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2200);
    camera.position.z = 620;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. 3D Wireframe Polyhedra Meshes
    // Main 3D Wireframe Icosahedron (#B26FCB - Radiant Orchid)
    const icoGeo = new THREE.IcosahedronGeometry(195, 2);
    const icoWire = new THREE.WireframeGeometry(icoGeo);
    const icoMat = new THREE.LineBasicMaterial({
      color: 0xB26FCB,
      transparent: true,
      opacity: 0.18,
      linewidth: 1
    });
    const icoMesh = new THREE.LineSegments(icoWire, icoMat);
    icoMesh.position.set(width > 1200 ? 340 : 0, 10, -40);
    scene.add(icoMesh);

    // Secondary Accent Wireframe Torus Orbit (#68388D - Cosmic Purple)
    const torusGeo = new THREE.TorusGeometry(275, 50, 14, 44);
    const torusWire = new THREE.WireframeGeometry(torusGeo);
    const torusMat = new THREE.LineBasicMaterial({
      color: 0x68388D,
      transparent: true,
      opacity: 0.16,
      linewidth: 1
    });
    const torusMesh = new THREE.LineSegments(torusWire, torusMat);
    torusMesh.position.set(width > 1200 ? 340 : 0, 10, -90);
    torusMesh.rotation.x = Math.PI / 3.2;
    scene.add(torusMesh);

    // Inner Core Wireframe Octahedron (#855AB4 - Amethyst)
    const octGeo = new THREE.OctahedronGeometry(95, 1);
    const octWire = new THREE.WireframeGeometry(octGeo);
    const octMat = new THREE.LineBasicMaterial({
      color: 0x855AB4,
      transparent: true,
      opacity: 0.25
    });
    const octMesh = new THREE.LineSegments(octWire, octMat);
    octMesh.position.set(width > 1200 ? 340 : 0, 10, -40);
    scene.add(octMesh);

    // Deep Cosmic Wireframe Horizon Grid (#221545 - Deep Nebula)
    const gridGeo = new THREE.PlaneGeometry(2600, 1800, 36, 28);
    const gridWire = new THREE.WireframeGeometry(gridGeo);
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x855AB4,
      transparent: true,
      opacity: 0.08
    });
    const gridMesh = new THREE.LineSegments(gridWire, gridMat);
    gridMesh.position.set(0, -360, -420);
    gridMesh.rotation.x = -Math.PI / 2.35;
    scene.add(gridMesh);

    // 4. Stardust Particle Constellation (#B26FCB, #855AB4, #68388D, #ffffff)
    const particleCount = 550;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorOrchid = new THREE.Color(0xB26FCB);
    const colorAmethyst = new THREE.Color(0x855AB4);
    const colorCosmic = new THREE.Color(0x68388D);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 1800;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1400;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1200;

      const rand = Math.random();
      const chosenColor = rand < 0.45 ? colorOrchid : rand < 0.75 ? colorAmethyst : rand < 0.9 ? colorCosmic : colorWhite;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Circular soft glowing star texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.35, 'rgba(178, 111, 203, 0.85)');
    gradient.addColorStop(0.7, 'rgba(104, 56, 141, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 4.4,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetMouseX = (event.clientX - windowHalfX) * 0.35;
      targetMouseY = (event.clientY - windowHalfY) * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const posX = width > 1200 ? 340 : 0;
      icoMesh.position.x = posX;
      torusMesh.position.x = posX;
      octMesh.position.x = posX;
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Parallax camera
      camera.position.x = mouseX * 0.55;
      camera.position.y = -mouseY * 0.55;
      camera.lookAt(scene.position);

      // Wireframe Meshes Gentle Rotation
      icoMesh.rotation.x += 0.0018;
      icoMesh.rotation.y += 0.003;

      torusMesh.rotation.z += 0.0025;
      torusMesh.rotation.y -= 0.0018;

      octMesh.rotation.y += 0.005;
      octMesh.rotation.x -= 0.003;

      // Horizon grid breathing
      gridMesh.position.y = -360 + Math.sin(elapsedTime * 0.4) * 14;

      // Particles slow drift
      particles.rotation.y = elapsedTime * 0.015;
      particles.rotation.x = elapsedTime * 0.008;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      icoGeo.dispose();
      icoWire.dispose();
      icoMat.dispose();
      torusGeo.dispose();
      torusWire.dispose();
      torusMat.dispose();
      octGeo.dispose();
      octWire.dispose();
      octMat.dispose();
      gridGeo.dispose();
      gridWire.dispose();
      gridMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-1000 overflow-hidden"
      aria-hidden="true"
    />
  );
}
