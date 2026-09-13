'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const DroneCanvas = dynamic(() => import('@/components/DroneCanvas'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
})

function LoadingSkeleton() {
  return (
    <div className="w-full h-screen bg-cyber-dark flex flex-col items-center justify-center gap-6">
      {/* Pulsing drone silhouette */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-2 border-cyan-500/30 animate-ping absolute inset-0" />
        <div className="w-24 h-24 rounded-full border-2 border-cyan-500/50 flex items-center justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            className="animate-pulse"
          >
            <rect x="12" y="17" width="16" height="6" rx="2" fill="#06b6d4" opacity="0.6" />
            <circle cx="20" cy="20" r="3" fill="#06b6d4" />
            <line x1="8" y1="12" x2="14" y2="17" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
            <line x1="32" y1="12" x2="26" y2="17" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
            <line x1="8" y1="28" x2="14" y2="23" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
            <line x1="32" y1="28" x2="26" y2="23" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
            <circle cx="8" cy="12" r="2.5" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.4" />
            <circle cx="32" cy="12" r="2.5" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.4" />
            <circle cx="8" cy="28" r="2.5" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.4" />
            <circle cx="32" cy="28" r="2.5" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.4" />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-lg font-mono uppercase tracking-[0.25em] text-cyan-400">
          AeroViper
        </h1>
        <p className="text-xs font-mono text-slate-500 tracking-wider">
          Initializing 3D Systems...
        </p>
        <div className="flex justify-center gap-1 mt-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}

export default function Home() {
  const reducedMotion = useReducedMotion()

  return (
    <main className="w-full h-screen relative">
      <DroneCanvas reducedMotion={reducedMotion} />

      {/* Title overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-sm sm:text-base font-mono uppercase tracking-[0.3em] text-cyan-400/80">
          AeroViper
        </h1>
        <p className="text-[10px] sm:text-xs font-mono text-slate-500 tracking-wider mt-0.5">
          Cyberpunk Recon Drone
        </p>
      </div>

      {/* Reduced motion indicator */}
      {reducedMotion && (
        <div className="absolute top-4 right-4 z-10 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
            Reduced Motion Active
          </span>
        </div>
      )}
    </main>
  )
}
