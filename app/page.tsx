"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Github } from "lucide-react";

const APP_SLIDES = [
  { src: "/hand1.jpg", label: "Gesture Recognition" },
  { src: "/hand2.jpg", label: "Real-time Processing" },
  { src: "/hand3.jpg", label: "Smart Translation" },
  { src: "/hand4.jpg", label: "High Accuracy" },
  { src: "/hand5.jpg", label: "Multi-Language Support" },
  { src: "/hand6.jpg", label: "Privacy First" },
];

export default function AppLandingPage() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (animating || idx === current) return;
    setPrev(current);
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 900);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % APP_SLIDES.length;
        setPrev(c);
        setAnimating(true);
        setTimeout(() => { setPrev(null); setAnimating(false); }, 900);
        return next;
      });
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        :root {
          --green:   #10b981;
          --green-l: #34d399;
          --green-d: #059669;
          --blue:    #2563eb;
          --blue-l:  #60a5fa;
          --blue-d:  #1d4ed8;
          --white:   #ffffff;
          --bg:      #f0faf6;
          --bg2:     #e8f4fd;
          --card:    #ffffff;
          --text-1:  #0f1f2e;
          --text-2:  #4b6880;
          --text-3:  #94a3b8;
          --shadow-green: 0 20px 50px -12px rgba(16,185,129,0.28);
          --shadow-blue:  0 20px 50px -12px rgba(37,99,235,0.20);
          --shadow-card:  0 4px 24px rgba(15,31,46,0.07);
          --r-lg: 28px;
          --r-xl: 36px;
          --r-pill: 100px;
        }

        html, body {
          background: var(--bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-1);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── BACKGROUND ── */
        .lp-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 90% 45% at 50% -5%, rgba(16,185,129,0.13) 0%, transparent 65%),
            radial-gradient(ellipse 70% 35% at 85% 50%, rgba(37,99,235,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 10% 80%, rgba(52,211,153,0.07) 0%, transparent 60%),
            linear-gradient(170deg, #edfdf7 0%, #f0f8ff 50%, #f0faf6 100%);
        }

        .lp-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 80%);
          opacity: 0.5;
        }

        .blob {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          animation: blobDrift ease-in-out infinite alternate;
          filter: blur(55px);
        }
        .blob-1 { width:320px; height:320px; background:rgba(16,185,129,0.12); top:-60px; left:-60px; animation-duration:18s; }
        .blob-2 { width:260px; height:260px; background:rgba(37,99,235,0.09); bottom:-40px; right:-40px; animation-duration:14s; animation-delay:-6s; }
        .blob-3 { width:200px; height:200px; background:rgba(96,165,250,0.10); top:45%; left:60%; animation-duration:22s; animation-delay:-10s; }

        @keyframes blobDrift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(22px, 30px) scale(1.08); }
        }

        .lp-wrap {
          position: relative; z-index: 2;
          max-width: 430px; margin: 0 auto;
          min-height: 100svh;
          display: flex; flex-direction: column; align-items: stretch;
          padding: 0 20px 52px;
        }

        .lp-topbar {
          display: flex; justify-content: center; padding: 20px 0 0;
          animation: revealUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .lp-version-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px 5px 8px;
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: var(--r-pill);
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: var(--green-d);
          box-shadow: 0 2px 12px rgba(16,185,129,0.12);
          backdrop-filter: blur(8px);
        }
        .lp-version-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
          50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0.08); }
        }

        .lp-identity {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 32px 0 28px;
          animation: revealUp 0.7s 0.05s cubic-bezier(0.16,1,0.3,1) both;
        }

        .lp-logo-ring {
          position: relative; width: 200px; height: 200px; margin-bottom: 18px;
        }
        .lp-logo-ring::before {
          content: '';
          position: absolute; inset: -5px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, var(--green), var(--blue-l), var(--green-l), var(--blue), var(--green));
          animation: ringSpinFast 3s linear infinite;
          mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), white calc(100% - 2.5px));
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), white calc(100% - 2.5px));
        }
        @keyframes ringSpinFast { to { transform: rotate(360deg); } }

        .lp-logo-box {
          width: 88px; height: 88px; border-radius: 26px;
          background: linear-gradient(135deg, var(--green) 0%, var(--blue) 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: var(--shadow-green), 0 0 0 4px rgba(255,255,255,0.9);
          position: relative; overflow: hidden;
        }
        .lp-logo-box::after {
          content: '';
          position: absolute; top: -30%; left: -20%; width: 60%; height: 60%;
          background: rgba(255,255,255,0.22);
          border-radius: 50%;
          filter: blur(12px);
        }
        .lp-logo-box img {
          width: 72%; height: 72%; object-fit: contain;
          position: relative; z-index: 1;
        }

        .lp-name {
          font-family: 'Syne', sans-serif;
          font-size: 2.3rem; font-weight: 800;
          letter-spacing: -0.04em; line-height: 1;
          color: var(--text-1); margin-bottom: 6px;
        }
        .lp-name em {
          font-style: normal;
          background: linear-gradient(90deg, var(--green-d), var(--blue));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .lp-slogan {
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--text-3);
        }

        /* ── SLIDESHOW ── */
        .lp-slider {
          animation: revealUp 0.7s 0.12s cubic-bezier(0.16,1,0.3,1) both;
          margin-bottom: 24px;
        }

        .lp-slide-window {
          position: relative; width: 100%; aspect-ratio: 1/1;
          border-radius: var(--r-xl); overflow: hidden;
          background: var(--card);
          box-shadow: var(--shadow-card), 0 0 0 1px rgba(16,185,129,0.12);
        }

        .lp-slide-window::after {
          content: ''; position: absolute; inset: 0; z-index: 6; pointer-events: none;
          border-radius: inherit;
          border: 1.5px solid rgba(255,255,255,0.7);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.04);
        }

        .lp-slide-glare {
          position: absolute; top: 0; left: 0; right: 0; height: 45%; z-index: 5; pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%);
          border-radius: inherit;
        }

        .lp-slide-img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1);
        }
        .lp-slide-img.active  { opacity: 1; transform: scale(1);    z-index: 2; }
        .lp-slide-img.prev    { opacity: 0; transform: scale(1.06); z-index: 1; }
        .lp-slide-img.hidden  { opacity: 0; z-index: 0; }

        .lp-caption {
          position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
          z-index: 7; white-space: nowrap;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: var(--r-pill);
          padding: 7px 18px;
          font-size: 0.76rem; font-weight: 700; letter-spacing: 0.04em;
          color: var(--blue-d);
          box-shadow: 0 4px 16px rgba(37,99,235,0.1);
        }

        .lp-progress-bar {
          height: 3px; width: 100%; background: rgba(16,185,129,0.12);
          border-radius: 3px; margin-top: 12px; overflow: hidden;
        }
        .lp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--green), var(--blue-l));
          border-radius: 3px;
          animation: progressAnim 4s linear infinite;
        }
        @keyframes progressAnim {
          from { width: 0%; }
          to   { width: 100%; }
        }

        .lp-dots {
          display: flex; justify-content: center; align-items: center; gap: 7px;
          margin-top: 12px;
        }
        .lp-dot {
          height: 6px; border-radius: var(--r-pill);
          background: rgba(16,185,129,0.2);
          cursor: pointer; border: none;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .lp-dot { width: 6px; }
        .lp-dot.on {
          width: 26px;
          background: linear-gradient(90deg, var(--green), var(--blue-l));
          box-shadow: 0 0 10px rgba(16,185,129,0.35);
        }

        /* ── CTA BUTTON ── */
        .lp-cta {
          animation: revealUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both;
          margin-bottom: 20px;
        }

        .btn-main {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 20px;
          border-radius: var(--r-lg); border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem; font-weight: 800; letter-spacing: 0.01em;
          color: #fff; text-decoration: none;
          background: linear-gradient(135deg, var(--green-d) 0%, var(--green) 40%, var(--blue) 100%);
          box-shadow: var(--shadow-green);
          position: relative; overflow: hidden;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .btn-main::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        .btn-main::after {
          content: '';
          position: absolute; top: 0; left: -80%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
          transform: skewX(-15deg);
          animation: btnSheen 3s ease-in-out infinite;
        }
        @keyframes btnSheen {
          0%,100% { left: -80%; }
          50%      { left: 140%; }
        }
        .btn-main:active { transform: scale(0.97); box-shadow: var(--shadow-blue); }

        .btn-icon {
          width: 32px; height: 32px; border-radius: 10px;
          background: rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }

        /* ── ANIMATIONS ── */
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Floating sparkle dots */
        .lp-sparkles { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
        .spk {
          position: absolute; border-radius: 50%; opacity: 0;
          animation: spkFloat linear infinite;
        }
        @keyframes spkFloat {
          0%    { opacity: 0; transform: translateY(0) scale(0.5); }
          20%   { opacity: 1; }
          80%   { opacity: 0.6; }
          100%  { opacity: 0; transform: translateY(-100px) scale(1.5); }
        }

        /* ═══════════════════════════════════════
           ✨ NEW PREMIUM FOOTER STYLES
        ═══════════════════════════════════════ */

        .lp-footer {
          animation: revealUp 0.7s 0.35s cubic-bezier(0.16,1,0.3,1) both;
          margin-top: 8px;
          position: relative;
        }

        /* ── Glow divider ── */
        .footer-divider {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
        }
        .footer-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(37,99,235,0.3), transparent);
        }
        .footer-divider-gem {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(37,99,235,0.12));
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 8px;
          transform: rotate(45deg);
          margin: 0 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.6);
          flex-shrink: 0;
          position: relative;
        }
        .footer-divider-gem::after {
          content: '';
          position: absolute; inset: 4px;
          background: linear-gradient(135deg, var(--green-l), var(--blue-l));
          border-radius: 3px;
          opacity: 0.6;
        }

        /* ── Brand strip inside footer ── */
        .footer-brand {
          text-align: center;
          margin-bottom: 24px;
        }
        .footer-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: linear-gradient(90deg, var(--green-d) 0%, var(--green) 40%, var(--blue-l) 80%, var(--blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: gradientShift 4s linear infinite;
        }
        @keyframes gradientShift {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .footer-brand-tagline {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-top: 4px;
        }

        /* ── Contact cards grid ── */
        .footer-contacts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }

        .footer-contact-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow:
            0 4px 24px rgba(15,31,46,0.05),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(16,185,129,0.06);
          text-decoration: none;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          cursor: pointer;
        }
        .footer-contact-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 20px 20px 0 0;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .footer-contact-card.email::before {
          background: linear-gradient(90deg, var(--blue), var(--blue-l));
        }
        .footer-contact-card.phone::before {
          background: linear-gradient(90deg, var(--green-d), var(--green-l));
        }
        .footer-contact-card:active {
          transform: scale(0.97);
          box-shadow: 0 2px 12px rgba(15,31,46,0.08);
        }

        .footer-card-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .footer-card-icon-wrap.email-icon {
          background: linear-gradient(135deg, #dbeafe, #eff6ff);
          box-shadow: 0 4px 12px rgba(37,99,235,0.15);
        }
        .footer-card-icon-wrap.phone-icon {
          background: linear-gradient(135deg, #d1fae5, #ecfdf5);
          box-shadow: 0 4px 12px rgba(16,185,129,0.15);
        }
        .footer-card-icon-wrap::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.5), transparent);
          border-radius: inherit;
        }

        .footer-card-label {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-2);
          text-align: center;
        }
        .footer-card-value {
          font-size: 0.67rem;
          font-weight: 500;
          color: var(--text-3);
          text-align: center;
          margin-top: -4px;
        }

        /* ── Location full-width pill ── */
        .footer-location {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.75);
          box-shadow:
            0 4px 20px rgba(15,31,46,0.04),
            inset 0 1px 0 rgba(255,255,255,0.9);
          margin-bottom: 10px;
          text-decoration: none;
        }
        .footer-location-icon {
          width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, #fef3c7, #fff7ed);
          box-shadow: 0 4px 12px rgba(245,158,11,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          position: relative;
        }
        .footer-location-icon::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.5), transparent);
          border-radius: inherit;
        }
        .footer-location-text { flex: 1; }
        .footer-location-text b {
          display: block;
          font-size: 0.78rem; font-weight: 700; color: var(--text-1);
        }
        .footer-location-text span {
          font-size: 0.66rem; font-weight: 500; color: var(--text-3);
        }
        .footer-location-arrow {
          width: 28px; height: 28px; border-radius: 9px;
          background: rgba(16,185,129,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem;
          color: var(--green-d);
          flex-shrink: 0;
        }

        /* ── Tech chips ── */
        .footer-tech-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .footer-tech-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(16,185,129,0.12);
          border-radius: 100px;
          font-size: 0.62rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-2);
          box-shadow: 0 2px 8px rgba(15,31,46,0.04);
        }
        .footer-tech-chip-dot {
          width: 5px; height: 5px; border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Copyright banner ── */
        .footer-copyright {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg,
            rgba(16,185,129,0.06) 0%,
            rgba(37,99,235,0.05) 50%,
            rgba(16,185,129,0.04) 100%
          );
          border: 1px solid rgba(16,185,129,0.10);
          border-radius: 18px;
          padding: 16px 20px;
          text-align: center;
        }
        .footer-copyright::before {
          content: '';
          position: absolute; top: 0; left: -100%; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,185,129,0.4), rgba(37,99,235,0.3), transparent);
          animation: scanLine 4s linear infinite;
        }
        @keyframes scanLine {
          from { left: -100%; }
          to   { left: 100%; }
        }
        .footer-copyright-year {
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem; font-weight: 800;
          color: var(--text-1);
          letter-spacing: 0.05em;
        }
        .footer-copyright-year span {
          background: linear-gradient(90deg, var(--green-d), var(--blue));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .footer-copyright-sub {
          font-size: 0.62rem; font-weight: 600;
          color: var(--text-3);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 3px;
        }
        .footer-copyright-hearts {
          font-size: 0.62rem;
          color: var(--text-3);
          margin-top: 6px;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .footer-copyright-hearts em {
          font-style: normal;
          background: linear-gradient(90deg, var(--green), var(--blue-l));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          font-weight: 700;
        }

        /* ── Social row ── */
        .footer-social-row {
          display: flex; justify-content: center; gap: 10px;
          margin-bottom: 16px;
        }
        .footer-social-btn {
          width: 40px; height: 40px;
          border-radius: 13px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(16,185,129,0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          text-decoration: none;
          box-shadow: 0 2px 10px rgba(15,31,46,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          position: relative; overflow: hidden;
        }
        .footer-social-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(37,99,235,0.08));
          opacity: 0;
          transition: opacity 0.2s;
          border-radius: inherit;
        }
        .footer-social-btn:active {
          transform: scale(0.93);
          box-shadow: 0 1px 6px rgba(15,31,46,0.08);
        }

        /* status badge */
        .footer-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px 6px 10px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 100px;
          font-size: 0.68rem; font-weight: 700;
          color: var(--green-d);
          box-shadow: 0 2px 12px rgba(16,185,129,0.1);
          backdrop-filter: blur(8px);
          margin: 0 auto 20px;
          width: fit-content;
          display: flex;
        }
        .footer-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--green);
          animation: dotPulse 2s ease-in-out infinite;
        }

      `}</style>

      {/* Backgrounds */}
      <div className="lp-bg" />
      <div className="lp-grid" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Sparkle dots */}
      <div className="lp-sparkles">
        {[
          { l:"8%",  t:"22%", s:5,  c:"rgba(16,185,129,0.55)", d:0    },
          { l:"88%", t:"18%", s:4,  c:"rgba(37,99,235,0.45)",  d:1.8  },
          { l:"15%", t:"72%", s:3,  c:"rgba(52,211,153,0.5)",  d:3.2  },
          { l:"75%", t:"65%", s:6,  c:"rgba(96,165,250,0.45)", d:0.9  },
          { l:"50%", t:"88%", s:4,  c:"rgba(16,185,129,0.4)",  d:2.4  },
          { l:"30%", t:"40%", s:3,  c:"rgba(37,99,235,0.35)",  d:4.0  },
          { l:"65%", t:"35%", s:5,  c:"rgba(52,211,153,0.4)",  d:1.3  },
        ].map((p,i) => (
          <div key={i} className="spk" style={{
            left: p.l, top: p.t, width: p.s, height: p.s,
            background: p.c, animationDelay: `${p.d}s`,
            animationDuration: `${6 + i * 0.6}s`,
          }} />
        ))}
      </div>

      <div className="lp-wrap">

        {/* Logo + name */}
        <section className="lp-identity">
          <div className="lp-logo-ring">
              <img src="/logo.png" alt="SignTranslate" />
          </div>
         <h1 className="lp-name" style={{ 
            fontSize: '1.6rem',
            fontWeight: '900',
            letterSpacing: '-0.04em',
            color: '#0f172a',
            margin: '0',
            lineHeight: '1.1',
            textTransform: 'uppercase'
          }}>
            SIGN<span style={{ 
              background: 'linear-gradient(90deg, #22c55e, #2563eb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>TRANSLATE</span>
          </h1>
        </section>

        {/* Slideshow */}
        <section className="lp-slider">
          <div className="lp-slide-window">
            <div className="lp-slide-glare" />
            {APP_SLIDES.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={s.src}
                alt={s.label}
                className={`lp-slide-img ${
                  i === current ? "active" : i === prev ? "prev" : "hidden"
                }`}
              />
            ))}
            <div className="lp-caption">{APP_SLIDES[current].label}</div>
          </div>
          <div className="lp-progress-bar"><div className="lp-progress-fill" /></div>
          <div className="lp-dots">
            {APP_SLIDES.map((_, i) => (
              <button key={i} className={`lp-dot${i === current ? " on" : ""}`}
                onClick={() => goTo(i)} aria-label={`Slide ${i+1}`} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="lp-cta">
          <Link href="/login" className="btn-main">
            <span className="btn-icon">🔑</span>
            เข้าสู่ระบบ / Get Started
          </Link>
        </div>

        {/* ═══════════ ✨ PREMIUM FOOTER ═══════════ */}
        <footer className="lp-footer">

          {/* Decorative divider */}
          <div className="footer-divider">
            <div className="footer-divider-line" />
            <div className="footer-divider-gem" />
            <div className="footer-divider-line" />
          </div>

          {/* Brand identity */}
          <div className="footer-brand">
            <div className="footer-brand-name">SignTranslate</div>
            <div className="footer-brand-tagline">Bridging Silence with Intelligence</div>
          </div>

          {/* Live status */}
          <div className="footer-status-badge">
            <div className="footer-status-dot" />
            All Systems Operational
          </div>

          {/* Contact cards */}
          <div className="footer-contacts">
            <a href="mailto:support@signtranslate.com" className="footer-contact-card email">
              <div className="footer-card-icon-wrap email-icon">
                <Mail size={20} color="#2563eb" strokeWidth={2} />
              </div>
              <div className="footer-card-label">อีเมล</div>
              <div className="footer-card-value">support@signtranslate.com</div>
            </a>
            <a href="tel:0801234567" className="footer-contact-card phone">
              <div className="footer-card-icon-wrap phone-icon">
                <Phone size={20} color="#059669" strokeWidth={2} />
              </div>
              <div className="footer-card-label">โทรศัพท์</div>
              <div className="footer-card-value">080-123-4567</div>
            </a>
          </div>

          {/* Location row */}
          <a href="#" className="footer-location">
            <div className="footer-location-icon">📍</div>
            <div className="footer-location-text">
              <b>วิทยาลัยอาชีวศึกษาขอนแก่น, ขอนแก่น</b>
              <span>Khon Kaen</span>
            </div>
            <div className="footer-location-arrow">›</div>
          </a>

          {/* Social buttons */}
          <div className="footer-social-row" style={{ marginTop: 14 }}>
            {[
              { icon: "🌐", label: "Website" },
              { icon: "📘", label: "Facebook" },
              { icon: "📸", label: "Instagram" },
              { icon: "🐙", label: "GitHub" },
            ].map((s) => (
              <a key={s.label} href="#" className="footer-social-btn" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>

          {/* Copyright banner */}
          <div className="footer-copyright">
            <div className="footer-copyright-year">
              © <span>2026</span> SIGNTRANSLATE
            </div>
            <div className="footer-copyright-sub">All Rights Reserved</div>
            <div className="footer-copyright-hearts">
              Made with <em>♥</em> for the Deaf Community
            </div>
          </div>

        </footer>
      </div>
    </>
  );
}