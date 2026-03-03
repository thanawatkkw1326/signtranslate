"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

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

        /* subtle dot grid */
        .lp-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 80%);
          opacity: 0.5;
        }

        /* ── FLOATING BLOBS ── */
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

        /* ── WRAPPER ── */
        .lp-wrap {
          position: relative; z-index: 2;
          max-width: 430px; margin: 0 auto;
          min-height: 100svh;
          display: flex; flex-direction: column; align-items: stretch;
          padding: 0 20px 52px;
        }

        /* ── TOP STATUS BAR PILL ── */
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

        /* ── IDENTITY ── */
        .lp-identity {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 32px 0 28px;
          animation: revealUp 0.7s 0.05s cubic-bezier(0.16,1,0.3,1) both;
        }

        .lp-logo-ring {
          position: relative; width: 88px; height: 88px; margin-bottom: 18px;
        }
        /* outer spinning ring */
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

        /* premium inner border overlay */
        .lp-slide-window::after {
          content: ''; position: absolute; inset: 0; z-index: 6; pointer-events: none;
          border-radius: inherit;
          border: 1.5px solid rgba(255,255,255,0.7);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.04);
        }

        /* top glare */
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

        /* Progress bar under slide */
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
        /* animated sheen */
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

        /* ── STATS STRIP ── */
        .lp-stats {
          display: flex; background: var(--card);
          border-radius: 20px; margin-bottom: 20px;
          box-shadow: var(--shadow-card);
          border: 1px solid rgba(16,185,129,0.10);
          overflow: hidden;
          animation: revealUp 0.7s 0.25s cubic-bezier(0.16,1,0.3,1) both;
        }
        .lp-stat {
          flex: 1; padding: 16px 8px;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          position: relative;
        }
        .lp-stat + .lp-stat::before {
          content: ''; position: absolute; left: 0; top: 16%; height: 68%;
          width: 1px; background: rgba(16,185,129,0.12);
        }
        .lp-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem; font-weight: 800;
          background: linear-gradient(135deg, var(--green-d), var(--blue));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .lp-stat-lbl {
          font-size: 0.62rem; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--text-3);
          text-align: center;
        }

        /* ── CONTACT CARD ── */
        .lp-contact {
          background: var(--card);
          border-radius: var(--r-xl);
          box-shadow: var(--shadow-card);
          border: 1px solid rgba(37,99,235,0.08);
          overflow: hidden;
          animation: revealUp 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }

        .lp-contact-header {
          padding: 20px 20px 0;
          display: flex; align-items: center; gap: 10px;
        }
        .lp-contact-icon-wrap {
          width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(37,99,235,0.12));
          display: flex; align-items: center; justify-content: center; font-size: 17px;
        }
        .lp-contact-title {
          font-family: 'Syne', sans-serif;
          font-size: 1rem; font-weight: 800; color: var(--text-1);
        }
        .lp-contact-sub {
          font-size: 0.72rem; color: var(--text-3); font-weight: 500; margin-left: auto;
        }

        .lp-contact-list { padding: 14px 12px 16px; display: flex; flex-direction: column; gap: 8px; }

        .lp-clink {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 14px;
          border-radius: 16px;
          background: linear-gradient(135deg, #f8fffe 0%, #f0f8ff 100%);
          border: 1px solid rgba(16,185,129,0.10);
          text-decoration: none; color: var(--text-1);
          transition: all 0.2s;
        }
        .lp-clink:active { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.25); }

        .lp-clink-icon {
          width: 40px; height: 40px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 19px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .lp-clink-text b  { display: block; font-size: 0.88rem; font-weight: 700; color: var(--text-1); }
        .lp-clink-text span { font-size: 0.73rem; color: var(--text-3); font-weight: 500; }

        .lp-arrow {
          margin-left: auto; font-size: 0.8rem;
          color: var(--text-3); flex-shrink: 0;
        }

        /* ── COPYRIGHT ── */
        .lp-copy {
          text-align: center; margin-top: 32px;
          font-size: 0.67rem; font-weight: 500; letter-spacing: 0.07em;
          color: var(--text-3); text-transform: uppercase;
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
            fontSize: '1.6rem', // ขนาดกำลังดีสำหรับ Mobile ไม่ล้นแน่นอน
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

        {/* Contact */}
        <div className="lp-contact">
          <div className="lp-contact-header">
            <div className="lp-contact-icon-wrap">📬</div>
            <span className="lp-contact-title">ติดต่อเรา</span>
            <span className="lp-contact-sub">Contact Support</span>
          </div>
          <div className="lp-contact-list">
            <a href="mailto:hello@signtranslate.ai" className="lp-clink">
              <div className="lp-clink-icon" style={{background:"linear-gradient(135deg,#ecfdf5,#d1fae5)"}}>✉️</div>
              <div className="lp-clink-text">
                <b>Email Support</b>
                <span>hello@signtranslate.ai</span>
              </div>
              <span className="lp-arrow">›</span>
            </a>
            <a href="#" className="lp-clink">
              <div className="lp-clink-icon" style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)"}}>💬</div>
              <div className="lp-clink-text">
                <b>LINE Official</b>
                <span>@signtranslate</span>
              </div>
              <span className="lp-arrow">›</span>
            </a>
            <a href="#" className="lp-clink">
              <div className="lp-clink-icon" style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)"}}>🌐</div>
              <div className="lp-clink-text">
                <b>Facebook Page</b>
                <span>SignTranslate Thailand</span>
              </div>
              <span className="lp-arrow">›</span>
            </a>
          </div>
        </div>

        <p className="lp-copy">© 2026 SignTranslate · Powered by Next.js · All rights reserved</p>
      </div>
    </>
  );
}