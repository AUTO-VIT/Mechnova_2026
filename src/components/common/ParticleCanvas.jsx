import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Interactive 3D Wireframe & Particle Canvas powered by Three.js.
 * Renders rotating cybernetic wireframe geometries, floating particle constellations,
 * and mouse-responsive 3D parallax depth.
 */
export default function ParticleCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030303, 0.0012);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
    camera.position.z = 600;

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

    // 3. 3D Wireframe Geometric Meshes
    // Main 3D Wireframe Icosahedron (Frontier Autonomous Mesh)
    const icoGeo = new THREE.IcosahedronGeometry(180, 2);
    const icoWire = new THREE.WireframeGeometry(icoGeo);
    const icoMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      linewidth: 1
    });
    const icoMesh = new THREE.LineSegments(icoWire, icoMat);
    icoMesh.position.set(width > 1200 ? 320 : 0, 0, -50);
    scene.add(icoMesh);

    // Secondary Accent Red Wireframe Torus (Cybernetic Interlock)
    const torusGeo = new THREE.TorusGeometry(260, 45, 12, 40);
    const torusWire = new THREE.WireframeGeometry(torusGeo);
    const torusMat = new THREE.LineBasicMaterial({
      color: 0xdc2626,
      transparent: true,
      opacity: 0.09,
      linewidth: 1
    });
    const torusMesh = new THREE.LineSegments(torusWire, torusMat);
    torusMesh.position.set(width > 1200 ? 320 : 0, 0, -100);
    torusMesh.rotation.x = Math.PI / 3;
    scene.add(torusMesh);

    // Tertiary Background Wireframe Horizon Grid Plane
    const gridGeo = new THREE.PlaneGeometry(2400, 1600, 32, 24);
    const gridWire = new THREE.WireframeGeometry(gridGeo);
    const gridMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.04
    });
    const gridMesh = new THREE.LineSegments(gridWire, gridMat);
    gridMesh.position.set(0, -350, -400);
    gridMesh.rotation.x = -Math.PI / 2.3;
    scene.add(gridMesh);

    // 4. 3D Floating Particle Constellation
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 1600;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
      particleScales[i] = Math.random() * 2 + 1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Custom circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3.5,
      map: particleTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interactive Mouse Parallax & Inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetMouseX = (event.clientX - windowHalfX) * 0.4;
      targetMouseY = (event.clientY - windowHalfY) * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Responsive Window Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Re-center meshes for mobile vs 1080p widescreen
      const posX = width > 1200 ? 320 : 0;
      icoMesh.position.x = posX;
      torusMesh.position.x = posX;
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation (Damping)
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Parallax camera rotation
      camera.position.x = mouseX * 0.6;
      camera.position.y = -mouseY * 0.6;
      camera.lookAt(scene.position);

      // Wireframe Meshes Gentle Rotation
      icoMesh.rotation.x += 0.002;
      icoMesh.rotation.y += 0.0035;

      torusMesh.rotation.z += 0.003;
      torusMesh.rotation.y -= 0.002;

      // Grid wave breathing effect
      gridMesh.position.y = -350 + Math.sin(elapsedTime * 0.5) * 12;

      // Drifting Particles Rotation
      particles.rotation.y = elapsedTime * 0.02;
      particles.rotation.x = elapsedTime * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup on Unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose Three.js memory
      icoGeo.dispose();
      icoWire.dispose();
      icoMat.dispose();
      torusGeo.dispose();
      torusWire.dispose();
      torusMat.dispose();
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
      className="fixed inset-0 pointer-events-none z-0 opacity-70 transition-opacity duration-1000 overflow-hidden"
      aria-hidden="true"
    />
  );
}
