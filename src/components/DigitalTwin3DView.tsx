import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Layers,
  RotateCcw,
  Eye,
  Maximize2,
  Box,
  Compass,
  Radio,
  Sliders,
  Shield,
  Activity,
  Flame,
} from 'lucide-react';
import { SensorTelemetry, CameraFeed, CustomPoint3D } from '../types/metropolis';

interface DigitalTwin3DViewProps {
  sensors: SensorTelemetry[];
  activeSensorId?: string;
  cameras?: CameraFeed[];
  customPointCloud?: CustomPoint3D[] | null;
  onOpenDataHub?: () => void;
  onTargetSelect?: (target: { id: string; type: string; coords: [number, number, number] }) => void;
}

export const DigitalTwin3DView: React.FC<DigitalTwin3DViewProps> = ({
  sensors,
  activeSensorId,
  cameras = [],
  customPointCloud,
  onOpenDataHub,
  onTargetSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLidarCloud, setShowLidarCloud] = useState<boolean>(true);
  const [showCameraFrustums, setShowCameraFrustums] = useState<boolean>(true);
  const [showRadarVectors, setShowRadarVectors] = useState<boolean>(true);
  const [showThermalOverlay, setShowThermalOverlay] = useState<boolean>(false);
  const [perspectiveMode, setPerspectiveMode] = useState<'orbit' | 'topDown'>('orbit');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(60);

  // References for scene manipulation across frames
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const pointCloudRef = useRef<THREE.Points | null>(null);
  const frustumsGroupRef = useRef<THREE.Group | null>(null);
  const targetsGroupRef = useRef<THREE.Group | null>(null);
  const vectorsGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Mouse interaction state for manual orbit controls without external libraries
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 48,
    theta: Math.PI / 4,
    phi: Math.PI / 3.2,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 460;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080d);
    scene.fog = new THREE.FogExp2(0x06080d, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x76b900, 1.2);
    dirLight.position.set(25, 40, 20);
    scene.add(dirLight);

    const blueLight = new THREE.DirectionalLight(0x0284c7, 0.8);
    blueLight.position.set(-25, 30, -20);
    scene.add(blueLight);

    // 5. Ground Grid & Range Rings
    const gridHelper = new THREE.GridHelper(70, 35, 0x76b900, 0x1f2937);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Range rings (10m, 20m, 30m)
    [10, 20, 30].forEach((radius) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x76b900,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.02;
      scene.add(ringMesh);
    });

    // 6. LiDAR Point Cloud Generation
    const POINT_COUNT = customPointCloud && customPointCloud.length > 0 ? customPointCloud.length : 7500;
    const positions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);

    const colorGreen = new THREE.Color(0x76b900);
    const colorCyan = new THREE.Color(0x06b6d4);
    const colorYellow = new THREE.Color(0xeab308);
    const colorRed = new THREE.Color(0xf43f5e);

    if (customPointCloud && customPointCloud.length > 0) {
      for (let i = 0; i < POINT_COUNT; i++) {
        const pt = customPointCloud[i];
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;

        let c = colorGreen;
        if (pt.colorHex) {
          c = new THREE.Color(pt.colorHex);
        } else if (pt.y > 3.0) {
          c = colorRed;
        } else if (pt.y > 1.8) {
          c = colorYellow;
        } else if (pt.y > 0.6) {
          c = colorCyan;
        }

        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
    } else {
      for (let i = 0; i < POINT_COUNT; i++) {
        // Distribute in concentric circular facility patterns with obstacles/structures
        const angle = Math.random() * Math.PI * 2;
        const dist = 3 + Math.pow(Math.random(), 0.75) * 32;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        // Height with layered structures (walls, equipment, ground reflection)
        let y = 0.05 + Math.random() * 0.4;
        const isStructure = Math.random() < 0.22;
        if (isStructure) {
          y = Math.random() * 4.5;
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Color mapping by elevation / anomaly
        let c = colorGreen;
        if (y > 3.0) {
          c = colorRed;
        } else if (y > 1.8) {
          c = colorYellow;
        } else if (y > 0.6) {
          c = colorCyan;
        }

        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
    }

    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pointMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const pointCloud = new THREE.Points(pointGeo, pointMat);
    scene.add(pointCloud);
    pointCloudRef.current = pointCloud;

    // 7. Tracked Targets Group (3D Bounding Boxes + Directional Cones)
    const targetsGroup = new THREE.Group();
    scene.add(targetsGroup);
    targetsGroupRef.current = targetsGroup;

    // Mock targets
    const TARGETS_DATA = [
      { id: 'TGT-01', type: 'Forklift-Heavy', x: 8, z: -12, y: 1.2, w: 2.4, h: 2.4, d: 3.5, color: 0x76b900, vx: 1.5, vz: -0.8 },
      { id: 'TGT-02', type: 'Person-Worker', x: -6, z: 9, y: 0.9, w: 0.8, h: 1.8, d: 0.8, color: 0x38bdf8, vx: 0.4, vz: 0.6 },
      { id: 'TGT-03', type: 'Autonomous-Cart', x: -14, z: -8, y: 0.6, w: 1.4, h: 1.2, d: 2.0, color: 0xa855f7, vx: -0.9, vz: 1.1 },
      { id: 'TGT-04', type: 'Anomaly-Intrusion', x: 16, z: 14, y: 1.0, w: 1.2, h: 2.0, d: 1.2, color: 0xf43f5e, vx: 0.1, vz: -0.2 },
    ];

    TARGETS_DATA.forEach((tgt) => {
      // Wireframe bounding box
      const boxGeo = new THREE.BoxGeometry(tgt.w, tgt.h, tgt.d);
      const wireMat = new THREE.MeshBasicMaterial({
        color: tgt.color,
        wireframe: true,
      });
      const boxMesh = new THREE.Mesh(boxGeo, wireMat);
      boxMesh.position.set(tgt.x, tgt.y, tgt.z);
      boxMesh.name = tgt.id;

      // Solid translucent core
      const coreMat = new THREE.MeshStandardMaterial({
        color: tgt.color,
        transparent: true,
        opacity: 0.2,
      });
      const coreMesh = new THREE.Mesh(boxGeo, coreMat);
      boxMesh.add(coreMesh);

      // Label pin / pole
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
      const poleMat = new THREE.MeshBasicMaterial({ color: tgt.color });
      const poleMesh = new THREE.Mesh(poleGeo, poleMat);
      poleMesh.position.set(0, tgt.h / 2 + 0.6, 0);
      boxMesh.add(poleMesh);

      // Radar velocity vector arrow
      const dir = new THREE.Vector3(tgt.vx, 0, tgt.vz).normalize();
      const length = Math.sqrt(tgt.vx * tgt.vx + tgt.vz * tgt.vz) * 3;
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), length, tgt.color, 0.6, 0.3);
      arrow.position.set(tgt.x, 0.1, tgt.z);
      scene.add(arrow);

      targetsGroup.add(boxMesh);
    });

    // 8. Camera Frustums Group (Projected coverage cones from 4 corners)
    const frustumsGroup = new THREE.Group();
    scene.add(frustumsGroup);
    frustumsGroupRef.current = frustumsGroup;

    const CAMERA_POSITIONS = [
      { x: -22, y: 12, z: -22, targetX: -5, targetZ: -5, color: 0x76b900, name: 'CAM-01-NORTH' },
      { x: 22, y: 12, z: -22, targetX: 6, targetZ: -6, color: 0x38bdf8, name: 'CAM-02-EAST' },
      { x: 22, y: 12, z: 22, targetX: 6, targetZ: 6, color: 0xa855f7, name: 'CAM-03-SOUTH' },
      { x: -22, y: 12, z: 22, targetX: -6, targetZ: 6, color: 0xf59e0b, name: 'CAM-04-WEST' },
    ];

    CAMERA_POSITIONS.forEach((cam) => {
      // Camera pole & head
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, cam.y),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      pole.position.set(cam.x, cam.y / 2, cam.z);
      frustumsGroup.add(pole);

      // Camera body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.5, 1.2),
        new THREE.MeshStandardMaterial({ color: cam.color })
      );
      body.position.set(cam.x, cam.y, cam.z);
      body.lookAt(cam.targetX, 0, cam.targetZ);
      frustumsGroup.add(body);

      // Frustum cone lines
      const coneGeo = new THREE.ConeGeometry(9, 22, 4, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: cam.color,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(cam.x, cam.y / 2, cam.z);
      cone.rotation.x = Math.PI;
      cone.lookAt(cam.targetX, 0, cam.targetZ);
      frustumsGroup.add(cone);
    });

    // 9. Animation & FPS loop
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Gentle rotation when in orbit and not dragging
      if (!isDraggingRef.current && perspectiveMode === 'orbit') {
        sphericalRef.current.theta += 0.0012;
        updateCameraPosition();
      }

      // Dynamic oscillation for radar & targets
      const t = performance.now() * 0.001;
      if (targetsGroupRef.current) {
        targetsGroupRef.current.children.forEach((child, idx) => {
          child.position.y = 1.0 + Math.sin(t * 2 + idx) * 0.1;
        });
      }

      // FPS Calculation
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight || 460;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      pointGeo.dispose();
      pointMat.dispose();
    };
  }, [customPointCloud]);

  // Update camera coordinates based on spherical angles
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, Math.max(y, 4), z);
    cameraRef.current.lookAt(0, 1.5, 0);
  };

  // Mouse Orbit Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || perspectiveMode === 'topDown') return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= dx * 0.007;
    sphericalRef.current.phi = Math.max(
      0.15,
      Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - dy * 0.007)
    );
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(
      15,
      Math.min(100, sphericalRef.current.radius + e.deltaY * 0.05)
    );
    updateCameraPosition();
  };

  // Toggle handlers for layers
  const handleToggleLidar = () => {
    setShowLidarCloud((prev) => {
      const next = !prev;
      if (pointCloudRef.current) pointCloudRef.current.visible = next;
      return next;
    });
  };

  const handleToggleCameraFrustums = () => {
    setShowCameraFrustums((prev) => {
      const next = !prev;
      if (frustumsGroupRef.current) frustumsGroupRef.current.visible = next;
      return next;
    });
  };

  const handleSetTopDown = () => {
    setPerspectiveMode('topDown');
    sphericalRef.current = { radius: 50, theta: 0, phi: 0.01 };
    updateCameraPosition();
  };

  const handleSetOrbit = () => {
    setPerspectiveMode('orbit');
    sphericalRef.current = { radius: 48, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-[480px] bg-[#06080D] rounded-2xl overflow-hidden border border-white/[0.08] select-none">
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-xs font-mono text-white flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#76B900] animate-pulse" />
            <span className="font-bold">METROPOLIS 3D DIGITAL TWIN</span>
            <span className="text-gray-500">|</span>
            <span className="text-[#88D600]">{fps} FPS</span>
          </div>

          <div className="hidden sm:flex items-center px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono text-gray-400">
            <span>Points: {customPointCloud ? `${customPointCloud.length.toLocaleString()} (Custom)` : '7,500 (Synthetic)'}</span>
            <span className="mx-1.5 text-gray-600">/</span>
            <span>Frustums: 4</span>
            <span className="mx-1.5 text-gray-600">/</span>
            <span className="text-emerald-400">Tracks: 4</span>
          </div>

          {onOpenDataHub && (
            <button
              onClick={onOpenDataHub}
              className="pointer-events-auto px-2.5 py-1 rounded-lg bg-[#76B900]/20 hover:bg-[#76B900]/30 text-[#88D600] border border-[#76B900]/40 text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer shadow-[0_0_10px_rgba(118,185,0,0.15)] transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{customPointCloud ? 'Custom LiDAR Active' : 'Import LiDAR / Data'}</span>
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 pointer-events-auto bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/[0.1]">
          <button
            onClick={handleSetOrbit}
            className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
              perspectiveMode === 'orbit'
                ? 'bg-[#76B900]/25 text-[#88D600] border border-[#76B900]/40 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            3D Isometric
          </button>
          <button
            onClick={handleSetTopDown}
            className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
              perspectiveMode === 'topDown'
                ? 'bg-[#76B900]/25 text-[#88D600] border border-[#76B900]/40 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            2D Ortho (Top)
          </button>
        </div>
      </div>

      {/* Bottom Controls Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-1.5 pointer-events-auto bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/[0.1]">
          <button
            onClick={handleToggleLidar}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              showLidarCloud
                ? 'bg-[#76B900]/20 text-[#88D600] border border-[#76B900]/40'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>LiDAR Cloud</span>
          </button>

          <button
            onClick={handleToggleCameraFrustums}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              showCameraFrustums
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Camera Frustums</span>
          </button>

          <button
            onClick={() => setShowThermalOverlay((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              showThermalOverlay
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Thermal FLIR</span>
          </button>
        </div>

        {/* Legend / Compass */}
        <div className="pointer-events-auto bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.1] flex items-center space-x-3 text-[10px] font-mono text-gray-400">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#76B900]" />
            <span>Forklift</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Worker</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Anomaly</span>
          </div>
          <button
            onClick={handleSetOrbit}
            className="p-1 hover:text-white transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
