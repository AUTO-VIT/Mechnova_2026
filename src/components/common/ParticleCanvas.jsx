import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Galaxy Space Wireframe & Cosmic Stardust Canvas powered by Three.js.
 * Features rotating galaxy-cyan & electric-blue wireframe polyhedra,
 * deep space horizon mesh, floating nebula particles, and cursor-reactive 3D parallax.
 */
export default function ParticleCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Deep Space Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.0011);

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

    // 3. Galaxy 3D Wireframe Polyhedra
    // Main 3D Wireframe Icosahedron (Galaxy Cyan Orbital)
    const icoGeo = new THREE.IcosahedronGeometry(190, 2);
    const icoWire = new THREE.WireframeGeometry(icoGeo);
    const icoMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8, // Galaxy Cyan
      transparent: true,
      opacity: 0.16,
      linewidth: 1
    });
    const icoMesh = new THREE.LineSegments(icoWire, icoMat);
    icoMesh.position.set(width > 1200 ? 340 : 0, 10, -40);
    scene.add(icoMesh);

    // Secondary Accent Galaxy Blue Wireframe Torus
    const torusGeo = new THREE.TorusGeometry(270, 48, 14, 44);
    const torusWire = new THREE.WireframeGeometry(torusGeo);
    const torusMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6, // Electric Galaxy Blue
      transparent: true,
      opacity: 0.14,
      linewidth: 1
    });
    const torusMesh = new THREE.LineSegments(torusWire, torusMat);
    torusMesh.position.set(width > 1200 ? 340 : 0, 10, -90);
    torusMesh.rotation.x = Math.PI / 3.2;
    scene.add(torusMesh);

    // Inner Core Nebula Wireframe Octahedron
    const octGeo = new THREE.OctahedronGeometry(90, 1);
    const octWire = new THREE.WireframeGeometry(octGeo);
    const octMat = new THREE.LineBasicMaterial({
      color: 0x818cf8, // Indigo Nebula
      transparent: true,
      opacity: 0.22
    });
    const octMesh = new THREE.LineSegments(octWire, octMat);
    octMesh.position.set(width > 1200 ? 340 : 0, 10, -40);
    scene.add(octMesh);

    // Deep Space Wireframe Horizon Grid Plane
    const gridGeo = new THREE.PlaneGeometry(2600, 1800, 36, 28);
    const gridWire = new THREE.WireframeGeometry(gridGeo);
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.05
    });
    const gridMesh = new THREE.LineSegments(gridWire, gridMat);
    gridMesh.position.set(0, -360, -420);
    gridMesh.rotation.x = -Math.PI / 2.35;
    scene.add(gridMesh);

    // 4. Galaxy Stardust & Particle Constellation
    const particleCount = 550;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x38bdf8);
    const colorBlue = new THREE.Color(0x60a5fa);
    const colorIndigo = new THREE.Color(0xa5b4fc);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 1800;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1400;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1200;

      // Random galactic color
      const rand = Math.random();
      const chosenColor = rand < 0.45 ? colorCyan : rand < 0.8 ? colorBlue : colorIndigo;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Custom circular soft glowing star texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
    gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 4.2,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
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
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Parallax camera
      camera.position.x = mouseX * 0.55;
      camera.position.y = -mouseY * 0.55;
      camera.lookAt(scene.position);

      // Wireframe Meshes Gentle Cosmic Rotation
      icoMesh.rotation.x += 0.0018;
      icoMesh.rotation.y += 0.003;

      torusMesh.rotation.z += 0.0025;
      torusMesh.rotation.y -= 0.0018;

      octMesh.rotation.y += 0.005;
      octMesh.rotation.x -= 0.003;

      // Horizon grid breathing
      gridMesh.position.y = -360 + Math.sin(elapsedTime * 0.4) * 14;

      // Galaxy particles slow drift
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
