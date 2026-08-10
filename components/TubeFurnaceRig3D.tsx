'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function RigFallback({ height }: { height: number }) {
  return (
    <div style={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        padding: '28px 40px', borderRadius: 16, background: '#F1F5F9', border: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 120, height: 44, borderRadius: 8, background: '#DCE8F0', border: '1px solid #B0BEC5' }} />
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94A3B8', letterSpacing: 2 }}>
          ТРУБЧАТАЯ ПЕЧЬ · ГАЗОВАЯ СТАНЦИЯ
        </span>
      </div>
    </div>
  )
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

interface FlyPart {
  group: THREE.Group
  start: THREE.Vector3
  end: THREE.Vector3
  startRot: THREE.Euler
  endRot: THREE.Euler
  delay: number
  duration: number
}

/**
 * Horizontal tube furnace station: frame, clamshell furnace with heating
 * elements, rotating quartz tube with water-cooled flanges, gas panel with
 * rotameters, vacuum pump and a control cabinet. Every piece flies into
 * place, then the rig powers on — elements glow, the tube turns, fans spin,
 * rotameter floats lift and the panel lights start sequencing.
 */
export default function TubeFurnaceRig3D({ height = 620 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer | null = null
    let animFrameId = 0
    let onResize: (() => void) | null = null

    try {
      const scene = new THREE.Scene()
      const w = canvas.clientWidth || 1000
      const h = canvas.clientHeight || height
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 200)

      // The rig is wide and flat, so the camera distance is derived from the
      // canvas aspect — it frames correctly both in a narrow hero column and
      // on a full-width stage.
      const RIG_HALF_W = 7.35
      const RIG_HALF_H = 2.2
      const TARGET = new THREE.Vector3(0.15, -0.25, 0)
      const VIEW_DIR = new THREE.Vector3(0.26, 0.19, 1).normalize()

      let baseDist = 1
      const fitCamera = () => {
        const aspect = camera.aspect
        const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
        baseDist = Math.max(RIG_HALF_W / (tan * aspect), RIG_HALF_H / tan)
        camera.position.copy(TARGET).addScaledVector(VIEW_DIR, baseDist)
        camera.lookAt(TARGET)
      }
      fitCamera()

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15

      // ── Lights ──────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.95))
      const key = new THREE.DirectionalLight(0xffffff, 3.4)
      key.position.set(6, 12, 8)
      key.castShadow = true
      key.shadow.mapSize.set(2048, 2048)
      key.shadow.bias = -0.0005
      key.shadow.camera.left = -12
      key.shadow.camera.right = 12
      key.shadow.camera.top = 10
      key.shadow.camera.bottom = -6
      scene.add(key)
      const fillL = new THREE.PointLight(0xdceaf8, 1.4)
      fillL.position.set(-9, 3, 7)
      scene.add(fillL)
      const fillR = new THREE.PointLight(0xe8f2ff, 1.0)
      fillR.position.set(9, 2, 6)
      scene.add(fillR)
      scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x93a3b2, 1.1))

      // ── Materials ───────────────────────────────────────────────
      const M = (color: number, metalness = 0.8, roughness = 0.22) =>
        new THREE.MeshStandardMaterial({ color, metalness, roughness })

      const shellM   = M(0xE9EDF0, 0.35, 0.38)   // painted furnace body
      const shellTopM= M(0xDCE3E8, 0.35, 0.40)
      const steelM   = M(0xB9C6CE, 0.92, 0.14)   // stainless frame
      const darkM    = M(0x2C3945, 0.65, 0.34)   // dark structural steel
      const baseM    = M(0x1D2730, 0.55, 0.45)
      const boltM    = M(0xDCE6EE, 0.95, 0.07)
      const ceramicM = M(0xF2EFE6, 0.05, 0.72)   // insulation
      const brassM   = M(0xC9A227, 0.85, 0.28)
      const rubberM  = M(0x1B2026, 0.08, 0.88)
      const panelM   = M(0x27333F, 0.45, 0.42)
      const knobRedM = M(0xC1352B, 0.25, 0.44)
      const knobBluM = M(0x2C6FB5, 0.25, 0.44)
      const gaugeM   = M(0xA9B7C2, 0.78, 0.20)
      const pumpM    = M(0x38566E, 0.62, 0.34)
      const glassM   = new THREE.MeshStandardMaterial({
        color: 0xCFE6F4, metalness: 0.05, roughness: 0.02, transparent: true, opacity: 0.5,
      })
      const gaugeFaceM = new THREE.MeshStandardMaterial({
        color: 0xF6F9FC, metalness: 0.02, roughness: 0.06, transparent: true, opacity: 0.97,
      })
      const heatM = new THREE.MeshStandardMaterial({
        color: 0x8a4b22, emissive: 0xff5a12, emissiveIntensity: 0, metalness: 0.3, roughness: 0.6,
      })
      const displayM = new THREE.MeshStandardMaterial({
        color: 0x0b1a16, emissive: 0x2bd47a, emissiveIntensity: 0, metalness: 0.1, roughness: 0.3,
      })
      const ledMats = [0x2bd47a, 0xffb020, 0xff4d4d, 0x2bd47a, 0x4da3ff, 0xffb020].map(c =>
        new THREE.MeshStandardMaterial({ color: 0x2a3138, emissive: c, emissiveIntensity: 0, metalness: 0.2, roughness: 0.35 }),
      )

      // ── Geometry helpers ────────────────────────────────────────
      const Box  = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z)
      const Cyl  = (rT: number, rB: number, hh: number, seg = 40) => new THREE.CylinderGeometry(rT, rB, hh, seg)
      const Tor  = (r: number, tube: number, seg = 52) => new THREE.TorusGeometry(r, tube, 10, seg)
      const Sph  = (r: number) => new THREE.SphereGeometry(r, 20, 20)

      const rig = new THREE.Group()
      scene.add(rig)

      const parts: FlyPart[] = []

      // The authored start only sets the direction a part comes from; the
      // travel distance is uniform so nothing flies in from off-screen.
      const APPROACH = 2.4

      const spawn = (
        end: [number, number, number], start: [number, number, number],
        delay: number, duration = 0.85,
        endRot: [number, number, number] = [0, 0, 0], startRot: [number, number, number] = [0, 0, 0],
      ) => {
        const endV = new THREE.Vector3(...end)
        const dir = new THREE.Vector3(...start).sub(endV)
        if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0)
        const startV = endV.clone().addScaledVector(dir.normalize(), APPROACH)

        const g = new THREE.Group()
        g.position.copy(startV)
        g.rotation.set(...startRot)
        g.visible = false
        rig.add(g)
        parts.push({
          group: g,
          start: startV, end: endV,
          startRot: new THREE.Euler(...startRot), endRot: new THREE.Euler(...endRot),
          delay, duration,
        })
        return g
      }

      const mesh = (
        parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material,
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

      // ══ 1. FRAME / BENCH ════════════════════════════════════════
      const legX = [-5.4, -1.9, 1.9, 5.4]
      legX.forEach((x, i) => {
        const zSide = [-1.0, 1.0]
        zSide.forEach((z, j) => {
          const g = spawn([x, -1.55, z], [x, -7, z], 0.0 + (i * 2 + j) * 0.05, 0.7)
          mesh(g, Box(0.16, 1.5, 0.16), darkM)
          mesh(g, Cyl(0.11, 0.13, 0.1, 14), baseM, 0, -0.78, 0)   // adjustable foot
        })
      })
      // long rails + cross members
      ;[-1.0, 1.0].forEach((z, i) => {
        mesh(spawn([0, -1.02, z], [0, -6, z], 0.5 + i * 0.08, 0.75), Box(11.4, 0.14, 0.16), steelM)
        mesh(spawn([0, -2.05, z], [0, -6.6, z], 0.6 + i * 0.08, 0.75), Box(11.4, 0.1, 0.12), darkM)
      })
      legX.forEach((x, i) => {
        mesh(spawn([x, -1.02, 0], [x, -6.2, 0], 0.66 + i * 0.05, 0.7), Box(0.14, 0.12, 2.1), steelM)
      })
      // table top
      mesh(spawn([0, -0.9, 0], [0, 5.6, 0], 0.9, 0.9), Box(11.6, 0.12, 2.3), steelM)
      mesh(spawn([0, -0.83, 0], [0, 6.2, 0], 1.0, 0.8), Box(11.2, 0.03, 2.0), M(0x8FA3B0, 0.55, 0.55))

      // ══ 2. FURNACE BODY (clamshell) ═════════════════════════════
      // lower half — matching half-cylinder shell on a cradle
      const furnLo = spawn([0, 0.02, 0], [0, -6, 0], 1.4, 0.95)
      const hoodLo = new THREE.Mesh(
        new THREE.CylinderGeometry(0.96, 0.96, 3.5, 34, 1, false, Math.PI, Math.PI),
        shellM,
      )
      hoodLo.rotation.set(0, 0, Math.PI / 2)
      hoodLo.castShadow = true
      hoodLo.receiveShadow = true
      furnLo.add(hoodLo)
      ;[-1.75, 1.75].forEach(x => {
        const disc = new THREE.Mesh(new THREE.CircleGeometry(0.96, 34, Math.PI, Math.PI), darkM)
        disc.position.set(x, 0, 0)
        disc.rotation.set(0, x < 0 ? -Math.PI / 2 : Math.PI / 2, x < 0 ? Math.PI : 0)
        furnLo.add(disc)
      })
      // cradle saddles carrying the shell on the bench
      ;[-1.25, 1.25].forEach(x => {
        mesh(furnLo, Box(0.24, 0.62, 1.5), darkM, x, -0.62, 0)
        mesh(furnLo, Box(0.34, 0.1, 1.7), steelM, x, -0.9, 0)
      })
      mesh(furnLo, Box(3.6, 0.06, 0.06), steelM, 0, -0.94, 0)      // lower spine
      // upper half — half-cylinder clamshell hood
      const furnHi = spawn([0, 0.02, 0], [0, 6.5, 0], 2.0, 1.0)
      const hood = new THREE.Mesh(
        new THREE.CylinderGeometry(0.96, 0.96, 3.5, 34, 1, false, 0, Math.PI),
        shellTopM,
      )
      hood.rotation.set(0, 0, Math.PI / 2)
      hood.castShadow = true
      hood.receiveShadow = true
      furnHi.add(hood)
      // hood rim + end discs
      ;[-1.75, 1.75].forEach(x => {
        const disc = new THREE.Mesh(new THREE.CircleGeometry(0.96, 34, 0, Math.PI), darkM)
        disc.position.set(x, 0, 0)
        disc.rotation.set(0, x < 0 ? -Math.PI / 2 : Math.PI / 2, x < 0 ? Math.PI : 0)
        furnHi.add(disc)
      })
      mesh(furnHi, Box(3.6, 0.06, 0.06), steelM, 0, 0.94, 0)       // spine rail
      mesh(furnHi, Box(1.1, 0.16, 0.02), M(0x1565C0, 0.3, 0.5), -0.05, 0.5, 0.86)  // brand strip
      // top vent stack + fan
      mesh(furnHi, Cyl(0.19, 0.19, 0.3, 20), steelM, 0.95, 1.02, 0)
      const ventFan = new THREE.Group()
      ventFan.position.set(0.95, 1.2, 0)
      furnHi.add(ventFan)
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        mesh(ventFan, Box(0.17, 0.015, 0.06), darkM, 0.09 * Math.cos(a), 0, 0.09 * Math.sin(a), 0, a, 0.35)
      }
      // hinge blocks along the rear spine + front clamp latches
      ;[-1.1, 0, 1.1].forEach((x, i) => {
        const hg = spawn([x, 0.62, -0.72], [x, 5.2, -4.5], 2.5 + i * 0.06, 0.6)
        mesh(hg, Box(0.2, 0.12, 0.26), darkM)
        mesh(hg, Cyl(0.045, 0.045, 0.34, 10), steelM, 0, 0, 0, Math.PI / 2, 0, 0)
      })
      ;[-1.1, 0, 1.1].forEach((x, i) => {
        const g = spawn([x, -0.06, 0.95], [x, 4.4, 4.5], 2.6 + i * 0.08, 0.6)
        mesh(g, Box(0.16, 0.34, 0.09), steelM)
        mesh(g, Cyl(0.032, 0.032, 0.24, 10), boltM, 0, 0.02, 0.08, Math.PI / 2, 0, 0)
      })
      // bolt circles on both furnace ends
      ;[-1.79, 1.79].forEach(x => {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2
          const ey = 0.02 + 0.8 * Math.cos(a), ez = 0.8 * Math.sin(a)
          mesh(spawn([x, ey, ez], [x * 3, ey + 4, ez * 4], 2.8 + i * 0.035, 0.45), Cyl(0.042, 0.042, 0.11, 8), boltM, 0, 0, 0, 0, 0, Math.PI / 2)
        }
      })
      // side ventilation slats on the flat lower shell
      ;[-0.95, 0.95].forEach(zs => {
        for (let i = 0; i < 5; i++) {
          mesh(spawn([-0.62 + i * 0.31, -0.34, zs], [-0.62 + i * 0.31, 4.6, zs * 4], 3.0 + i * 0.05, 0.45), Box(0.22, 0.035, 0.02), darkM)
        }
      })
      // ceramic insulation collars at tube entries
      ;[-1.78, 1.78].forEach((x, i) => {
        mesh(spawn([x, 0.02, 0], [x * 3.4, 3.6, 0], 3.0 + i * 0.1, 0.6), Cyl(0.46, 0.46, 0.22, 26), ceramicM, 0, 0, 0, 0, 0, Math.PI / 2)
      })
      // heating elements inside (glow on power-up)
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        const ey = 0.02 + 0.34 * Math.cos(a), ez = 0.34 * Math.sin(a)
        mesh(spawn([0, ey, ez], [0, ey + 5, ez], 3.2 + i * 0.05, 0.5), Cyl(0.035, 0.035, 3.1, 10), heatM, 0, 0, 0, 0, 0, Math.PI / 2)
      }
      // furnace front control panel (on the flat lower shell)
      const fPanel = spawn([-1.05, -0.3, 0.98], [-1.05, 3.4, 6], 3.3, 0.8)
      mesh(fPanel, Box(1.05, 0.4, 0.05), M(0x1B242D, 0.4, 0.42))
      const fDisplay = mesh(fPanel, Box(0.42, 0.18, 0.02), displayM, -0.24, 0.03, 0.04)
      ;[0.13, 0.3, 0.45].forEach((x, i) => {
        mesh(fPanel, Cyl(0.05, 0.042, 0.06, 14), i === 1 ? knobBluM : gaugeM, x, 0.02, 0.05, Math.PI / 2, 0, 0)
      })
      const fLeds = [0, 1].map(i =>
        mesh(fPanel, Sph(0.028), ledMats[i], -0.02 + i * 0.07, -0.13, 0.05),
      )
      // grab handles on both ends of the hood
      ;[-1.5, 1.5].forEach((x, i) => {
        const hn = spawn([x, 0.34, 0.86], [x, 4.6, 5], 3.4 + i * 0.06, 0.6)
        mesh(hn, Cyl(0.03, 0.03, 0.42, 10), steelM, 0, 0, 0, 0, 0, Math.PI / 2)
        mesh(hn, Cyl(0.028, 0.028, 0.12, 8), steelM, -0.19, 0, -0.06, Math.PI / 2, 0, 0)
        mesh(hn, Cyl(0.028, 0.028, 0.12, 8), steelM, 0.19, 0, -0.06, Math.PI / 2, 0, 0)
      })

      // ══ 3. QUARTZ TUBE (slides in axially, then rotates) ════════
      const tubeCarrier = spawn([0, 0.02, 0], [9.5, 0.02, 0], 3.6, 0.9, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2])
      const tubeSpin = new THREE.Group()
      tubeCarrier.add(tubeSpin)
      mesh(tubeSpin, Cyl(0.3, 0.3, 6.4, 30), glassM)
      ;[-2.4, -1.2, 0, 1.2, 2.4].forEach(y => mesh(tubeSpin, Tor(0.31, 0.014, 26), steelM, 0, y, 0, Math.PI / 2, 0, 0))

      // water-cooled end flanges + bolt rings + hoses
      ;[-2.55, 2.55].forEach((x, side) => {
        const dirSign = x < 0 ? -1 : 1
        const fl = spawn([x, 0.02, 0], [dirSign * 9, 0.02, 0], 4.0 + side * 0.1, 0.8, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2])
        mesh(fl, Cyl(0.52, 0.52, 0.3, 30), steelM)
        mesh(fl, Cyl(0.56, 0.56, 0.07, 30), darkM, 0, 0.16, 0)
        mesh(fl, Cyl(0.36, 0.36, 0.34, 24), M(0x9FB3C0, 0.9, 0.16))
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2
          mesh(fl, Cyl(0.035, 0.035, 0.36, 8), boltM, 0.42 * Math.cos(a), 0, 0.42 * Math.sin(a))
        }
        // end cap
        const cap = spawn([x + dirSign * 0.42, 0.02, 0], [dirSign * 10, 1.6, 0], 4.4 + side * 0.1, 0.7, [0, 0, Math.PI / 2], [0, 0, Math.PI / 2])
        mesh(cap, Cyl(0.4, 0.4, 0.14, 26), steelM)
        mesh(cap, Cyl(0.1, 0.1, 0.26, 14), brassM, 0, 0.14, 0)
        // cooling hoses
        const hose = spawn([x + dirSign * 0.1, -0.42, 0.34], [dirSign * 8, -3.6, 3], 4.8 + side * 0.08, 0.7, [0.5 * dirSign, 0, 0.35 * dirSign], [1.4, 0.6, 0])
        mesh(hose, Cyl(0.055, 0.055, 1.0, 12), rubberM)
        mesh(hose, Cyl(0.07, 0.07, 0.1, 12), brassM, 0, 0.5, 0)
      })

      // ══ 4. GAS PANEL (left) ═════════════════════════════════════
      const gasPanel = spawn([-4.35, 0.62, -0.35], [-11, 0.62, -0.35], 4.9, 0.9)
      mesh(gasPanel, Box(1.7, 1.9, 0.12), panelM)
      mesh(gasPanel, Box(1.76, 0.08, 0.16), steelM, 0, 0.95, 0)
      mesh(gasPanel, Box(1.76, 0.08, 0.16), steelM, 0, -0.95, 0)
      // panel support posts
      ;[-0.72, 0.72].forEach(x => mesh(gasPanel, Box(0.08, 1.5, 0.08), steelM, x, -1.62, 0))

      // 4 rotameters with floats
      const floats: { m: THREE.Mesh; baseY: number; phase: number }[] = []
      for (let i = 0; i < 4; i++) {
        const x = -0.6 + i * 0.4
        const rm = spawn([-4.35 + x, 0.72, -0.2], [-10.5, 2.6 + i * 0.3, -0.2], 5.2 + i * 0.09, 0.6)
        mesh(rm, Cyl(0.075, 0.075, 0.86, 18), glassM)
        mesh(rm, Cyl(0.09, 0.09, 0.08, 16), steelM, 0, 0.45, 0)
        mesh(rm, Cyl(0.09, 0.09, 0.08, 16), steelM, 0, -0.45, 0)
        mesh(rm, Box(0.03, 0.8, 0.01), M(0xE6EDF2, 0.2, 0.6), 0.085, 0, 0)  // scale strip
        const fl = mesh(rm, Cyl(0.05, 0.05, 0.07, 12), M(0x2C6FB5, 0.6, 0.3), 0, -0.34, 0)
        floats.push({ m: fl, baseY: -0.34, phase: i * 1.3 })
        // needle valve under each tube
        const kn = spawn([-4.35 + x, 0.05, -0.12], [-10.5, -2.2 - i * 0.2, -0.12], 5.5 + i * 0.08, 0.55)
        mesh(kn, Cyl(0.045, 0.045, 0.16, 12), steelM, 0, 0.06, 0)
        mesh(kn, Cyl(0.11, 0.09, 0.07, 16), i % 2 ? knobBluM : knobRedM, 0, -0.05, 0)
      }
      // regulator + 2 round gauges on the panel
      const reg = spawn([-4.9, -0.42, -0.2], [-11, -0.42, 2.5], 5.6, 0.7)
      mesh(reg, Cyl(0.19, 0.19, 0.22, 20), gaugeM, 0, 0, 0, Math.PI / 2, 0, 0)
      mesh(reg, Cyl(0.09, 0.09, 0.2, 14), brassM, 0, -0.2, 0)
      const gaugeNeedles: THREE.Mesh[] = []
      ;[-0.2, 0.34].forEach((gx, i) => {
        const gg = spawn([-4.35 + gx, -0.5, -0.12], [-10.8, -0.5 + i, 3], 5.75 + i * 0.1, 0.6)
        mesh(gg, Cyl(0.17, 0.17, 0.08, 24), gaugeM, 0, 0, 0, Math.PI / 2, 0, 0)
        mesh(gg, new THREE.CircleGeometry(0.14, 24), gaugeFaceM, 0, 0, 0.05)
        const nd = mesh(gg, Box(0.11, 0.012, 0.004), knobRedM, 0.03, 0, 0.06)
        gaugeNeedles.push(nd)
      })
      // gas delivery lines toward the tube inlet
      ;[0.32, 0.16, 0.0].forEach((yOff, i) => {
        mesh(spawn([-3.55, -0.28 + yOff, -0.15], [-10, -3, -0.15], 5.9 + i * 0.07, 0.6, [0, 0, Math.PI / 2], [0, 0.4, Math.PI / 2]),
          Cyl(0.032, 0.032, 1.5, 10), i === 0 ? steelM : brassM)
      })

      // ══ 5. VACUUM PUMP (right) ══════════════════════════════════
      const pumpBase = spawn([4.35, -0.62, 0.1], [11, -0.62, 0.1], 6.2, 0.85)
      mesh(pumpBase, Box(1.5, 0.14, 1.0), darkM)
      ;[-0.6, 0.6].forEach(x => [-0.36, 0.36].forEach(z => mesh(pumpBase, Cyl(0.07, 0.07, 0.12, 12), rubberM, x, -0.12, z)))
      const pumpBody = spawn([4.2, -0.24, 0.1], [11, 1.6, 0.1], 6.45, 0.8)
      mesh(pumpBody, Cyl(0.38, 0.38, 1.1, 26), pumpM, 0, 0, 0, 0, 0, Math.PI / 2)
      mesh(pumpBody, Cyl(0.41, 0.41, 0.07, 26), darkM, -0.5, 0, 0, 0, 0, Math.PI / 2)
      mesh(pumpBody, Cyl(0.41, 0.41, 0.07, 26), darkM, 0.5, 0, 0, 0, 0, Math.PI / 2)
      mesh(pumpBody, Box(0.5, 0.18, 0.6), darkM, 0, -0.34, 0)
      // motor + cooling fan
      const motor = spawn([5.15, -0.24, 0.1], [11.5, -0.24, 3], 6.65, 0.7)
      mesh(motor, Cyl(0.3, 0.3, 0.62, 22), M(0x4A6A82, 0.7, 0.3), 0, 0, 0, 0, 0, Math.PI / 2)
      for (let i = 0; i < 8; i++) {
        mesh(motor, Box(0.56, 0.03, 0.05), darkM, 0, 0.3 * Math.cos((i / 8) * Math.PI * 2), 0.3 * Math.sin((i / 8) * Math.PI * 2), (i / 8) * Math.PI * 2, 0, 0)
      }
      const pumpFanCarrier = new THREE.Group()
      pumpFanCarrier.position.set(0.38, 0, 0)
      pumpFanCarrier.rotation.z = Math.PI / 2
      motor.add(pumpFanCarrier)
      const pumpFan = new THREE.Group()
      pumpFanCarrier.add(pumpFan)
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2
        mesh(pumpFan, Box(0.19, 0.02, 0.07), steelM, 0.11 * Math.cos(a), 0, 0.11 * Math.sin(a), 0, a, 0.4)
      }
      // exhaust piping up from the pump, elbowed back over the cabinet
      mesh(spawn([4.2, 0.42, 0.1], [11, 3.4, 0.1], 6.85, 0.7), Cyl(0.13, 0.13, 0.9, 18), steelM)
      mesh(spawn([4.2, 0.87, 0.1], [11, 4.2, 0.1], 6.95, 0.6), Tor(0.16, 0.13, 20), steelM, 0, 0, 0, 0, Math.PI / 2, 0)
      mesh(spawn([4.2, 1.03, -0.35], [11, 4.8, -0.35], 7.05, 0.6, [Math.PI / 2, 0, 0], [Math.PI / 2, 0.4, 0]), Cyl(0.13, 0.13, 0.9, 18), steelM)
      mesh(spawn([4.2, 1.03, -0.85], [11, 5.2, -0.85], 7.15, 0.5), Cyl(0.17, 0.17, 0.07, 20), darkM, 0, 0, 0, Math.PI / 2, 0, 0)
      // inlet line from tube outlet flange to the pump
      mesh(spawn([3.35, -0.2, 0.1], [10.5, -3, 0.1], 7.1, 0.6), Cyl(0.1, 0.1, 0.9, 14), rubberM, 0, 0, 0, 0, 0, 0.35)

      // ══ 6. CONTROL CABINET (right, behind pump) ═════════════════
      const cab = spawn([6.55, -0.42, -0.35], [12.5, -0.42, -0.35], 6.9, 0.95)
      mesh(cab, Box(1.5, 2.0, 0.9), panelM)
      mesh(cab, Box(1.56, 0.09, 0.96), steelM, 0, 1.02, 0)
      mesh(cab, Box(1.56, 0.09, 0.96), darkM, 0, -1.0, 0)
      ;[-0.62, 0.62].forEach(x => [-0.34, 0.34].forEach(z => mesh(cab, Cyl(0.07, 0.07, 0.1, 12), rubberM, x, -1.08, z)))
      // front panel faces the viewer (+Z), flush on the cabinet front
      const cabFace = spawn([6.55, -0.32, 0.12], [12.5, 3.4, 0.6], 7.2, 0.75)
      mesh(cabFace, Box(1.24, 1.5, 0.05), M(0x1B242D, 0.4, 0.42))
      // PID display
      mesh(cabFace, Box(0.78, 0.32, 0.03), M(0x0C1218, 0.3, 0.4), 0, 0.46, 0.03)
      const displayBars: THREE.Mesh[] = []
      for (let i = 0; i < 4; i++) {
        displayBars.push(mesh(cabFace, Box(0.1, 0.2, 0.02), displayM, -0.27 + i * 0.18, 0.46, 0.05))
      }
      // indicator LEDs
      const leds: THREE.Mesh[] = []
      for (let i = 0; i < 6; i++) {
        leds.push(mesh(cabFace, Sph(0.042), ledMats[i], -0.34 + i * 0.135, 0.16, 0.05))
      }
      // knobs + e-stop
      ;[-0.32, -0.02, 0.28].forEach((x, i) => {
        mesh(cabFace, Cyl(0.085, 0.07, 0.09, 16), i === 1 ? knobBluM : gaugeM, x, -0.14, 0.06, Math.PI / 2, 0, 0)
      })
      mesh(cabFace, Cyl(0.15, 0.15, 0.03, 20), M(0xE8B830, 0.3, 0.5), 0.28, -0.52, 0.04, Math.PI / 2, 0, 0)
      mesh(cabFace, Cyl(0.12, 0.12, 0.08, 20), knobRedM, 0.28, -0.52, 0.07, Math.PI / 2, 0, 0)
      // labelled switch row
      ;[-0.35, -0.15, 0.05].forEach(x => {
        mesh(cabFace, Box(0.1, 0.05, 0.04), steelM, x, -0.52, 0.05)
      })
      // cabinet ventilation slots
      for (let i = 0; i < 5; i++) {
        mesh(spawn([6.55, -1.18 + i * 0.11, -0.81], [9 + i, 3.5, -5], 7.4 + i * 0.04, 0.4), Box(0.7, 0.035, 0.02), darkM)
      }

      // ══ 7. CABLE TRAY + CABLES ══════════════════════════════════
      mesh(spawn([1.6, -1.2, -0.55], [1.6, -6.5, -0.55], 7.6, 0.7), Box(6.5, 0.06, 0.28), darkM)
      ;[0, 1, 2].forEach(i => {
        mesh(spawn([1.6 + i * 0.05, -1.12 + i * 0.05, -0.55], [8, -5.5, -3], 7.75 + i * 0.08, 0.6, [0, 0, Math.PI / 2 + (i - 1) * 0.04], [0.6, 0.4, 1.2]),
          Cyl(0.035, 0.035, 6.2, 10), rubberM)
      })
      // power cable from cabinet down to the tray
      mesh(spawn([5.75, -0.95, -0.5], [10, -4, -3], 7.95, 0.6, [0, 0, 0.85], [1.2, 0, 0]), Cyl(0.04, 0.04, 1.7, 10), rubberM)

      // ══ 8. GAS CYLINDERS (left, standing on the floor) ══════════
      const cylColors = [0x2C6FB5, 0xC1352B, 0x3E8E5A]
      cylColors.forEach((c, i) => {
        const bx = -6.55 + i * 0.62
        const bz = -0.9 + i * 0.32
        const gc = spawn([bx, -1.35, bz], [bx - 5, -1.35, bz], 4.4 + i * 0.12, 0.85)
        mesh(gc, Cyl(0.26, 0.26, 1.65, 24), M(c, 0.5, 0.38))
        mesh(gc, Cyl(0.26, 0.2, 0.22, 24), M(c, 0.5, 0.38), 0, 0.92, 0)     // shoulder
        mesh(gc, Cyl(0.075, 0.075, 0.2, 14), brassM, 0, 1.1, 0)             // valve neck
        mesh(gc, Cyl(0.15, 0.15, 0.1, 18), gaugeM, 0, 1.24, 0)              // regulator body
        mesh(gc, Cyl(0.11, 0.11, 0.05, 18), gaugeFaceM, 0.13, 1.3, 0, 0, 0, Math.PI / 2)
        mesh(gc, Cyl(0.05, 0.05, 0.14, 12), knobRedM, -0.14, 1.24, 0, 0, 0, Math.PI / 2)
        mesh(gc, Cyl(0.28, 0.28, 0.06, 24), darkM, 0, -0.85, 0)             // foot ring
        // hose up to the gas panel
        mesh(gc, Cyl(0.03, 0.03, 1.5, 10), rubberM, 0.55 + i * 0.05, 1.0, 0.3, 0, 0, -1.15)
      })
      // safety chain rail behind the cylinders
      mesh(spawn([-5.95, -0.72, -0.55], [-12, -0.72, -0.55], 4.9, 0.6), Box(2.1, 0.05, 0.05), steelM)

      // ══ 9. CHILLER UNDER THE BENCH ══════════════════════════════
      const chiller = spawn([-2.6, -1.65, -0.1], [-2.6, -7, -0.1], 5.0, 0.8)
      mesh(chiller, Box(1.4, 0.85, 1.1), panelM)
      mesh(chiller, Box(1.44, 0.06, 1.14), steelM, 0, 0.44, 0)
      mesh(chiller, Box(0.5, 0.3, 0.03), M(0x0C1218, 0.3, 0.4), -0.35, 0.12, 0.56)
      const chillerBars = [0, 1].map(i => mesh(chiller, Box(0.12, 0.16, 0.02), displayM, -0.48 + i * 0.2, 0.12, 0.58))
      ;[0.2, 0.42].forEach(x => mesh(chiller, Cyl(0.06, 0.05, 0.06, 14), knobBluM, x, 0.12, 0.57, Math.PI / 2, 0, 0))
      // chiller grille + rolling casters
      for (let i = 0; i < 4; i++) mesh(chiller, Box(0.55, 0.03, 0.02), darkM, 0.22, -0.12 - i * 0.08, 0.56)
      ;[-0.5, 0.5].forEach(x => [-0.4, 0.4].forEach(z => mesh(chiller, Sph(0.08), rubberM, x, -0.48, z)))
      // coolant hoses from chiller up to the tube flanges
      ;[0, 1].forEach(i => {
        mesh(spawn([-2.05 + i * 0.16, -1.05, 0.35], [-9, -5, 3], 5.15 + i * 0.1, 0.7, [0.9, 0.25, 0.55 + i * 0.1], [1.5, 0.8, 0]),
          Cyl(0.038, 0.038, 1.5, 10), rubberM)
      })

      // ══ 10. OPERATOR MONITOR + BENCH ODDMENTS ═══════════════════
      const mon = spawn([2.65, -0.2, 0.62], [2.65, 5.6, 0.62], 7.5, 0.75)
      mesh(mon, Box(0.9, 0.55, 0.05), M(0x11181F, 0.4, 0.4), 0, 0, 0, -0.12, 0, 0)
      const monScreen = mesh(mon, Box(0.82, 0.47, 0.02), displayM, 0, 0.01, 0.04, -0.12, 0, 0)
      mesh(mon, Cyl(0.05, 0.05, 0.34, 12), steelM, 0, -0.42, 0.04)
      mesh(mon, Cyl(0.22, 0.22, 0.04, 20), steelM, 0, -0.6, 0.06)
      // sample boat + crucibles on the bench
      const tray = spawn([-1.0, -0.72, 0.75], [-1.0, -6, 0.75], 7.7, 0.6)
      mesh(tray, Box(0.85, 0.05, 0.34), steelM)
      mesh(tray, Box(0.85, 0.09, 0.03), steelM, 0, 0.05, -0.16)
      ;[-0.24, 0, 0.24].forEach((x, i) => {
        mesh(tray, Cyl(0.075, 0.06, 0.13, 16), ceramicM, x, 0.09, 0.02)
        if (i === 1) mesh(tray, Cyl(0.055, 0.055, 0.015, 16), M(0x8899A6, 0.6, 0.4), x, 0.16, 0.02)
      })
      // tongs lying on the bench
      mesh(spawn([0.5, -0.74, 0.82], [0.5, -6, 3], 7.85, 0.5, [0, 0.35, Math.PI / 2], [0.8, 0.9, 1.2]), Cyl(0.018, 0.018, 0.75, 8), steelM)

      // ── Ground shadow ───────────────────────────────────────────
      const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.16 }))
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = -2.36
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      // Re-time everything into a strict queue: parts authored at roughly the
      // same moment form one step (a bolt ring goes in together) and each step
      // waits for the previous one, so only one thing is ever in flight.
      const STEP = 0.68
      const FLIGHT = 0.6
      {
        const ordered = [...parts].sort((a, b) => a.delay - b.delay)
        let step = -1
        let lastKey = Number.NEGATIVE_INFINITY
        for (const p of ordered) {
          const key = Math.round(p.delay / 0.25)
          if (key !== lastKey) { step++; lastKey = key }
          p.delay = step * STEP
          p.duration = FLIGHT
        }
      }
      const TIME_SCALE = 1
      const ASSEMBLY_END = Math.max(...parts.map(p => p.delay + p.duration)) + 0.3

      // ── Animate ─────────────────────────────────────────────────
      const clock = new THREE.Clock()
      let elapsed = 0

      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const dt = Math.min(clock.getDelta(), 0.05)
        elapsed += dt
        const t = elapsed

        for (const p of parts) {
          const delay = p.delay * TIME_SCALE
          const duration = p.duration * TIME_SCALE
          // stays hidden until it launches, so nothing clutters the frame
          if (t < delay) {
            p.group.visible = false
            continue
          }
          p.group.visible = true
          const raw = THREE.MathUtils.clamp((t - delay) / duration, 0, 1)
          const e = easeOutCubic(raw)
          p.group.position.lerpVectors(p.start, p.end, e)
          p.group.rotation.x = lerp(p.startRot.x, p.endRot.x, e)
          p.group.rotation.y = lerp(p.startRot.y, p.endRot.y, e)
          p.group.rotation.z = lerp(p.startRot.z, p.endRot.z, e)
          if (raw >= 1) {
            const since = t - (delay + duration)
            p.group.scale.setScalar(since < 0.35 ? 1 + 0.07 * (1 - since / 0.35) : 1)
          } else {
            p.group.scale.setScalar(0.94 + 0.06 * e)   // eases in instead of popping
          }
        }

        // power-on ramp once the rig is fully built
        const power = THREE.MathUtils.clamp((t - ASSEMBLY_END) / 1.6, 0, 1)

        heatM.emissiveIntensity = power * (1.5 + Math.sin(t * 5) * 0.12)
        displayM.emissiveIntensity = power * 1.4
        displayBars.forEach((b, i) => {
          b.scale.y = power ? 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2.4 + i)) : 0.001
        })
        chillerBars.forEach((b, i) => {
          b.scale.y = power ? 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 2)) : 0.001
        })
        monScreen.scale.setScalar(power ? 1 : 0.001)
        ledMats.forEach((m, i) => {
          const blink = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.1)
          m.emissiveIntensity = power * (0.35 + blink * 1.1)
        })
        leds.forEach((l, i) => { l.scale.setScalar(1 + power * 0.08 * Math.sin(t * 2.2 + i * 1.1)) })

        tubeSpin.rotation.y += power * 0.9 * dt
        pumpFan.rotation.y += power * 12 * dt
        ventFan.rotation.y += power * 5 * dt

        floats.forEach((f, i) => {
          const lift = power * (0.28 + 0.16 * (0.5 + 0.5 * Math.sin(t * (1.6 + i * 0.35) + f.phase)))
          f.m.position.y = f.baseY + lift
        })
        gaugeNeedles.forEach((n, i) => {
          n.rotation.z = -0.8 + power * (1.1 + Math.sin(t * 1.4 + i) * 0.28)
        })

        // slow push-in once assembled, so the detailing is readable
        const push = easeOutCubic(THREE.MathUtils.clamp((t - ASSEMBLY_END) / 4, 0, 1))
        camera.position.copy(TARGET).addScaledVector(VIEW_DIR, baseDist * (1 - 0.1 * push))
        camera.lookAt(TARGET)

        // gentle showcase sway — keeps the wide rig readable head-on
        rig.rotation.y = Math.sin(t * 0.16) * 0.19 - 0.05
        rig.rotation.x = Math.sin(t * 0.21) * 0.045

        renderer!.render(scene, camera)
      }
      animate()

      onResize = () => {
        if (!canvas) return
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        camera.aspect = cw / ch
        camera.updateProjectionMatrix()
        fitCamera()
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
  }, [height])

  if (webglFailed) return <RigFallback height={height} />

  return <canvas ref={canvasRef} style={{ width: '100%', height, display: 'block' }} />
}
