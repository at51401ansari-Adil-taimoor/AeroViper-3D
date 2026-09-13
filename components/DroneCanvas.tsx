'use client'

import { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import DroneModel, { type ColorPreset, COLOR_PRESETS } from './DroneModel'
import DroneHUD from './DroneHUD'

interface DroneCanvasProps {
  reducedMotion: boolean
}

export default function DroneCanvas({ reducedMotion }: DroneCanvasProps) {
  const [engineOn, setEngineOn] = useState(true)
  const [colorPreset, setColorPreset] = useState<ColorPreset>(COLOR_PRESETS[0])
  const [scannerOn, setScannerOn] = useState(true)
  const [altitude, setAltitude] = useState(1.2)
  const [wireframe, setWireframe] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      setMousePos({ x, y })
    },
    [reducedMotion]
  )

  return (
    <div className="relative w-full h-screen" onPointerMove={handlePointerMove}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [3, 2.5, 4], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a0f' }}
      >
        {/* === LIGHTING === */}
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={20}
          shadow-camera-near={0.5}
        />
        {/* Cyberpunk colored point lights */}
        <pointLight position={[-3, 3, -3]} color="#06b6d4" intensity={1.5} distance={15} />
        <pointLight position={[3, 2, -2]} color="#ec4899" intensity={1.0} distance={12} />
        <pointLight position={[0, 4, 3]} color="#8b5cf6" intensity={0.6} distance={10} />
        {/* Subtle fill from below */}
        <hemisphereLight args={['#1e293b', '#0f172a', 0.4]} />

        <Suspense fallback={null}>
          <DroneModel
            engineOn={engineOn}
            colorPreset={colorPreset}
            scannerOn={scannerOn}
            altitude={altitude}
            wireframe={wireframe}
            reducedMotion={reducedMotion}
            mousePos={mousePos}
          />
        </Suspense>

        {/* === CONTACT SHADOWS === */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.6}
          scale={10}
          blur={2.5}
          far={4}
          color="#06b6d4"
        />

        {/* === GROUND GRID === */}
        <gridHelper
          args={[20, 40, '#1e3a5f', '#0f1729']}
          position={[0, -0.02, 0]}
        />

        {/* === ORBIT CONTROLS === */}
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.48}
          minDistance={2.5}
          maxDistance={10}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {/* === HUD Overlay === */}
      <DroneHUD
        engineOn={engineOn}
        setEngineOn={setEngineOn}
        colorPreset={colorPreset}
        setColorPreset={setColorPreset}
        scannerOn={scannerOn}
        setScannerOn={setScannerOn}
        altitude={altitude}
        setAltitude={setAltitude}
        wireframe={wireframe}
        setWireframe={setWireframe}
      />
    </div>
  )
}
