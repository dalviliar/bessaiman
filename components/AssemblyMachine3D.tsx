'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function AssemblyFallback() {
  return (
    <div style={{ width: '100%', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
      <div style={{
        width: 220, height: 220, borderRadius: 20, background: '#F1F5F9', border: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ width: 64, height: 64, borderRadius: 12, background: '#DCE8F0', border: '1px solid #B0BEC5' }} />
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: 2 }}>МОДУЛЬНЫЙ РЕАКТОР</span>
      </div>
    </div>
  )
}

function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3) }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

interface FlyPart {
  group: THREE.Group
  start: THREE.Vector3
  end: THREE.Vector3
  startRot: THREE.Euler
  endRot: THREE.Euler
  delay: number
  duration: number
}

// A fictional, deliberately more elaborate "modular synthesis reactor" —
// every piece flies in from a scattered starting point and eases into its
// assembled position; once a piece has arrived, moving parts (gears, the
// internal rotor, the vent, the indicator light) start running on their own.
export default function AssemblyMachine3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer | null = null
    let animFrameId = 0
    let onResize: (() => void) | null = null

    try {
      // ── Scene & camera ──────────────────────────────────────────
      const scene = new THREE.Scene()
      const w = canvas.clientWidth || 500
      const h = canvas.clientHeight || 520
      const camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 100)
      camera.position.set(0, -0.1, 8)

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      // ── Lights (bright premium steel look) ─────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 1.6))
      const dir = new THREE.DirectionalLight(0xffffff, 3.2)
      dir.position.set(4, 10, 6)
      dir.castShadow = true
      dir.shadow.mapSize.set(1024, 1024)
      scene.add(dir)
      const fill = new THREE.PointLight(0xddeeff, 1.8)
      fill.position.set(-5, 2, 5)
      scene.add(fill)
      const topLight = new THREE.PointLight(0xffffff, 1.2)
      topLight.position.set(0, 6, 3)
      scene.add(topLight)
      const front = new THREE.PointLight(0xe8f4ff, 0.9)
      front.position.set(1, -1, 7)
      scene.add(front)
      scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x9aaabb, 1.4))

      // ── Materials ───────────────────────────────────────────────
      const M = (color: number, metalness = 0.85, roughness = 0.14) =>
        new THREE.MeshStandardMaterial({ color, metalness, roughness })

      const steel   = M(0xDCE8F0, 0.94, 0.06)
      const flangeM = M(0xCED8E0, 0.90, 0.09)
      const darkM   = M(0x2E3C46, 0.70, 0.28)
      const boltM   = M(0xE4EEF6, 0.96, 0.04)
      const portM   = M(0xC8D4DC, 0.90, 0.10)
      const redM    = M(0xE02818, 0.12, 0.40)
      const gaugeM  = M(0xA8B8C4, 0.75, 0.20)
      const gearM   = M(0x8CA0B0, 0.80, 0.20)
      const gearHubM = M(0x5A6E7E, 0.75, 0.25)
      const rotorM  = M(0x4A6A8A, 0.72, 0.22)
      const glassM  = new THREE.MeshStandardMaterial({ color: 0x1A4070, metalness: 0.08, roughness: 0.01, transparent: true, opacity: 0.5 })
      const gaugeFaceM = new THREE.MeshStandardMaterial({ color: 0xF4F8FC, metalness: 0.02, roughness: 0.04, transparent: true, opacity: 0.98 })
      const lightMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0, metalness: 0.2, roughness: 0.3 })

      // ── Geometry helpers ────────────────────────────────────────
      const Cyl  = (rT: number, rB: number, h: number, seg = 48) => new THREE.CylinderGeometry(rT, rB, h, seg)
      const Tor  = (r: number, tube: number, seg = 64)            => new THREE.TorusGeometry(r, tube, 8, seg)
      const Circ = (r: number)                                     => new THREE.CircleGeometry(r, 48)
      const Sph  = (r: number)                                     => new THREE.SphereGeometry(r, 14, 14)
      const Box  = (x: number, y: number, z: number)              => new THREE.BoxGeometry(x, y, z)

      const assembly = new THREE.Group()
      scene.add(assembly)

      const parts: FlyPart[] = []

      // Creates a carrier group that flies from `start` to `end`, registers
      // it for per-frame animation, and returns it so meshes can be added
      // at local-origin (with whatever fixed local rotation that part needs).
      const spawn = (
        end: [number, number, number], start: [number, number, number],
        delay: number, duration = 0.9,
        endRot: [number, number, number] = [0, 0, 0], startRot: [number, number, number] = [0, 0, 0],
      ) => {
        const g = new THREE.Group()
        g.position.set(...start)
        g.rotation.set(...startRot)
        assembly.add(g)
        parts.push({
          group: g,
          start: new THREE.Vector3(...start), end: new THREE.Vector3(...end),
          startRot: new THREE.Euler(...startRot), endRot: new THREE.Euler(...endRot),
          delay, duration,
        })
        return g
      }

      const mesh = (
        parent: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material,
        px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0,
      ) => {
        const m = new THREE.Mesh(geo, mat)
        m.position.set(px, py, pz)
        m.rotation.set(rx, ry, rz)
        m.castShadow = true
        m.receiveShadow = true
        parent.add(m)
        return m
      }

      // ── Main chamber body ───────────────────────────────────────
      mesh(spawn([0, 0, 0], [0, 6.5, 0], 0.0, 1.1), Cyl(0.78, 0.78, 3.1, 64), steel)
      mesh(spawn([0, -0.72, 0], [0, -0.72, -5], 0.3, 0.8), Tor(0.80, 0.025), darkM)
      mesh(spawn([0, 0.72, 0], [0, 0.72, -5], 0.35, 0.8), Tor(0.80, 0.025), darkM)

      // Top tube
      mesh(spawn([0, 2.14, 0], [0, 7.5, 0], 0.5, 1.0), Cyl(0.21, 0.21, 0.82, 32), steel)
      mesh(spawn([0, 1.94, 0], [0, 7, 0], 0.6, 0.8), Tor(0.23, 0.032), darkM)

      // Top flange + bolt ring
      mesh(spawn([0, 1.65, 0], [0, 6.5, 0], 0.75, 1.0), Cyl(1.12, 1.12, 0.24, 64), flangeM)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        const ex = 0.92 * Math.cos(a), ez = 0.92 * Math.sin(a)
        mesh(spawn([ex, 1.65, ez], [ex * 4, 5 + i * 0.2, ez * 4], 1.0 + i * 0.05, 0.5), Cyl(0.056, 0.056, 0.30, 8), boltM)
      }

      // Bottom flange + bolt ring
      mesh(spawn([0, -1.65, 0], [0, -6.5, 0], 0.9, 1.0), Cyl(1.12, 1.12, 0.24, 64), flangeM)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        const ex = 0.92 * Math.cos(a), ez = 0.92 * Math.sin(a)
        mesh(spawn([ex, -1.65, ez], [ex * 4, -5 - i * 0.2, ez * 4], 1.15 + i * 0.05, 0.5), Cyl(0.056, 0.056, 0.28, 8), boltM)
      }

      // Bottom outlet tube
      mesh(spawn([0, -2.18, 0], [0, -7.5, 0], 1.6, 1.0), Cyl(0.28, 0.28, 0.86, 40), steel)
      mesh(spawn([0, -2.00, 0], [0, -7, 0], 1.7, 0.8), Tor(0.30, 0.038, 40), darkM)

      // Left valve assembly
      mesh(spawn([-1.05, 0.55, 0], [-6.5, 0.55, 0], 1.9, 0.9, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2]), Cyl(0.19, 0.19, 0.52, 32), portM)
      mesh(spawn([-1.32, 0.55, 0], [-7, 0.55, 0], 2.0, 0.9, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2]), Cyl(0.33, 0.33, 0.09, 32), flangeM)
      mesh(spawn([-1.52, 0.55, 0], [-7.5, 1.6, 0], 2.15, 0.8, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2]), Cyl(0.09, 0.075, 0.26, 8), redM)
      mesh(spawn([-1.66, 0.55, 0], [-7.5, 2.4, 0], 2.3, 0.7, [Math.PI / 2, 0, 0], [Math.PI / 2, 0, 0]), Cyl(0.035, 0.035, 0.18, 8), redM)

      // Right gauge assembly
      mesh(spawn([1.05, 0.55, 0], [6.5, 0.55, 0], 1.9, 0.9, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2]), Cyl(0.19, 0.19, 0.52, 32), portM)
      mesh(spawn([1.32, 0.55, 0], [7, 0.55, 0], 2.0, 0.9, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2]), Cyl(0.33, 0.33, 0.09, 32), flangeM)
      mesh(spawn([1.35, 0.92, 0], [7, 3, 0], 2.15, 0.8), Cyl(0.06, 0.06, 0.55, 16), portM)
      const gaugeCarrier = spawn([1.35, 1.25, 0], [7, 4.2, 0.5], 2.3, 0.9)
      mesh(gaugeCarrier, Cyl(0.30, 0.30, 0.16, 40), gaugeM)
      mesh(gaugeCarrier, Circ(0.24), gaugeFaceM, 0, 0.09, 0)
      const needle = mesh(gaugeCarrier, Box(0.17, 0.016, 0.005), redM, 0, 0.1, 0.001)

      // Indicator light — arrives last, powers on next to the gauge
      const lightCarrier = spawn([1.35, 1.62, 0.05], [7, 5, 0.05], 4.6, 0.6)
      mesh(lightCarrier, Sph(0.05), lightMat)

      // Front viewport glass + ring + bolt ring
      const vpCarrier = spawn([0, 0, 0.79], [0, 4.5, 0.79], 2.6, 0.9)
      mesh(vpCarrier, Circ(0.44), glassM)
      mesh(spawn([0, 0, 0.78], [0, 5, 0.78], 2.7, 0.8), Tor(0.44, 0.058), steel)
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        const ex = 0.62 * Math.cos(a), ey = 0.62 * Math.sin(a)
        mesh(spawn([ex, ey, 0.79], [ex * 3, ey * 3, 4], 2.9 + i * 0.05, 0.5), Sph(0.052), boltM)
      }

      // Internal rotor — visible through the viewport, spins once assembled
      const rotorCarrier = spawn([0, 0, 0.3], [0, -5, 0.3], 3.2, 1.0)
      mesh(rotorCarrier, Cyl(0.03, 0.03, 0.5, 10), darkM, 0, 0, 0, Math.PI / 2, 0, 0)
      const rotorSpin = new THREE.Group()
      rotorCarrier.add(rotorSpin)
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2
        mesh(rotorSpin, Box(0.28, 0.07, 0.02), rotorM, 0.18 * Math.cos(a), 0.18 * Math.sin(a), 0, 0, 0, a + Math.PI / 2)
      }

      // Side port + shaft feeding the gearbox module
      mesh(spawn([-0.78, -0.35, 0], [-5, -0.35, 0], 2.4, 0.8, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2]), Cyl(0.09, 0.09, 0.3, 20), portM)
      mesh(spawn([-1.55, -0.35, 0], [-6, -2, 0], 2.7, 0.8, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2]), Cyl(0.06, 0.06, 1.1, 16), darkM)

      // Gearbox module — arrives as one unit, gears already meshing
      const gearboxCarrier = spawn([-2.35, -0.35, 0], [-7.5, -0.35, 3.2], 3.0, 1.1)
      mesh(gearboxCarrier, Box(0.55, 0.75, 0.42), flangeM)
      const gearDefs = [
        { r: 0.24, dx: -0.16, dir: 1 },
        { r: 0.16, dx: 0.16, dir: -1 },
        { r: 0.10, dx: 0.34, dir: 1 },
      ]
      const gearSpins: { grp: THREE.Group; speed: number }[] = []
      gearDefs.forEach(gd => {
        const spinGrp = new THREE.Group()
        spinGrp.position.set(gd.dx, 0, 0.24)
        gearboxCarrier.add(spinGrp)
        const gm = new THREE.Mesh(Cyl(gd.r, gd.r, 0.05, 24), gearM)
        gm.rotation.x = Math.PI / 2
        gm.castShadow = true
        spinGrp.add(gm)
        const hub = new THREE.Mesh(Cyl(gd.r * 0.3, gd.r * 0.3, 0.07, 12), gearHubM)
        hub.rotation.x = Math.PI / 2
        spinGrp.add(hub)
        gearSpins.push({ grp: spinGrp, speed: gd.dir * 2.4 })
      })

      // Top cap + spinning vent — the finishing piece
      const capCarrier = spawn([0, 2.7, 0], [0, 8.5, 0], 4.0, 1.0)
      mesh(capCarrier, Cyl(0.24, 0.24, 0.12, 32), flangeM)
      const vent = new THREE.Group()
      vent.position.set(0, 0.07, 0)
      capCarrier.add(vent)
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2
        mesh(vent, Box(0.16, 0.02, 0.05), darkM, 0.1 * Math.cos(a), 0, 0.1 * Math.sin(a), 0, a, 0)
      }

      // Ground shadow
      const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.12 }))
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = -2.65
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      // ── Animate ─────────────────────────────────────────────────
      const clock = new THREE.Clock()
      let elapsed = 0

      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const dt = clock.getDelta()
        elapsed += dt
        const t = elapsed

        for (const p of parts) {
          const raw = THREE.MathUtils.clamp((t - p.delay) / p.duration, 0, 1)
          const e = easeOutCubic(raw)
          p.group.position.lerpVectors(p.start, p.end, e)
          p.group.rotation.x = lerp(p.startRot.x, p.endRot.x, e)
          p.group.rotation.y = lerp(p.startRot.y, p.endRot.y, e)
          p.group.rotation.z = lerp(p.startRot.z, p.endRot.z, e)
          if (raw >= 1) {
            const since = t - (p.delay + p.duration)
            p.group.scale.setScalar(since < 0.28 ? 1 + 0.12 * (1 - since / 0.28) : 1)
          } else {
            p.group.scale.setScalar(1)
          }
        }

        gearSpins.forEach(g => { g.grp.rotation.y += g.speed * dt })
        rotorSpin.rotation.z += 2.0 * dt
        vent.rotation.y += 1.6 * dt
        needle.rotation.z = -0.65 + Math.sin(t * 1.3) * 0.35

        const lp = THREE.MathUtils.clamp((t - 4.6) / 0.6, 0, 1)
        lightMat.emissiveIntensity = lp >= 1 ? 0.6 + Math.sin(t * 3) * 0.4 : lp * 0.6

        assembly.rotation.y = t * 0.18
        assembly.rotation.x = Math.sin(t * 0.25) * 0.05

        renderer!.render(scene, camera)
      }
      animate()

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
      setWebglFailed(true)
    }

    return () => {
      cancelAnimationFrame(animFrameId)
      if (onResize) window.removeEventListener('resize', onResize)
      renderer?.dispose()
    }
  }, [])

  if (webglFailed) return <AssemblyFallback />

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 520, display: 'block' }}
    />
  )
}
