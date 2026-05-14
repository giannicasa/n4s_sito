import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Raw Three.js implementation (no @react-three/fiber JSX hosts).
// Avoids JSX dev plugins that conflict with R3F's applyProps.
export const Hero3D = ({ className = "" }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050505");
    scene.fog = new THREE.Fog("#050505", 4, 14);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const violet = new THREE.PointLight(0x9d4cdd, 25, 30);
    violet.position.set(4, 4, 5);
    scene.add(violet);
    const white = new THREE.PointLight(0xffffff, 8, 25);
    white.position.set(-5, -3, -3);
    scene.add(white);

    // Morph sphere
    const sphereGeom = new THREE.IcosahedronGeometry(1.35, 32);
    const basePositions = sphereGeom.attributes.position.array.slice();
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c10,
      emissive: new THREE.Color(0x9d4cdd),
      emissiveIntensity: 0.35,
      metalness: 1.0,
      roughness: 0.25
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    scene.add(sphere);

    // Wireframe halo
    const wireGeom = new THREE.IcosahedronGeometry(1.55, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x9d4cdd,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const wire = new THREE.Mesh(wireGeom, wireMat);
    scene.add(wire);

    // Rings
    const ringGroup = new THREE.Group();
    [2.5, 2.95, 3.5].forEach((r, i) => {
      const tg = new THREE.TorusGeometry(r, 0.005, 16, 220);
      const tm = new THREE.MeshBasicMaterial({
        color: 0x9d4cdd,
        transparent: true,
        opacity: 0.32 - i * 0.08
      });
      const ring = new THREE.Mesh(tg, tm);
      ring.rotation.x = Math.PI / 2;
      ringGroup.add(ring);
    });
    scene.add(ringGroup);

    // Stars
    const starCount = 900;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      let x, y, z, d;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        d = x * x + y * y + z * z;
      } while (d > 1 || d < 0.05);
      starPositions[i * 3] = x * 6;
      starPositions[i * 3 + 1] = y * 6;
      starPositions[i * 3 + 2] = z * 6;
    }
    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x9d4cdd,
      size: 0.018,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    // Mouse
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const onMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // Animate
    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      const t = clock.getElapsedTime();

      // Morph displace via vertex positions
      const pos = sphere.geometry.attributes.position;
      const arr = pos.array;
      for (let i = 0; i < arr.length; i += 3) {
        const ox = basePositions[i];
        const oy = basePositions[i + 1];
        const oz = basePositions[i + 2];
        const n = Math.sin(ox * 2 + t) * Math.cos(oy * 2 + t * 0.7) * Math.sin(oz * 2 + t * 0.9);
        const k = 1 + n * 0.06;
        arr[i] = ox * k;
        arr[i + 1] = oy * k;
        arr[i + 2] = oz * k;
      }
      pos.needsUpdate = true;

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      sphere.position.x = targetX * 0.4;
      sphere.position.y = targetY * 0.25;
      wire.position.copy(sphere.position);

      sphere.rotation.x = t * 0.18;
      sphere.rotation.y = t * 0.25;
      wire.rotation.x = -t * 0.12;
      wire.rotation.y = -t * 0.18;

      ringGroup.rotation.z = t * 0.1;
      ringGroup.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.08;

      stars.rotation.y = t * 0.02;
      stars.rotation.x = t * 0.015;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      sphereGeom.dispose();
      sphereMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      starGeom.dispose();
      starMat.dispose();
      ringGroup.children.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 ${className}`}
      aria-hidden="true"
      data-testid="hero-3d-canvas"
    />
  );
};

export default Hero3D;
