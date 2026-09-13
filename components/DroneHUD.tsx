'use client'

import {
  Power,
  ScanLine,
  Grid3x3,
  ArrowUpDown,
  Palette,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import { COLOR_PRESETS, type ColorPreset } from './DroneModel'
import { cn } from '@/lib/cn'

interface DroneHUDProps {
  engineOn: boolean
  setEngineOn: (v: boolean) => void
  colorPreset: ColorPreset
  setColorPreset: (v: ColorPreset) => void
  scannerOn: boolean
  setScannerOn: (v: boolean) => void
  altitude: number
  setAltitude: (v: number) => void
  wireframe: boolean
  setWireframe: (v: boolean) => void
}

function ToggleChip({
  label,
  icon: Icon,
  active,
  onClick,
  activeColor = 'cyan',
}: {
  label: string
  icon: React.ElementType
  active: boolean
  onClick: () => void
  activeColor?: 'cyan' | 'pink' | 'amber'
}) {
  const colorMap = {
    cyan: {
      ring: 'ring-cyan-400/60',
      bg: 'bg-cyan-400/10',
      text: 'text-cyan-400',
      shadow: 'shadow-cyan-500/20',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    },
    pink: {
      ring: 'ring-pink-400/60',
      bg: 'bg-pink-400/10',
      text: 'text-pink-400',
      shadow: 'shadow-pink-500/20',
      glow: 'shadow-[0_0_12px_rgba(236,72,153,0.35)]',
    },
    amber: {
      ring: 'ring-amber-400/60',
      bg: 'bg-amber-400/10',
      text: 'text-amber-400',
      shadow: 'shadow-amber-500/20',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    },
  }
  const colors = colorMap[activeColor]

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300',
        'ring-1 ring-inset',
        active
          ? `${colors.ring} ${colors.bg} ${colors.text} ${colors.glow}`
          : 'ring-slate-600/40 bg-slate-800/40 text-slate-400 hover:ring-slate-500/60 hover:text-slate-300'
      )}
    >
      <Icon size={14} />
      <span>{label}</span>
      <span
        className={cn(
          'w-2 h-2 rounded-full ml-auto transition-colors duration-300',
          active ? 'bg-current animate-pulse' : 'bg-slate-600'
        )}
      />
    </button>
  )
}

export default function DroneHUD({
  engineOn,
  setEngineOn,
  colorPreset,
  setColorPreset,
  scannerOn,
  setScannerOn,
  altitude,
  setAltitude,
  wireframe,
  setWireframe,
}: DroneHUDProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'absolute bottom-4 left-1/2 -translate-x-1/2 z-10',
        'w-[calc(100%-2rem)] max-w-lg',
        'glass-panel p-4 transition-all duration-500'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap
            size={16}
            className={cn(
              'transition-colors duration-300',
              engineOn ? 'text-cyan-400' : 'text-slate-500'
            )}
          />
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-slate-300">
            AeroViper HUD
          </h2>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
          aria-label={collapsed ? 'Expand HUD' : 'Collapse HUD'}
        >
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Collapsible body */}
      <div
        className={cn(
          'grid gap-3 overflow-hidden transition-all duration-500',
          collapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
        )}
      >
        {/* Toggle row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <ToggleChip
            label="Engine"
            icon={Power}
            active={engineOn}
            onClick={() => setEngineOn(!engineOn)}
            activeColor="cyan"
          />
          <ToggleChip
            label="Scanner"
            icon={ScanLine}
            active={scannerOn}
            onClick={() => setScannerOn(!scannerOn)}
            activeColor="pink"
          />
          <ToggleChip
            label="Wireframe"
            icon={Grid3x3}
            active={wireframe}
            onClick={() => setWireframe(!wireframe)}
            activeColor="amber"
          />
        </div>

        {/* Altitude slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <ArrowUpDown size={12} />
              <span>ALTITUDE</span>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {altitude.toFixed(1)}m
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.1}
            value={altitude}
            onChange={(e) => setAltitude(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-slate-700 cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-cyan-400
              [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(6,182,212,0.6)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-3.5
              [&::-moz-range-thumb]:h-3.5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-cyan-400
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        {/* Color presets */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Palette size={12} />
            <span>HULL PAINT</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setColorPreset(preset)}
                className={cn(
                  'group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wide transition-all duration-300',
                  'ring-1 ring-inset',
                  colorPreset.name === preset.name
                    ? 'ring-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                    : 'ring-slate-600/30 bg-slate-800/30 text-slate-500 hover:text-slate-300 hover:ring-slate-500/40'
                )}
                title={preset.name}
              >
                <span className="flex gap-0.5">
                  <span
                    className="w-3 h-3 rounded-full ring-1 ring-white/10"
                    style={{ backgroundColor: preset.fuselage }}
                  />
                  <span
                    className="w-3 h-3 rounded-full ring-1 ring-white/10"
                    style={{ backgroundColor: preset.accent }}
                  />
                </span>
                <span className="hidden sm:inline">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
