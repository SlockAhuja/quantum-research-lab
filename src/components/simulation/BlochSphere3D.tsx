/**
 * Quantum Research Lab (QRL) - Interactive 3D Bloch Sphere
 * Rendered using Three.js with full orbit drag, coordinate axes,
 * statevector arrow, equatorial projection, and polar coordinate readouts.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BlochVector } from '../../types/quantum';
import { Compass, RotateCcw } from 'lucide-react';

interface BlochSphere3DProps {
  blochVector: BlochVector;
  qubitIndex: number;
  totalQubits: number;
  onSelectQubit?: (index: number) => void;
  readoutPrecision?: number;
}

export const BlochSphere3D: React.FC<BlochSphere3DProps> = ({
  blochVector,
  qubitIndex,
  totalQubits,
  onSelectQubit,
  readoutPrecision = 3,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const arrowGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphereGroupRef = useRef<THREE.Group | null>(null);

  const [activeView, setActiveView] = useState<'3d' | 'z' | 'x' | 'y'>('3d');

  const { u, v, w, theta, phi, purity } = blochVector;

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.4, 1.8, 2.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Root Group for interactive rotation
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    sphereGroupRef.current = rootGroup;

    // Sphere shell (transparent)
    const sphereRadius = 1.0;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      wireframe: false,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    rootGroup.add(sphereMesh);

    // Wireframe longitude and latitude rings
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.45,
    });

    // Equator ring (in X-Z plane where Three.js Y is Up, representing physics Z)
    // In our mapping:
    // Three.Y = Physics Z (North pole |0>, South pole |1>)
    // Three.X = Physics X (|+>, |->)
    // Three.Z = Physics Y (|+i>, |-i>)
    const equatorGeo = new THREE.BufferGeometry();
    const equatorPoints: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      equatorPoints.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)));
    }
    equatorGeo.setFromPoints(equatorPoints);
    const equatorLine = new THREE.Line(equatorGeo, new THREE.LineBasicMaterial({ color: 0x06b6d4, opacity: 0.7, transparent: true }));
    rootGroup.add(equatorLine);

    // Meridian X-Z (Physics X-Z)
    const meridian1Geo = new THREE.BufferGeometry();
    const meridian1Points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      meridian1Points.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0));
    }
    meridian1Geo.setFromPoints(meridian1Points);
    const meridian1Line = new THREE.Line(meridian1Geo, ringMat);
    rootGroup.add(meridian1Line);

    // Meridian Y-Z (Physics Y-Z)
    const meridian2Geo = new THREE.BufferGeometry();
    const meridian2Points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      meridian2Points.push(new THREE.Vector3(0, Math.sin(angle), Math.cos(angle)));
    }
    meridian2Geo.setFromPoints(meridian2Points);
    const meridian2Line = new THREE.Line(meridian2Geo, ringMat);
    rootGroup.add(meridian2Line);

    // Coordinate Axes lines
    // Z axis (Vertical: Three.js Y) -> length 1.25
    const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.25, 0),
      new THREE.Vector3(0, 1.25, 0),
    ]);
    const zAxisLine = new THREE.Line(zAxisGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8 }));
    rootGroup.add(zAxisLine);

    // X axis (Three.js X) -> length 1.25
    const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.25, 0, 0),
      new THREE.Vector3(1.25, 0, 0),
    ]);
    const xAxisLine = new THREE.Line(xAxisGeo, new THREE.LineBasicMaterial({ color: 0xa855f7 }));
    rootGroup.add(xAxisLine);

    // Y axis (Three.js Z) -> length 1.25
    const yAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -1.25),
      new THREE.Vector3(0, 0, 1.25),
    ]);
    const yAxisLine = new THREE.Line(yAxisGeo, new THREE.LineBasicMaterial({ color: 0x10b981 }));
    rootGroup.add(yAxisLine);

    // Arrow Group (statevector representation)
    const arrowGroup = new THREE.Group();
    rootGroup.add(arrowGroup);
    arrowGroupRef.current = arrowGroup;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update State Vector Arrow and Projections when coordinates change
  useEffect(() => {
    const arrowGroup = arrowGroupRef.current;
    if (!arrowGroup) return;

    // Clear previous children
    while (arrowGroup.children.length > 0) {
      arrowGroup.remove(arrowGroup.children[0]);
    }

    // Mapping:
    // Physics Z (w) -> Three.js Y
    // Physics X (u) -> Three.js X
    // Physics Y (v) -> Three.js Z
    const targetX = u;
    const targetY = w;
    const targetZ = v;
    const vectorLength = Math.sqrt(targetX * targetX + targetY * targetY + targetZ * targetZ);

    if (vectorLength > 0.001) {
      const dir = new THREE.Vector3(targetX, targetY, targetZ).normalize();
      const origin = new THREE.Vector3(0, 0, 0);

      // Arrow helper
      const arrowHelper = new THREE.ArrowHelper(
        dir,
        origin,
        vectorLength,
        0x06b6d4, // Cyan arrow
        0.16, // Head length
        0.08 // Head width
      );
      arrowGroup.add(arrowHelper);

      // Tip sphere marker
      const tipGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const tipMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.set(targetX, targetY, targetZ);
      arrowGroup.add(tipMesh);

      // Projection line to equator (X-Z plane where Three.Y = 0)
      const projLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(targetX, targetY, targetZ),
        new THREE.Vector3(targetX, 0, targetZ),
      ]);
      const projLine = new THREE.Line(
        projLineGeo,
        new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.05, gapSize: 0.03 })
      );
      projLine.computeLineDistances();
      arrowGroup.add(projLine);

      // Equatorial shadow line from origin to projected point
      const baseLineGeo = new THREE.BufferGeometry().setFromPoints([
        origin,
        new THREE.Vector3(targetX, 0, targetZ),
      ]);
      const baseLine = new THREE.Line(
        baseLineGeo,
        new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.6 })
      );
      arrowGroup.add(baseLine);
    } else {
      // Mixed state at center: small origin marker
      const centerGeo = new THREE.SphereGeometry(0.05, 16, 16);
      const centerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const centerMesh = new THREE.Mesh(centerGeo, centerMat);
      arrowGroup.add(centerMesh);
    }
  }, [u, v, w]);

  // Mouse drag orbit controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !sphereGroupRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    sphereGroupRef.current.rotation.y += deltaX * 0.008;
    sphereGroupRef.current.rotation.x += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetCameraView = (view: '3d' | 'z' | 'x' | 'y') => {
    setActiveView(view);
    if (!cameraRef.current || !sphereGroupRef.current) return;

    // Reset group rotation
    sphereGroupRef.current.rotation.set(0, 0, 0);

    switch (view) {
      case '3d':
        cameraRef.current.position.set(2.4, 1.8, 2.4);
        break;
      case 'z': // Top-down view (Z axis)
        cameraRef.current.position.set(0, 3.2, 0.001);
        break;
      case 'x': // Side view along X
        cameraRef.current.position.set(3.2, 0, 0);
        break;
      case 'y': // Front view along Y
        cameraRef.current.position.set(0, 0, 3.2);
        break;
    }
    cameraRef.current.lookAt(0, 0, 0);
  };

  const isMixed = purity < 0.99;

  return (
    <div className="flex flex-col h-full bg-[#0d121f] rounded-lg border border-slate-800 p-3 select-none">
      {/* Top Bar: Title & Qubit Selector */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">Bloch Sphere Representation</span>
        </div>

        {totalQubits > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Target Qubit:</span>
            <div className="flex bg-slate-900 border border-slate-700 rounded p-0.5">
              {Array.from({ length: totalQubits }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQubit?.(idx)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                    qubitIndex === idx
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  q[{idx}]
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3D Canvas Viewport */}
      <div
        className="relative flex-1 min-h-[220px] rounded bg-[#07090e] border border-slate-800/80 cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={mountRef} className="w-full h-full" />

        {/* HUD Poles Overlay */}
        <div className="absolute top-2 left-2 pointer-events-none text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          <div className="text-cyan-400 font-semibold mb-0.5">POLE ANNOTATIONS</div>
          <div>+Z: |0⟩ (North)</div>
          <div>-Z: |1⟩ (South)</div>
          <div>+X: |+⟩ &nbsp;|&nbsp; +Y: |+i⟩</div>
        </div>

        {/* View Angle Preset Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={() => resetCameraView('3d')}
            title="Reset to Isometric 3D"
            className={`p-1.5 rounded text-[10px] font-mono border transition-colors ${
              activeView === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={() => resetCameraView('z')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              activeView === 'z'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Z (Top)
          </button>
          <button
            onClick={() => resetCameraView('x')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              activeView === 'x'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            X (Side)
          </button>
          <button
            onClick={() => resetCameraView('y')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              activeView === 'y'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Y (Front)
          </button>
        </div>

        {/* Drag to rotate hint */}
        <div className="absolute bottom-2 left-2 pointer-events-none text-[10px] text-slate-500 font-mono">
          Drag to rotate 3D view
        </div>
      </div>

      {/* Coordinate & Angle Scientific Telemetry Strip */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-xs">
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] uppercase font-mono text-slate-400">Bloch Vector (u, v, w)</div>
          <div className="font-mono text-cyan-300 text-[11px] tabular-nums mt-0.5">
            ({u.toFixed(readoutPrecision)}, {v.toFixed(readoutPrecision)}, {w.toFixed(readoutPrecision)})
          </div>
        </div>

        <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] uppercase font-mono text-slate-400">Spherical Angles</div>
          <div className="font-mono text-slate-200 text-[11px] tabular-nums mt-0.5">
            θ: {(theta * (180 / Math.PI)).toFixed(1)}° &nbsp;·&nbsp; φ: {(phi * (180 / Math.PI)).toFixed(1)}°
          </div>
        </div>

        <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] uppercase font-mono text-slate-400">Subsystem State</div>
          <div className="font-mono text-[11px] tabular-nums mt-0.5">
            {isMixed ? (
              <span className="text-amber-400">Mixed State (r={Math.sqrt(u * u + v * v + w * w).toFixed(2)})</span>
            ) : (
              <span className="text-emerald-400">Pure State (r=1.000)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
