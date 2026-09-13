import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AeroViper — Cyberpunk Sci-Fi Recon Drone',
  description: 'Interactive 3D cyberpunk drone experience built with Next.js, Three.js, and React Three Fiber.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-cyber-dark text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  )
}
