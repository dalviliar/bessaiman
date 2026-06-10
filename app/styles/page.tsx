'use client'

import { useState } from 'react'
import Link from 'next/link'

const styles = [
  {
    id: 'a', href: '/style-a',
    label: 'Стиль A', tag: 'Молекулярный',
    desc: 'Тёмный фон, анимированная сетка частиц, сонарные кольца.',
    accent: '#0EA5E9', tagColor: '#38BDF8', tagBg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.2)', borderHov: 'rgba(14,165,233,0.55)',
    preview: () => (
      <svg viewBox="0 0 360 200" className="w-full h-full" style={{ background: '#030608' }}>
        <defs>
          <radialGradient id="pgA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#030608" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="360" height="200" fill="#030608" />
        {Array.from({ length: 10 }).map((_, i) => Array.from({ length: 6 }).map((_, j) => (
          <circle key={`${i}-${j}`} cx={i * 40 + 20} cy={j * 36 + 18} r="0.8" fill="rgba(14,165,233,0.1)" />
        )))}
        <circle cx="180" cy="100" r="280" fill="url(#pgA)" />
        {/* Connections */}
        {[[70,55,145,90],[145,90,215,60],[215,60,275,115],[145,90,180,145],[70,55,105,140],[275,115,240,160]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(14,165,233,0.3)" strokeWidth="1"/>
        ))}
        {/* Animated particles */}
        <circle cx="70" cy="55" r="4" fill="#0EA5E9" fillOpacity="0.85">
          <animate attributeName="r" values="4;5.5;4" dur="3s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="145" cy="90" r="6" fill="#38BDF8" fillOpacity="0.9">
          <animate attributeName="r" values="6;7.5;6" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="215" cy="60" r="3.5" fill="#0EA5E9" fillOpacity="0.7">
          <animate attributeName="r" values="3.5;5;3.5" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="275" cy="115" r="4.5" fill="#0EA5E9" fillOpacity="0.6">
          <animate attributeName="fill-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="145" r="3" fill="#38BDF8" fillOpacity="0.7">
          <animate attributeName="r" values="3;4.5;3" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="105" cy="140" r="2.5" fill="#0EA5E9" fillOpacity="0.5">
          <animate attributeName="fill-opacity" values="0.5;0.9;0.5" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="240" cy="160" r="3" fill="#38BDF8" fillOpacity="0.55">
          <animate attributeName="r" values="3;4;3" dur="3.2s" repeatCount="indefinite" />
        </circle>
        {/* Sonar rings */}
        <circle cx="180" cy="100" r="38" fill="none" stroke="rgba(14,165,233,0.12)" strokeWidth="1">
          <animate attributeName="r" values="38;42;38" dur="4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.12;0.22;0.12" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="100" r="65" fill="none" stroke="rgba(14,165,233,0.07)" strokeWidth="1">
          <animate attributeName="r" values="65;70;65" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="100" r="92" fill="none" stroke="rgba(14,165,233,0.04)" strokeWidth="1" />
        {/* Scan line */}
        <line x1="0" y1="0" x2="360" y2="0" stroke="rgba(14,165,233,0.5)" strokeWidth="1">
          <animate attributeName="y1" values="0;200;0" dur="6s" repeatCount="indefinite" />
          <animate attributeName="y2" values="0;200;0" dur="6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0;0.5;0" dur="6s" repeatCount="indefinite" />
        </line>
        <text x="180" y="184" textAnchor="middle" fontSize="8" fill="rgba(56,189,248,0.65)" fontFamily="monospace" letterSpacing="3">BES SAIMAN GROUP</text>
      </svg>
    ),
  },
  {
    id: 'b', href: '/style-b',
    label: 'Стиль B', tag: 'Механический',
    desc: 'Синий фон, вращающиеся шестерёнки, чертёжная сетка.',
    accent: '#3B82F6', tagColor: '#60A5FA', tagBg: 'rgba(30,92,168,0.12)',
    border: 'rgba(30,92,168,0.25)', borderHov: 'rgba(59,130,246,0.55)',
    preview: () => (
      <svg viewBox="0 0 360 200" className="w-full h-full" style={{ background: '#0C1828' }}>
        <rect width="360" height="200" fill="#0C1828" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" stroke="rgba(50,110,200,0.14)" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="360" y2={i * 40} stroke="rgba(50,110,200,0.14)" strokeWidth="1" />
        ))}
        {/* Gear 1 - rotating, more visible */}
        <g style={{ transformOrigin: '155px 100px', animation: 'gear-spin 8s linear infinite' }}>
          <circle cx="155" cy="100" r="62" fill="rgba(42,110,216,0.15)" stroke="#2A6ED8" strokeWidth="13" strokeDasharray="8 5" />
          <circle cx="155" cy="100" r="36" fill="rgba(42,110,216,0.2)" stroke="#3A80E8" strokeWidth="2" />
          {[0,60,120,180,240,300].map((d,i)=>(
            <line key={i} x1={155} y1={100}
              x2={155+28*Math.cos(d*Math.PI/180)} y2={100+28*Math.sin(d*Math.PI/180)}
              stroke="#3A80E8" strokeWidth="5" strokeOpacity="0.7" />
          ))}
        </g>
        <circle cx="155" cy="100" r="11" fill="#3A80E8" />
        <circle cx="155" cy="100" r="5" fill="#0C1828" />
        {/* Gear 2 - counter rotating */}
        <g style={{ transformOrigin: '268px 62px', animation: 'gear-spin-rev 5s linear infinite' }}>
          <circle cx="268" cy="62" r="36" fill="rgba(42,110,216,0.12)" stroke="#2A6ED8" strokeWidth="10" strokeDasharray="6 4" />
          <circle cx="268" cy="62" r="19" fill="rgba(42,110,216,0.18)" stroke="#3A80E8" strokeWidth="1.5" />
          {[0,90,180,270].map((d,i)=>(
            <line key={i} x1={268} y1={62}
              x2={268+14*Math.cos(d*Math.PI/180)} y2={62+14*Math.sin(d*Math.PI/180)}
              stroke="#3A80E8" strokeWidth="4" strokeOpacity="0.7" />
          ))}
        </g>
        <circle cx="268" cy="62" r="7" fill="#3A80E8" />
        <circle cx="268" cy="62" r="3" fill="#0C1828" />
        {/* Gear 3 - rotating */}
        <g style={{ transformOrigin: '268px 148px', animation: 'gear-spin 4s linear infinite' }}>
          <circle cx="268" cy="148" r="24" fill="rgba(42,110,216,0.1)" stroke="#2A6ED8" strokeWidth="8" strokeDasharray="5 3" />
          <circle cx="268" cy="148" r="12" fill="rgba(42,110,216,0.15)" stroke="#3A80E8" strokeWidth="1.5" />
          {[0,120,240].map((d,i)=>(
            <line key={i} x1={268} y1={148}
              x2={268+9*Math.cos(d*Math.PI/180)} y2={148+9*Math.sin(d*Math.PI/180)}
              stroke="#3A80E8" strokeWidth="3.5" strokeOpacity="0.7" />
          ))}
        </g>
        <circle cx="268" cy="148" r="5" fill="#3A80E8" />
        <circle cx="268" cy="148" r="2" fill="#0C1828" />
        <text x="180" y="188" textAnchor="middle" fontSize="8" fill="rgba(58,128,232,0.75)" fontFamily="monospace" letterSpacing="3">BES SAIMAN GROUP</text>
      </svg>
    ),
  },
  {
    id: 'c', href: '/style-c',
    label: 'Стиль C', tag: 'Чистый',
    desc: 'Светлый фон, крупная типографика, современный корпоративный.',
    accent: '#1565C0', tagColor: '#1565C0', tagBg: 'rgba(21,101,192,0.08)',
    border: 'rgba(21,101,192,0.15)', borderHov: 'rgba(21,101,192,0.45)',
    preview: () => (
      <svg viewBox="0 0 360 200" className="w-full h-full" style={{ background: '#F6F8FB' }}>
        <rect width="360" height="200" fill="#F6F8FB" />
        <line x1="-50" y1="140" x2="450" y2="-40" stroke="#1565C0" strokeWidth="0.6" strokeOpacity="0.1" />
        <line x1="-50" y1="240" x2="450" y2="60" stroke="#1565C0" strokeWidth="0.4" strokeOpacity="0.07" />
        <circle cx="300" cy="30" r="75" fill="none" stroke="#1565C0" strokeWidth="0.8" strokeOpacity="0.07">
          <animate attributeName="r" values="75;82;75" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="30" r="50" fill="none" stroke="#0EA5E9" strokeWidth="0.5" strokeOpacity="0.05" />
        <rect x="28" y="22" width="2.5" height="28" fill="#1565C0" fillOpacity="0.22" />
        <rect x="28" y="22" width="28" height="2.5" fill="#1565C0" fillOpacity="0.22" />
        <text x="52" y="58" fontSize="30" fontWeight="900" fill="#0D1B2A" fontFamily="Inter,sans-serif" letterSpacing="-1.2">BES</text>
        <defs>
          <linearGradient id="gcPrev" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1565C0" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <text x="52" y="92" fontSize="30" fontWeight="900" fontFamily="Inter,sans-serif" letterSpacing="-1.2" fill="url(#gcPrev)">SAIMAN</text>
        <rect x="52" y="100" width="170" height="1.5" fill="url(#gcPrev)" fillOpacity="0.3" rx="1" />
        <text x="52" y="118" fontSize="7" fill="#4A6070" fontFamily="Inter,sans-serif">Лабораторное оборудование Казахстана</text>
        {/* Animated dots */}
        <circle cx="52" cy="135" r="1.5" fill="#1565C0" fillOpacity="0.3">
          <animate attributeName="fill-opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="135" r="1.5" fill="#1565C0" fillOpacity="0.2">
          <animate attributeName="fill-opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="68" cy="135" r="1.5" fill="#1565C0" fillOpacity="0.15">
          <animate attributeName="fill-opacity" values="0.15;0.6;0.15" dur="3s" repeatCount="indefinite" />
        </circle>
        <rect x="52" y="148" width="68" height="20" rx="5" fill="#1565C0" />
        <text x="86" y="162" textAnchor="middle" fontSize="7" fill="white" fontFamily="Inter,sans-serif" fontWeight="600">Каталог</text>
        <rect x="130" y="148" width="68" height="20" rx="5" fill="white" stroke="#BBDEFB" strokeWidth="1" />
        <text x="164" y="162" textAnchor="middle" fontSize="7" fill="#1565C0" fontFamily="Inter,sans-serif" fontWeight="600">Связаться</text>
        {/* Stats cards */}
        <rect x="230" y="45" width="105" height="46" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1" />
        <text x="250" y="67" fontSize="18" fontWeight="900" fill="#1565C0" fontFamily="Inter,sans-serif">200+</text>
        <text x="250" y="82" fontSize="6.5" fill="#94A3B8" fontFamily="Inter,sans-serif">позиций в каталоге</text>
        <rect x="230" y="100" width="105" height="46" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1" />
        <text x="250" y="122" fontSize="18" fontWeight="900" fill="#0EA5E9" fontFamily="Inter,sans-serif">12 лет</text>
        <text x="250" y="137" fontSize="6.5" fill="#94A3B8" fontFamily="Inter,sans-serif">на рынке Казахстана</text>
      </svg>
    ),
  },
  {
    id: 'd', href: '/style-d',
    label: 'Стиль D', tag: 'Стальной',
    desc: 'Хромированная эстетика, прецизионный циферблат, металлический стиль.',
    accent: '#8AAABB', tagColor: '#A0C0D0', tagBg: 'rgba(140,180,200,0.08)',
    border: 'rgba(140,180,200,0.15)', borderHov: 'rgba(140,180,200,0.4)',
    preview: () => (
      <svg viewBox="0 0 360 200" className="w-full h-full" style={{ background: '#05090E' }}>
        <defs>
          <radialGradient id="pgD" cx="65%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#4A7090" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#05090E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="steelG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8AAABB" />
            <stop offset="40%" stopColor="#C8D8E4" />
            <stop offset="100%" stopColor="#6A8A9A" />
          </linearGradient>
        </defs>
        <rect width="360" height="200" fill="#05090E" />
        <rect width="360" height="200" fill="url(#pgD)" />
        {/* Grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="200" stroke="rgba(70,110,140,0.06)" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="360" y2={i * 40} stroke="rgba(70,110,140,0.06)" strokeWidth="1" />
        ))}
        {/* Corner */}
        <path d="M12 12 L12 30 M12 12 L30 12" stroke="rgba(140,180,200,0.2)" strokeWidth="1.2" fill="none" />

        {/* Rotating precision dial */}
        <g style={{ transformOrigin: '245px 100px', animation: 'gear-spin 20s linear infinite' }}>
          <circle cx="245" cy="100" r="78" fill="none" stroke="url(#steelG)" strokeWidth="2" strokeOpacity="0.4" />
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i * 7.5) * Math.PI / 180
            const isMaj = i % 4 === 0
            const r1 = isMaj ? 66 : 71
            return (
              <line key={i}
                x1={245 + r1 * Math.cos(a)} y1={100 + r1 * Math.sin(a)}
                x2={245 + 77 * Math.cos(a)} y2={100 + 77 * Math.sin(a)}
                stroke={isMaj ? '#8AAABB' : '#3A5A6A'}
                strokeWidth={isMaj ? 1.5 : 0.7} />
            )
          })}
        </g>
        {/* Counter rotating inner */}
        <g style={{ transformOrigin: '245px 100px', animation: 'gear-spin-rev 12s linear infinite' }}>
          <circle cx="245" cy="100" r="52" fill="none" stroke="rgba(140,180,200,0.2)" strokeWidth="1" />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i * 15) * Math.PI / 180
            return (
              <line key={i}
                x1={245 + 47 * Math.cos(a)} y1={100 + 47 * Math.sin(a)}
                x2={245 + 52 * Math.cos(a)} y2={100 + 52 * Math.sin(a)}
                stroke="rgba(140,180,200,0.25)" strokeWidth="0.8" />
            )
          })}
        </g>
        {/* Center */}
        <circle cx="245" cy="100" r="36" fill="rgba(10,16,24,0.95)" />
        <circle cx="245" cy="100" r="36" fill="none" stroke="url(#steelG)" strokeWidth="2" strokeOpacity="0.5" />
        <text x="245" y="95" textAnchor="middle" fontSize="9" fontWeight="900" fill="#C8D8E4" fontFamily="Inter,sans-serif" letterSpacing="2">BES</text>
        <text x="245" y="107" textAnchor="middle" fontSize="8" fontWeight="900" fill="url(#steelG)" fontFamily="Inter,sans-serif" letterSpacing="1.5">SAIMAN</text>
        <circle cx="245" cy="100" r="4" fill="#8AAABB" />

        {/* Left text */}
        <text x="30" y="60" fontSize="7" fill="rgba(140,180,200,0.3)" fontFamily="monospace" letterSpacing="4">PRECISION</text>
        <text x="30" y="80" fontSize="28" fontWeight="900" fontFamily="Inter,sans-serif" letterSpacing="-1" fill="url(#steelG)">BES</text>
        <text x="30" y="108" fontSize="28" fontWeight="900" fontFamily="Inter,sans-serif" letterSpacing="-1" fill="url(#steelG)">SAIMAN</text>
        <line x1="30" y1="115" x2="140" y2="115" stroke="rgba(140,180,200,0.15)" strokeWidth="1" />
        <text x="30" y="128" fontSize="6.5" fill="rgba(100,150,170,0.6)" fontFamily="monospace" letterSpacing="2">GROUP</text>
        <text x="30" y="155" fontSize="6.5" fill="rgba(70,110,130,0.5)" fontFamily="Inter,sans-serif">Лабораторное оборудование</text>
        <text x="30" y="168" fontSize="6.5" fill="rgba(70,110,130,0.4)" fontFamily="Inter,sans-serif">высшего класса</text>

        {/* Scan */}
        <line x1="0" y1="0" x2="360" y2="0" stroke="rgba(140,180,200,0.3)" strokeWidth="0.8">
          <animate attributeName="y1" values="0;200;0" dur="8s" repeatCount="indefinite" />
          <animate attributeName="y2" values="0;200;0" dur="8s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0;0.3;0" dur="8s" repeatCount="indefinite" />
        </line>
      </svg>
    ),
  },
  {
    id: 'e', href: '/style-e',
    label: 'Стиль E', tag: 'Чертёж',
    desc: 'Светлый blueprint-стиль, технический чертёж, анимированная прорисовка.',
    accent: '#1A4A8A', tagColor: '#1A4A8A', tagBg: 'rgba(26,74,138,0.08)',
    border: 'rgba(26,74,138,0.15)', borderHov: 'rgba(26,74,138,0.45)',
    preview: () => (
      <svg viewBox="0 0 360 200" className="w-full h-full" style={{ background: '#EDF2F8' }}>
        <rect width="360" height="200" fill="#EDF2F8" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" stroke="rgba(26,74,138,0.12)" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="360" y2={i * 40} stroke="rgba(26,74,138,0.12)" strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`vs${i}`} x1={i * 40 + 20} y1="0" x2={i * 40 + 20} y2="200" stroke="rgba(26,74,138,0.05)" strokeWidth="0.5" />
        ))}
        {/* Title bar */}
        <rect x="0" y="0" width="360" height="16" fill="#DDE6F2" />
        <rect x="0" y="0" width="360" height="3" fill="#1A4A8A" />
        <text x="12" y="12" fontSize="6.5" fill="#1A4A8A" fontFamily="monospace" fontWeight="600">BES SAIMAN GROUP — ЧЕРТёЖ № BSG-2024-01</text>
        {/* Gear drawing — animated */}
        <g>
          <circle cx="220" cy="115" r="60" fill="none" stroke="#1A4A8A" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="6 4" />
          <circle cx="220" cy="115" r="72" fill="none" stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.15">
            <animateTransform attributeName="transform" type="rotate" from="0 220 115" to="360 220 115" dur="20s" repeatCount="indefinite" />
          </circle>
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i * 15) * Math.PI / 180
            return <line key={i} x1={220 + 66 * Math.cos(a)} y1={115 + 66 * Math.sin(a)} x2={220 + 72 * Math.cos(a)} y2={115 + 72 * Math.sin(a)} stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.3" />
          })}
          <circle cx="220" cy="115" r="44" fill="#DDE6F2" stroke="#1A4A8A" strokeWidth="1.2" strokeOpacity="0.3" />
          <circle cx="220" cy="115" r="14" fill="none" stroke="#1A5AAA" strokeWidth="1.2" strokeOpacity="0.4" />
          {[0,60,120,180,240,300].map((deg, i) => {
            const a = deg * Math.PI / 180
            return <line key={i} x1={220 + 14 * Math.cos(a)} y1={115 + 14 * Math.sin(a)} x2={220 + 40 * Math.cos(a)} y2={115 + 40 * Math.sin(a)} stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.25" />
          })}
          <line x1="220" y1="50" x2="220" y2="180" stroke="#1A4A8A" strokeWidth="0.6" strokeOpacity="0.2" />
          <line x1="145" y1="115" x2="295" y2="115" stroke="#1A4A8A" strokeWidth="0.6" strokeOpacity="0.2" />
          {/* Bolt holes */}
          {[30,90,150,210,270,330].map((deg,i) => {
            const a = deg * Math.PI / 180
            return <circle key={i} cx={220 + 52 * Math.cos(a)} cy={115 + 52 * Math.sin(a)} r="4" fill="none" stroke="#1A5AAA" strokeWidth="0.8" strokeOpacity="0.4" />
          })}
          {/* Dimension */}
          <line x1="145" y1="178" x2="295" y2="178" stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.4" markerEnd="url(#arrowPrev)" />
          <text x="220" y="188" textAnchor="middle" fontSize="6" fill="#1A4A8A" fillOpacity="0.6" fontFamily="monospace">Ø 144 мм</text>
        </g>
        {/* Left text */}
        <text x="20" y="42" fontSize="22" fontWeight="900" fill="#0A1E3A" fontFamily="Inter,sans-serif" letterSpacing="-0.8">BES</text>
        <text x="20" y="64" fontSize="22" fontWeight="900" fill="#1A4A8A" fontFamily="Inter,sans-serif" letterSpacing="-0.8">SAIMAN</text>
        <rect x="20" y="69" width="90" height="1" fill="#1A4A8A" fillOpacity="0.3" />
        <text x="20" y="80" fontSize="6.5" fill="#3A6AAA" fontFamily="monospace">ЛАБОРАТОРИЯ · НАУКА</text>
        {/* Annotation box */}
        <rect x="20" y="145" width="115" height="42" rx="1" fill="#DDE6F2" stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.35" />
        <text x="28" y="158" fontSize="6" fill="#1A4A8A" fontFamily="monospace" fontWeight="600">МАТЕРИАЛ: СТАЛЬ 40Х</text>
        <text x="28" y="169" fontSize="6" fill="#3A6AAA" fontFamily="monospace">ШЕРОХОВАТОСТЬ: Ra 1.6</text>
        <text x="28" y="180" fontSize="6" fill="#3A6AAA" fontFamily="monospace">ТВЁРДОСТЬ: HRC 45-50</text>
      </svg>
    ),
  },
  {
    id: 'g', href: '/style-g',
    label: 'Стиль G', tag: 'Промышленный',
    desc: 'Тёмный фон, оранжевый акцент, вращающаяся вакуумная камера, blueprint по бокам.',
    accent: '#FF5500', tagColor: '#FF7733', tagBg: 'rgba(255,85,0,0.1)',
    border: 'rgba(255,85,0,0.18)', borderHov: 'rgba(255,85,0,0.55)',
    preview: () => (
      <svg viewBox="0 0 360 200" className="w-full h-full" style={{ background: '#060A14' }}>
        <defs>
          <radialGradient id="pgG" cx="70%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF5500" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#060A14" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="steelGp" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#8AAABB" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#4A6A7A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0A1018" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="flangeGp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#90A8B8" />
            <stop offset="100%" stopColor="#2A3A4A" />
          </linearGradient>
        </defs>
        <rect width="360" height="200" fill="#060A14" />
        <rect width="360" height="200" fill="url(#pgG)" />
        {/* Blueprint grid faded left */}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="200" stroke="rgba(74,144,217,0.06)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 20} x2="100" y2={i * 20} stroke="rgba(74,144,217,0.06)" strokeWidth="0.5" />
        ))}
        {/* Left text */}
        <text x="16" y="60" fontSize="6" fill="rgba(255,85,0,0.55)" fontFamily="monospace" letterSpacing="3">НПП</text>
        <text x="16" y="84" fontSize="18" fontWeight="900" fill="#E8EEF6" fontFamily="Inter,sans-serif" letterSpacing="-0.5">ОТ ИДЕИ</text>
        <text x="16" y="106" fontSize="18" fontWeight="900" fill="#FF5500" fontFamily="Inter,sans-serif" letterSpacing="-0.5">ДО ПУСКА</text>
        <text x="16" y="122" fontSize="6.5" fill="rgba(180,200,220,0.5)" fontFamily="Inter,sans-serif">Лабораторное оборудование</text>
        {/* Buttons */}
        <rect x="16" y="135" width="75" height="18" rx="3" fill="#FF5500" />
        <text x="53" y="148" textAnchor="middle" fontSize="6.5" fill="white" fontFamily="Inter,sans-serif" fontWeight="700">ЗАКАЗАТЬ</text>
        <rect x="100" y="135" width="60" height="18" rx="3" fill="none" stroke="rgba(200,215,230,0.25)" strokeWidth="1" />
        <text x="130" y="148" textAnchor="middle" fontSize="6.5" fill="rgba(200,215,230,0.6)" fontFamily="Inter,sans-serif">ОБЪЕКТЫ</text>
        {/* Rotating chamber */}
        <g style={{ transformOrigin: '258px 98px', animation: 'gear-spin 18s linear infinite' }}>
          <circle cx="258" cy="98" r="76" fill="none" stroke="rgba(100,160,200,0.1)" strokeWidth="1" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i * 22.5) * Math.PI / 180
            const cx2 = 258 + 68 * Math.cos(a)
            const cy2 = 98 + 68 * Math.sin(a)
            return (
              <g key={i}>
                <circle cx={cx2} cy={cy2} r="5" fill="#3A5060" stroke="rgba(80,110,130,0.7)" strokeWidth="1" />
                <circle cx={cx2} cy={cy2} r="2" fill="none" stroke="rgba(60,90,110,0.9)" strokeWidth="0.7" />
              </g>
            )
          })}
          {Array.from({ length: 36 }).map((_, i) => {
            const a = (i * 10) * Math.PI / 180
            const isMaj = i % 9 === 0
            return (
              <line key={i}
                x1={258 + (isMaj ? 74 : 76) * Math.cos(a)} y1={98 + (isMaj ? 74 : 76) * Math.sin(a)}
                x2={258 + 78 * Math.cos(a)} y2={98 + 78 * Math.sin(a)}
                stroke={isMaj ? 'rgba(255,85,0,0.5)' : 'rgba(100,160,200,0.12)'}
                strokeWidth={isMaj ? 1.5 : 0.6}
              />
            )
          })}
        </g>
        {/* Counter inner */}
        <g style={{ transformOrigin: '258px 98px', animation: 'gear-spin-rev 10s linear infinite' }}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i * 22.5) * Math.PI / 180
            return (
              <line key={i}
                x1={258 + 44 * Math.cos(a)} y1={98 + 44 * Math.sin(a)}
                x2={258 + 52 * Math.cos(a)} y2={98 + 52 * Math.sin(a)}
                stroke="rgba(120,170,200,0.25)" strokeWidth="1.5"
              />
            )
          })}
        </g>
        {/* Chamber body */}
        <circle cx="258" cy="98" r="60" fill="url(#steelGp)" stroke="#3A5060" strokeWidth="2" />
        <circle cx="258" cy="98" r="60" fill="none" stroke="url(#flangeGp)" strokeWidth="8" strokeOpacity="0.6" />
        <circle cx="258" cy="98" r="38" fill="rgba(8,14,22,0.92)" stroke="#3A6080" strokeWidth="1.5" />
        <circle cx="258" cy="98" r="24" fill="rgba(15,35,55,0.8)" stroke="rgba(80,140,180,0.4)" strokeWidth="1" />
        <ellipse cx="248" cy="88" rx="14" ry="10" fill="rgba(120,180,220,0.07)" />
        {/* Nozzle top */}
        <rect x="248" y="29" width="20" height="12" rx="2" fill="url(#flangeGp)" stroke="#2A3A4A" strokeWidth="1" />
        <rect x="252" y="22" width="12" height="9" rx="1" fill="#3A5060" />
        {/* Nozzle left */}
        <rect x="185" y="89" width="12" height="18" rx="2" fill="url(#flangeGp)" stroke="#2A3A4A" strokeWidth="1" />
        <circle cx="197" cy="98" r="2.5" fill="rgba(255,85,0,0.5)" />
        {/* Orange glow center */}
        <circle cx="258" cy="98" r="12" fill="rgba(255,85,0,0.04)" />
        <text x="258" y="95" textAnchor="middle" fontSize="6" fontWeight="700" fill="rgba(150,190,210,0.6)" fontFamily="monospace">BSG</text>
        <text x="258" y="105" textAnchor="middle" fontSize="5" fill="rgba(255,85,0,0.5)" fontFamily="monospace">VAC</text>
        {/* Sheen */}
        <ellipse cx="236" cy="72" rx="18" ry="12" fill="rgba(200,220,240,0.06)" />
        <text x="180" y="190" textAnchor="middle" fontSize="7" fill="rgba(255,85,0,0.35)" fontFamily="monospace" letterSpacing="3">BES SAIMAN GROUP</text>
      </svg>
    ),
  },
  {
    id: 'h', href: '/style-h',
    label: 'Стиль H', tag: 'Blueprint 3D',
    desc: 'Светлый чертёж, вращающаяся вакуумная камера в blueprint-стиле, оранжевые акценты.',
    accent: '#1A4A8A', tagColor: '#1565C0', tagBg: 'rgba(26,74,138,0.1)',
    border: 'rgba(26,74,138,0.18)', borderHov: 'rgba(26,74,138,0.55)',
    preview: () => (
      <svg viewBox="0 0 360 200" className="w-full h-full" style={{ background: '#EDF2F8' }}>
        <defs>
          <linearGradient id="bpBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8D8EC" />
            <stop offset="50%" stopColor="#8AAACF" />
            <stop offset="100%" stopColor="#4A6A8A" />
          </linearGradient>
        </defs>
        <rect width="360" height="200" fill="#EDF2F8" />
        {/* Grid */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" stroke="rgba(26,74,138,0.1)" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="360" y2={i * 40} stroke="rgba(26,74,138,0.1)" strokeWidth="1" />
        ))}
        {/* Title bar */}
        <rect x="0" y="0" width="360" height="14" fill="#DDE6F2" />
        <rect x="0" y="0" width="360" height="3" fill="#1A4A8A" />
        <text x="12" y="11" fontSize="6" fill="#1A4A8A" fontFamily="monospace" fontWeight="600">BES SAIMAN GROUP — ВАКУУМНАЯ КАМЕРА VK-01</text>
        {/* Left text */}
        <text x="16" y="52" fontSize="6.5" fill="rgba(255,85,0,0.7)" fontFamily="monospace" letterSpacing="3">НПП</text>
        <text x="16" y="74" fontSize="20" fontWeight="900" fill="#0A1E3A" fontFamily="Inter,sans-serif" letterSpacing="-0.8">ОТ ИДЕИ</text>
        <text x="16" y="96" fontSize="20" fontWeight="900" fill="#FF5500" fontFamily="Inter,sans-serif" letterSpacing="-0.8">ДО ПУСКА</text>
        <text x="16" y="112" fontSize="6.5" fill="rgba(26,74,138,0.6)" fontFamily="Inter,sans-serif">Проектирование и производство</text>
        {/* Buttons */}
        <rect x="16" y="124" width="78" height="18" rx="3" fill="#FF5500" />
        <text x="55" y="137" textAnchor="middle" fontSize="6.5" fill="white" fontFamily="Inter,sans-serif" fontWeight="700">ЗАКАЗАТЬ</text>
        <rect x="102" y="124" width="62" height="18" rx="3" fill="none" stroke="#1A4A8A" strokeWidth="1" strokeOpacity="0.4" />
        <text x="133" y="137" textAnchor="middle" fontSize="6.5" fill="#1A4A8A" fontFamily="Inter,sans-serif">ОБЪЕКТЫ</text>
        {/* Blueprint chamber - rotating */}
        <g style={{ transformOrigin: '262px 98px', animation: 'gear-spin 20s linear infinite' }}>
          {/* Outer tick ring */}
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i * 15) * Math.PI / 180
            const isMaj = i % 6 === 0
            return <line key={i}
              x1={262 + (isMaj ? 68 : 72) * Math.cos(a)} y1={98 + (isMaj ? 68 : 72) * Math.sin(a)}
              x2={262 + 76 * Math.cos(a)} y2={98 + 76 * Math.sin(a)}
              stroke="#1A4A8A" strokeWidth={isMaj ? 1.2 : 0.5} strokeOpacity={isMaj ? 0.5 : 0.2} />
          })}
          <circle cx="262" cy="98" r="76" fill="none" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="4 3" />
        </g>
        {/* Chamber body (static center so text stays readable) */}
        {/* Main cylinder */}
        <rect x="234" y="38" width="56" height="120" rx="28" fill="url(#bpBody)" stroke="#1A4A8A" strokeWidth="1.2" strokeOpacity="0.7" />
        {/* Top flange */}
        <rect x="224" y="34" width="76" height="11" rx="3" fill="#A8C0D8" stroke="#1A4A8A" strokeWidth="1" strokeOpacity="0.6" />
        {/* Bottom flange */}
        <rect x="224" y="151" width="76" height="11" rx="3" fill="#A8C0D8" stroke="#1A4A8A" strokeWidth="1" strokeOpacity="0.6" />
        {/* Top tube */}
        <rect x="254" y="22" width="16" height="14" rx="3" fill="#8AAACF" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.5" />
        {/* Bottom tube */}
        <rect x="254" y="162" width="16" height="14" rx="3" fill="#8AAACF" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.5" />
        {/* Left port */}
        <rect x="204" y="91" width="30" height="14" rx="3" fill="#8AAACF" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="205" cy="98" r="3" fill="rgba(255,85,0,0.5)" stroke="#1A4A8A" strokeWidth="0.5" />
        {/* Right port / gauge */}
        <rect x="290" y="91" width="28" height="14" rx="3" fill="#8AAACF" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.5" />
        {/* Viewport circle */}
        <circle cx="262" cy="98" r="20" fill="#DDE6F2" stroke="#1A4A8A" strokeWidth="1.5" strokeOpacity="0.6" />
        <circle cx="262" cy="98" r="14" fill="rgba(26,74,138,0.08)" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.3" />
        {/* Seam rings */}
        <line x1="234" y1="78" x2="290" y2="78" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.35" />
        <line x1="234" y1="118" x2="290" y2="118" stroke="#1A4A8A" strokeWidth="0.8" strokeOpacity="0.35" />
        {/* Bottom stats bar */}
        <rect x="0" y="185" width="360" height="15" fill="#DDE6F2" />
        <text x="16" y="195" fontSize="6" fill="#1A4A8A" fontFamily="monospace">12+ лет</text>
        <text x="95" y="195" fontSize="6" fill="#1A4A8A" fontFamily="monospace">200+ позиций</text>
        <text x="210" y="195" fontSize="6" fill="#1A4A8A" fontFamily="monospace">50+ проектов</text>
        <text x="310" y="195" fontSize="6" fill="rgba(255,85,0,0.7)" fontFamily="monospace">BSG-KZ</text>
      </svg>
    ),
  },
  {
    id: 'f', href: '/style-f',
    label: 'Стиль F', tag: 'Blueprint+Dial',
    desc: 'Светлый чертёж + вращающийся прецизионный циферблат. Живой и профессиональный.',
    accent: '#1A4A8A', tagColor: '#1A4A8A', tagBg: 'rgba(26,74,138,0.08)',
    border: 'rgba(26,74,138,0.15)', borderHov: 'rgba(26,74,138,0.5)',
    preview: () => (
      <svg viewBox="0 0 360 200" className="w-full h-full" style={{ background: '#EDF2F8' }}>
        <rect width="360" height="200" fill="#EDF2F8" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" stroke="rgba(26,74,138,0.1)" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="360" y2={i * 40} stroke="rgba(26,74,138,0.1)" strokeWidth="1" />
        ))}
        <rect x="0" y="0" width="360" height="14" fill="#DDE6F2" />
        <rect x="0" y="0" width="360" height="3" fill="#1A4A8A" />
        <text x="10" y="11" fontSize="6" fill="#1A4A8A" fontFamily="monospace" fontWeight="600">BES SAIMAN — ПРЕЦИЗИОННОЕ ОБОРУДОВАНИЕ · BSG-2024-F1</text>
        {/* Left text */}
        <text x="18" y="50" fontSize="20" fontWeight="900" fill="#0A1E3A" fontFamily="Inter,sans-serif" letterSpacing="-0.8">BES</text>
        <text x="18" y="72" fontSize="20" fontWeight="900" fill="#1A4A8A" fontFamily="Inter,sans-serif" letterSpacing="-0.8">SAIMAN</text>
        <rect x="18" y="77" width="80" height="1" fill="#1A4A8A" fillOpacity="0.3" />
        <text x="18" y="88" fontSize="6" fill="#3A6AAA" fontFamily="monospace">ЛАБОРАТОРИЯ · НАУКА</text>
        <rect x="18" y="100" width="135" height="68" fill="#E8EFF8" stroke="#1A4A8A" strokeWidth="0.7" strokeOpacity="0.3" />
        <rect x="18" y="100" width="135" height="13" fill="#DDE6F2" />
        <text x="25" y="110" fontSize="6" fill="#1A4A8A" fontFamily="monospace" fontWeight="600">ТЕХ. ХАРАКТЕРИСТИКИ</text>
        {[['HT','≤ 1800°C',113],['BM','650 rpm',126],['VB','< 0.1 ppm',139],['ES','≤ 50 kV',152]].map(([c,v,y])=>(
          <g key={String(y)}>
            <rect x="25" y={Number(y)-8} width="14" height="10" fill="#1A4A8A" />
            <text x="32" y={Number(y)} textAnchor="middle" fontSize="5.5" fill="white" fontFamily="monospace" fontWeight="700">{c}</text>
            <text x="115" y={Number(y)} textAnchor="end" fontSize="6" fill="#1A4A8A" fontFamily="monospace" fontWeight="700">{v}</text>
          </g>
        ))}
        {/* Rotating dial */}
        <g style={{ transformOrigin: '270px 110px', animation: 'gear-spin 15s linear infinite' }}>
          <circle cx="270" cy="110" r="72" fill="none" stroke="#1A4A8A" strokeWidth="2" strokeOpacity="0.25" />
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i * 7.5) * Math.PI / 180
            const isMaj = i % 4 === 0
            return <line key={i}
              x1={270 + (isMaj ? 60 : 65) * Math.cos(a)} y1={110 + (isMaj ? 60 : 65) * Math.sin(a)}
              x2={270 + 71 * Math.cos(a)} y2={110 + 71 * Math.sin(a)}
              stroke="#1A4A8A" strokeWidth={isMaj ? 1.5 : 0.6} strokeOpacity={isMaj ? 0.5 : 0.2} />
          })}
          {Array.from({ length: 32 }).map((_, i) => {
            const step = (2 * Math.PI) / 32
            const a0 = i * step, a1 = a0 + step * 0.3, a2 = a0 + step * 0.7, a3 = a0 + step
            const rO = 50, rI = 42
            return <polygon key={i}
              points={`${270+rI*Math.cos(a0)},${110+rI*Math.sin(a0)} ${270+rO*Math.cos(a1)},${110+rO*Math.sin(a1)} ${270+rO*Math.cos(a2)},${110+rO*Math.sin(a2)} ${270+rI*Math.cos(a3)},${110+rI*Math.sin(a3)}`}
              fill="#DDE6F2" stroke="#1A4A8A" strokeWidth="0.6" strokeOpacity="0.3" />
          })}
        </g>
        {/* Counter ring */}
        <g style={{ transformOrigin: '270px 110px', animation: 'gear-spin-rev 10s linear infinite' }}>
          <circle cx="270" cy="110" r="30" fill="none" stroke="#1A4A8A" strokeWidth="1" strokeOpacity="0.2" />
          {[0,45,90,135,180,225,270,315].map((d,i)=>(
            <line key={i} x1={270+12*Math.cos(d*Math.PI/180)} y1={110+12*Math.sin(d*Math.PI/180)}
              x2={270+26*Math.cos(d*Math.PI/180)} y2={110+26*Math.sin(d*Math.PI/180)}
              stroke="#1A4A8A" strokeWidth="1.5" strokeOpacity="0.2" />
          ))}
        </g>
        <circle cx="270" cy="110" r="22" fill="#E8EFF8" stroke="#1A4A8A" strokeWidth="1.2" strokeOpacity="0.3" />
        <text x="270" y="107" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#0A1E3A" fontFamily="Inter,sans-serif">BES</text>
        <text x="270" y="117" textAnchor="middle" fontSize="6" fontWeight="900" fill="#1A4A8A" fontFamily="Inter,sans-serif">SAIMAN</text>
        <circle cx="270" cy="110" r="4" fill="#1A4A8A" fillOpacity="0.6" />
        <circle cx="270" cy="110" r="1.8" fill="#EDF2F8" />
      </svg>
    ),
  },
]

export default function StyleChooser() {
  const [hov, setHov] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: '#030810' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(14,165,233,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.025) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
      }} />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-3">
          <svg width="24" height="28" viewBox="0 0 28 32">
            <polygon points="14,1 27,8 27,24 14,31 1,24 1,8" fill="none" stroke="rgba(14,165,233,0.5)" strokeWidth="1.5" />
            <text x="14" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#38BDF8" fontFamily="Inter,sans-serif">B</text>
          </svg>
          <div>
            <div className="font-black text-[12px] tracking-[0.1em]" style={{ color: '#64748B' }}>BES SAIMAN GROUP</div>
            <div className="text-[8px] tracking-[0.3em] font-light" style={{ color: '#1E3A5A' }}>ВЫБЕРИТЕ СТИЛЬ САЙТА</div>
          </div>
        </div>
        <p className="text-[11px] text-center" style={{ color: '#2A4060' }}>Кликните чтобы открыть полный дизайн</p>
      </div>

      {/* Grid 2×2 */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-5xl">
        {styles.map((s) => {
          const PreviewComponent = s.preview
          return (
            <Link
              key={s.id}
              href={s.href}
              onMouseEnter={() => setHov(s.id)}
              onMouseLeave={() => setHov(null)}
              className="group block rounded-xl overflow-hidden transition-all duration-300"
              style={{
                border: `1px solid ${hov === s.id ? s.borderHov : s.border}`,
                transform: hov === s.id ? 'translateY(-5px)' : 'none',
                boxShadow: hov === s.id ? `0 20px 50px ${s.accent}12` : '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {/* Animated preview */}
              <div style={{ background: '#030608', aspectRatio: '18/10', overflow: 'hidden' }}>
                <PreviewComponent />
              </div>
              {/* Info */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#060D18', borderTop: '1px solid rgba(14,40,80,0.4)' }}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: '#94A3B8' }}>{s.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: s.tagBg, color: s.tagColor }}>{s.tag}</span>
                </div>
                <span className="text-[11px] font-semibold transition-all duration-200" style={{ color: hov === s.id ? s.accent : '#1E3A50' }}>
                  {hov === s.id ? 'Открыть →' : '→'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <p className="relative z-10 mt-6 text-[10px] font-mono text-center" style={{ color: '#12243A' }}>
        После выбора — все страницы каталога, склада и контактов оформим в выбранном стиле
      </p>
    </div>
  )
}
