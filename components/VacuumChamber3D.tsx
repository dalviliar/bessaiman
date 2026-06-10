'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function VacuumChamber3D({ dark = true, theme = 'dark' }: { dark?: boolean; theme?: 'dark' | 'blueprint' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer | null = null
    let animFrameId = 0
    let onResize: (() => void) | null = null

    try {
    // ── Scene & Camera ──────────────────────────────────────────
    const scene = new THREE.Scene()
    const w = canvas.clientWidth || 500
    const h = canvas.clientHeight || 520
    const camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 100)
    camera.position.set(0, -0.1, 7)

    // ── Renderer ────────────────────────────────────────────────
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // ── Lights ──────────────────────────────────────────────────
    const bp = theme === 'blueprint'

    if (bp) {
      scene.add(new THREE.AmbientLight(0xdce8f8, 1.1))
      const dir = new THREE.DirectionalLight(0xffffff, 2.8)
      dir.position.set(4, 8, 6)
      dir.castShadow = true
      dir.shadow.mapSize.set(1024, 1024)
      scene.add(dir)
      const fill = new THREE.PointLight(0x4a80c0, 1.2)
      fill.position.set(-5, 2, 4)
      scene.add(fill)
      const rim = new THREE.PointLight(0x1a3a6a, 0.5)
      rim.position.set(0, -3, -4)
      scene.add(rim)
      const hemi = new THREE.HemisphereLight(0xc8dcf0, 0x6a90b0, 0.9)
      scene.add(hemi)
    } else if (!dark) {
      // Light background — bright premium stainless steel lighting
      scene.add(new THREE.AmbientLight(0xffffff, 1.6))
      const dir = new THREE.DirectionalLight(0xffffff, 3.2)
      dir.position.set(4, 10, 6)
      dir.castShadow = true
      dir.shadow.mapSize.set(1024, 1024)
      scene.add(dir)
      const fill = new THREE.PointLight(0xddeeff, 1.8)
      fill.position.set(-5, 2, 5)
      scene.add(fill)
      const top = new THREE.PointLight(0xffffff, 1.2)
      top.position.set(0, 6, 3)
      scene.add(top)
      const front = new THREE.PointLight(0xe8f4ff, 0.9)
      front.position.set(1, -1, 7)
      scene.add(front)
      const hemi = new THREE.HemisphereLight(0xe8f0ff, 0x9aaabb, 1.4)
      scene.add(hemi)
    } else {
      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const dir = new THREE.DirectionalLight(0xe8f2fa, 2.2)
      dir.position.set(5, 8, 5)
      dir.castShadow = true
      dir.shadow.mapSize.set(1024, 1024)
      scene.add(dir)
      const fill = new THREE.PointLight(0x5080b0, 0.9)
      fill.position.set(-4, 1, 3)
      scene.add(fill)
      const rim = new THREE.PointLight(0x304060, 0.4)
      rim.position.set(0, -2, -4)
      scene.add(rim)
      const hemi = new THREE.HemisphereLight(0xb0c8e0, 0x203040, 0.65)
      scene.add(hemi)
      const accent = new THREE.PointLight(0xff5500, 0.55)
      accent.position.set(2, -1, 5)
      scene.add(accent)
    }

    // ── Materials ───────────────────────────────────────────────
    const M = (color: number, metalness = 0.85, roughness = 0.14) =>
      new THREE.MeshStandardMaterial({ color, metalness, roughness })

    // Light bg: bright polished 316L stainless steel look (Anton Paar / Sartorius style)
    const steel   = bp ? M(0x7aA0c0, 0.72, 0.18) : !dark ? M(0xDCE8F0, 0.94, 0.06) : M(0xa8bec8, 0.88, 0.12)
    const flange  = bp ? M(0x5a80a8, 0.75, 0.20) : !dark ? M(0xCED8E0, 0.90, 0.09) : M(0xa0b8c4, 0.85, 0.15)
    const dark_   = bp ? M(0x3a5a7a, 0.60, 0.35) : !dark ? M(0x2E3C46, 0.70, 0.28) : M(0x5a7080, 0.70, 0.30)
    const bolt    = bp ? M(0x8aaac8, 0.80, 0.12) : !dark ? M(0xE4EEF6, 0.96, 0.04) : M(0x7090a0, 0.92, 0.08)
    const port    = bp ? M(0x6a90b8, 0.72, 0.22) : !dark ? M(0xC8D4DC, 0.90, 0.10) : M(0x90a8b8, 0.85, 0.18)
    const red     = bp ? M(0xff5500, 0.15, 0.55) : !dark ? M(0xE02818, 0.12, 0.40) : M(0xcc2200, 0.20, 0.60)
    const gauge_  = bp ? M(0x5a7a9a, 0.60, 0.30) : !dark ? M(0xA8B8C4, 0.75, 0.20) : M(0x7890a0, 0.65, 0.28)
    const glass_  = bp
      ? new THREE.MeshStandardMaterial({ color: 0x1a3a60, metalness: 0.05, roughness: 0.02, transparent: true, opacity: 0.72 })
      : !dark
        ? new THREE.MeshStandardMaterial({ color: 0x1A4070, metalness: 0.08, roughness: 0.01, transparent: true, opacity: 0.55 })
        : new THREE.MeshStandardMaterial({ color: 0x0d1c2c, metalness: 0.05, roughness: 0.02, transparent: true, opacity: 0.78 })
    const gaugeFaceM = bp
      ? new THREE.MeshStandardMaterial({ color: 0xc8dcf0, metalness: 0.05, roughness: 0.05, transparent: true, opacity: 0.95 })
      : !dark
        ? new THREE.MeshStandardMaterial({ color: 0xF4F8FC, metalness: 0.02, roughness: 0.04, transparent: true, opacity: 0.98 })
        : new THREE.MeshStandardMaterial({ color: 0xd0dce8, metalness: 0.05, roughness: 0.05, transparent: true, opacity: 0.92 })

    // ── Geometry helpers ────────────────────────────────────────
    const group = new THREE.Group()
    scene.add(group)

    const add = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      px = 0, py = 0, pz = 0,
      rx = 0, ry = 0, rz = 0,
    ) => {
      const m = new THREE.Mesh(geo, mat)
      m.position.set(px, py, pz)
      m.rotation.set(rx, ry, rz)
      m.castShadow = true
      m.receiveShadow = true
      group.add(m)
    }

    const Cyl  = (rT: number, rB: number, h: number, seg = 64) => new THREE.CylinderGeometry(rT, rB, h, seg)
    const Tor  = (r: number, tube: number, seg = 80)            => new THREE.TorusGeometry(r, tube, 8, seg)
    const Sph  = (r: number)                                     => new THREE.SphereGeometry(r, 12, 12)
    const Circ = (r: number)                                     => new THREE.CircleGeometry(r, 64)
    const Box  = (x: number, y: number, z: number)              => new THREE.BoxGeometry(x, y, z)

    // ── Build the chamber ───────────────────────────────────────

    // Main body
    add(Cyl(0.78, 0.78, 3.1, 80), steel)
    // Seam rings
    add(Tor(0.80, 0.025), dark_, 0, -0.72, 0)
    add(Tor(0.80, 0.025), dark_, 0,  0.72, 0)

    // Top connector tube
    add(Cyl(0.21, 0.21, 0.82, 32), steel,  0, 2.14, 0)
    add(Tor(0.23, 0.032),           dark_,  0, 1.94, 0)

    // Top flange + 12 bolts
    add(Cyl(1.12, 1.12, 0.24, 80), flange, 0, 1.65, 0)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      add(Cyl(0.056, 0.056, 0.30, 10), bolt, 0.92 * Math.cos(a), 1.65, 0.92 * Math.sin(a))
    }

    // Bottom flange + 10 bolts
    add(Cyl(1.12, 1.12, 0.24, 80), flange, 0, -1.65, 0)
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      add(Cyl(0.056, 0.056, 0.28, 10), bolt, 0.92 * Math.cos(a), -1.65, 0.92 * Math.sin(a))
    }

    // Bottom outlet tube
    add(Cyl(0.28, 0.28, 0.86, 40), steel, 0, -2.18, 0)
    add(Tor(0.30, 0.038, 40),      dark_, 0, -2.00, 0)

    // Left port + flange + red valve
    add(Cyl(0.19, 0.19, 0.52, 32), port, -1.05, 0.55, 0, 0, 0, Math.PI / 2)
    add(Cyl(0.33, 0.33, 0.09, 32), flange, -1.32, 0.55, 0, 0, 0, Math.PI / 2)
    add(Cyl(0.09, 0.075, 0.26, 8), red,  -1.52, 0.55, 0, 0, 0, Math.PI / 2)
    add(Cyl(0.035, 0.035, 0.18, 8), red, -1.66, 0.55, 0, Math.PI / 2, 0, 0)

    // Right port + flange + tube to gauge
    add(Cyl(0.19, 0.19, 0.52, 32), port, 1.05, 0.55, 0, 0, 0, Math.PI / 2)
    add(Cyl(0.33, 0.33, 0.09, 32), flange, 1.32, 0.55, 0, 0, 0, Math.PI / 2)
    add(Cyl(0.06, 0.06, 0.55, 16), port,  1.35, 0.92, 0)

    // Pressure gauge body + face + needle
    add(Cyl(0.30, 0.30, 0.16, 40), gauge_, 1.35, 1.25, 0)
    const gFace = new THREE.Mesh(Circ(0.24), gaugeFaceM)
    gFace.position.set(1.35, 1.34, 0)
    group.add(gFace)
    const needle = new THREE.Mesh(Box(0.17, 0.016, 0.005), M(0xcc3300, 0.1, 0.4))
    needle.position.set(1.35, 1.35, 0)
    needle.rotation.z = -0.65
    group.add(needle)

    // Viewport glass + ring + 8 bolts
    const vp = new THREE.Mesh(Circ(0.44), glass_)
    vp.position.set(0, 0, 0.79)
    group.add(vp)
    add(Tor(0.44, 0.058), steel, 0, 0, 0.78)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      add(Sph(0.052), bolt, 0.62 * Math.cos(a), 0.62 * Math.sin(a), 0.79)
    }

    // Small bottom-front port
    add(Cyl(0.11, 0.11, 0.16, 20), port, 0, -0.9, 0.79, Math.PI / 2, 0, 0)

    // Cable
    add(Cyl(0.038, 0.038, 0.85, 12), M(0x18202a, 0.1, 0.85), -0.82, -0.3, 0.35, 0.55, 0.25, -0.4)

    // Ground shadow plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: bp ? 0.18 : dark ? 0.45 : 0.12 }),
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -2.65
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    // ── Animate ─────────────────────────────────────────────────
    const clock = new THREE.Clock()

    const animate = () => {
      animFrameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      group.rotation.y = t * 0.55
      group.rotation.x = Math.sin(t * 0.35) * 0.12
      renderer!.render(scene, camera)
    }
    animate()

    // ── Resize ──────────────────────────────────────────────────
    onResize = () => {
      if (!canvas) return
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      camera.aspect = cw / ch
      camera.updateProjectionMatrix()
      renderer!.setSize(cw, ch)
    }
    window.addEventListener('resize', onResize)

    } catch {
      // WebGL not supported — canvas stays empty, no crash
    }

    return () => {
      cancelAnimationFrame(animFrameId)
      if (onResize) window.removeEventListener('resize', onResize)
      renderer?.dispose()
    }
  }, [dark])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 520, display: 'block' }}
    />
  )
}
