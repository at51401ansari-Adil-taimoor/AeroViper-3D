'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// --- Color Preset type ---
export interface ColorPreset {
  name: string
  fuselage: string
  accent: string
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Stealth Obsidian', fuselage: '#0f172a', accent: '#06b6d4' },
  { name: 'Cyberpunk Violet', fuselage: '#581c87', accent: '#ec4899' },
  { name: 'Hazard Industrial', fuselage: '#eab308', accent: '#0f172a' },
  { name: 'Ghost Recon White', fuselage: '#e2e8f0', accent: '#3b82f6' },
]

interface DroneModelProps {
  engineOn: boolean
  colorPreset: ColorPreset
  scannerOn: boolean
  altitude: number
  wireframe: boolean
  reducedMotion: boolean
  mousePos: { x: number; y: number }
}

export default function DroneModel({
  engineOn,
  colorPreset,
  scannerOn,
  altitude,
  wireframe,
  reducedMotion,
  mousePos,
}: DroneModelProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const propellerRefs = useRef<THREE.Mesh[]>([])
  const scannerRef = useRef<THREE.Mesh>(null!)
  const spotlightRef = useRef<THREE.SpotLight>(null!)
  const spotlightTargetRef = useRef<THREE.Object3D>(null!)
  const propSpeedRef = useRef(0)

  // Arm positions for 4 quadcopter arms in X configuration
  const armConfigs = useMemo(() => [
    { pos: [1.2, 0, 1.2] as [number, number, number], rot: Math.PI / 4 },
    { pos: [-1.2, 0, 1.2] as [number, number, number], rot: -Math.PI / 4 },
    { pos: [1.2, 0, -1.2] as [number, number, number], rot: -Math.PI / 4 },
    { pos: [-1.2, 0, -1.2] as [number, number, number], rot: Math.PI / 4 },
  ], [])

  useFrame((state) => {
    const { clock } = state
    const t = clock.getElapsedTime()
    const group = groupRef.current
    if (!group) return

    // --- Propeller speed ramp ---
    const targetSpeed = engineOn ? 15 : 0
    propSpeedRef.current = THREE.MathUtils.lerp(propSpeedRef.current, targetSpeed, 0.03)

    // --- Spin propellers ---
    if (!reducedMotion) {
      propellerRefs.current.forEach((prop) => {
        if (prop) {
          prop.rotation.y += propSpeedRef.current * 0.016
        }
      })
    }

    // --- Hover bobbing ---
    const hoverOffset = engineOn && !reducedMotion ? Math.sin(t * 1.5) * 0.08 : 0
    const targetY = engineOn ? altitude + hoverOffset : 0.15
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.04)

    // --- Pointer parallax tilt ---
    if (!reducedMotion) {
      const targetRotX = -mousePos.y * 0.15
      const targetRotZ = mousePos.x * 0.15
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, 0.05)
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetRotZ, 0.05)
    } else {
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0, 0.05)
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, 0, 0.05)
    }

    // --- Scanner beam rotation ---
    if (scannerRef.current && !reducedMotion) {
      scannerRef.current.rotation.y = t * 0.8
    }
  })

  const fuselageColor = new THREE.Color(colorPreset.fuselage)
  const accentColor = new THREE.Color(colorPreset.accent)

  return (
    <group ref={groupRef} position={[0, altitude, 0]}>
      {/* === MAIN CHASSIS === */}
      {/* Central fuselage - flattened octagonal cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.22, 8]} />
        <meshStandardMaterial
          color={fuselageColor}
          metalness={0.8}
          roughness={0.2}
          wireframe={wireframe}
        />
      </mesh>
      {/* Top plate detail */}
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.55, 0.08, 8]} />
        <meshStandardMaterial
          color={fuselageColor}
          metalness={0.9}
          roughness={0.15}
          wireframe={wireframe}
        />
      </mesh>
      {/* Bottom plate */}
      <mesh position={[0, -0.13, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.45, 0.06, 8]} />
        <meshStandardMaterial
          color={fuselageColor}
          metalness={0.7}
          roughness={0.3}
          wireframe={wireframe}
        />
      </mesh>

      {/* === SENSOR EYE / COCKPIT === */}
      <mesh position={[0, 0.05, 0.65]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={engineOn ? 1.5 : 0.3}
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
      {/* Eye lens ring */}
      <mesh position={[0, 0.05, 0.73]}>
        <torusGeometry args={[0.1, 0.02, 8, 16]} />
        <meshStandardMaterial
          color={'#1e293b'}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* === 4 OUTRIGGER ARMS + PROPELLER DUCTS + PROPELLERS === */}
      {armConfigs.map((arm, i) => (
        <group key={i}>
          {/* Arm strut */}
          <mesh
            position={[arm.pos[0] * 0.5, 0, arm.pos[2] * 0.5]}
            rotation={[0, arm.rot, 0]}
            castShadow
          >
            <boxGeometry args={[1.4, 0.06, 0.1]} />
            <meshStandardMaterial
              color={'#1e293b'}
              metalness={0.85}
              roughness={0.2}
              wireframe={wireframe}
            />
          </mesh>

          {/* Propeller duct (torus ring) */}
          <mesh position={arm.pos} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.05, 8, 24]} />
            <meshStandardMaterial
              color={fuselageColor}
              metalness={0.7}
              roughness={0.3}
              wireframe={wireframe}
            />
          </mesh>

          {/* Duct glow ring */}
          <mesh position={arm.pos} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.02, 8, 24]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={engineOn ? 2 : 0.2}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Propeller (dual-blade) */}
          <mesh
            position={arm.pos}
            ref={(el) => { if (el) propellerRefs.current[i] = el }}
          >
            <boxGeometry args={[0.55, 0.015, 0.06]} />
            <meshStandardMaterial color={'#94a3b8'} metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Motor hub */}
          <mesh position={arm.pos}>
            <cylinderGeometry args={[0.06, 0.06, 0.08, 8]} />
            <meshStandardMaterial color={'#334155'} metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Thruster point light */}
          <pointLight
            position={[arm.pos[0], arm.pos[1] - 0.15, arm.pos[2]]}
            color={colorPreset.accent}
            intensity={engineOn ? 1.5 : 0}
            distance={2}
            decay={2}
          />
        </group>
      ))}

      {/* === LANDING GEAR === */}
      {/* Left skid */}
      <mesh position={[-0.4, -0.25, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.08, 1.0]} />
        <meshStandardMaterial color={'#334155'} metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Right skid */}
      <mesh position={[0.4, -0.25, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.08, 1.0]} />
        <meshStandardMaterial color={'#334155'} metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Left skid struts */}
      <mesh position={[-0.4, -0.17, 0.25]} castShadow>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color={'#475569'} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.4, -0.17, -0.25]} castShadow>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color={'#475569'} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Right skid struts */}
      <mesh position={[0.4, -0.17, 0.25]} castShadow>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color={'#475569'} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.4, -0.17, -0.25]} castShadow>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color={'#475569'} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* === SCANNER / SPOTLIGHT === */}
      {scannerOn && (
        <group>
          {/* Conical scanner beam */}
          <mesh
            ref={scannerRef}
            position={[0, -0.8, 0]}
            rotation={[Math.PI, 0, 0]}
          >
            <coneGeometry args={[0.8, 1.5, 16, 1, true]} />
            <meshBasicMaterial
              color={accentColor}
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Spotlight */}
          <spotLight
            ref={spotlightRef}
            position={[0, -0.2, 0]}
            angle={0.5}
            penumbra={0.5}
            intensity={5}
            color={colorPreset.accent}
            distance={10}
            castShadow
            target={spotlightTargetRef.current || undefined}
          />
          <object3D ref={spotlightTargetRef} position={[0, -5, 0]} />
        </group>
      )}

      {/* === REAR ACCENT LIGHTS === */}
      <mesh position={[-0.3, 0.05, -0.7]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={'#ef4444'}
          emissive={'#ef4444'}
          emissiveIntensity={engineOn ? 2 : 0.3}
        />
      </mesh>
      <mesh position={[0.3, 0.05, -0.7]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={'#ef4444'}
          emissive={'#ef4444'}
          emissiveIntensity={engineOn ? 2 : 0.3}
        />
      </mesh>

      {/* === ANTENNA === */}
      <mesh position={[0, 0.3, -0.2]} castShadow>
        <cylinderGeometry args={[0.008, 0.015, 0.35, 6]} />
        <meshStandardMaterial color={'#64748b'} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.48, -0.2]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={engineOn ? 2 : 0.4}
        />
      </mesh>
    </group>
  )
}
