"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // 1. ล็อกอินด้วย Email และ Password
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง");
      setLoading(false);
      return;
    }

    try {
      // 2. ดึงข้อมูล Role จากตาราง profiles (สมมติว่าคุณเก็บ role ไว้ที่นี่)
      // หรือถ้าคุณเก็บใน user_metadata สามารถดึงจาก data.user.user_metadata ได้เลย
      const { data: profile, error: profileError } = await supabase
        .from('profiles') // เปลี่ยนชื่อตารางให้ตรงกับที่คุณใช้เก็บ Role
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      // 3. ตรวจสอบ Role และ Redirect ไปยัง Path ที่ถูกต้อง
      if (profile?.role === 'admin') {
        window.location.href = "/dashboard/admin";
      } else {
        window.location.href = "/dashboard/user"; // หรือ path ของ user ที่คุณตั้งไว้
      }

    } catch (err) {
      console.error("Error fetching role:", err);
      // กรณีดึง Role ไม่สำเร็จ ให้ไปหน้า default user หรือแจ้ง error
      window.location.href = "/dashboard/user"; 
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        :root {
          --navy:    #1e3a5f;
          --navy-d:  #0f2440;
          --blue:    #2563eb;
          --blue-l:  #3b82f6;
          --mint:    #10b981;
          --mint-l:  #34d399;
          --bg:      #f4f7fb;
          --bg2:     #eaf0f8;
          --white:   #ffffff;
          --border:  #dde5f0;
          --text-1:  #0f2440;
          --text-2:  #4a6080;
          --text-3:  #8fa3be;
          --error:   #dc2626;
          --error-bg:#fef2f2;
        }

        html, body {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          background: var(--bg);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          color: var(--text-1);
        }

        /* ── BACKGROUND ── */
        .sc-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 70% 55% at 10% 0%,   rgba(37,99,235,0.07)  0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 100%, rgba(16,185,129,0.07) 0%, transparent 60%),
            linear-gradient(160deg, #f0f6ff 0%, #f4f7fb 50%, #f0fcf8 100%);
        }

        /* Dot grid */
        .sc-dots {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(37,99,235,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 75% 75% at 50% 50%, black 0%, transparent 75%);
          opacity: 0.6;
        }

        /* Soft blobs */
        .sc-blob {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          animation: blobDrift ease-in-out infinite alternate; filter: blur(70px);
        }
        .sc-b1 { width:350px; height:350px; background:rgba(37,99,235,0.08);  top:-80px;  left:-60px;  animation-duration:17s; }
        .sc-b2 { width:280px; height:280px; background:rgba(16,185,129,0.07); bottom:-50px; right:-50px; animation-duration:13s; animation-delay:-6s; }
        @keyframes blobDrift { from{transform:translate(0,0) scale(1);} to{transform:translate(18px,24px) scale(1.07);} }

        /* ── DECORATIVE SHAPES ── */
        .sc-shape {
          position: fixed; pointer-events: none; z-index: 0;
          border-radius: 50%; border: 1.5px solid;
          animation: shapeDrift ease-in-out infinite alternate;
        }
        .sc-s1 { width:180px; height:180px; border-color:rgba(37,99,235,0.10); top:8%; right:5%; animation-duration:14s; }
        .sc-s2 { width:100px; height:100px; border-color:rgba(16,185,129,0.12); bottom:18%; left:4%; animation-duration:10s; animation-delay:-4s; }
        @keyframes shapeDrift { from{transform:translate(0,0) rotate(0deg);} to{transform:translate(10px,15px) rotate(20deg);} }

        /* ── PAGE ── */
        .sc-page {
          position: relative; z-index: 2;
          min-height: 100svh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 28px 20px 40px;
        }

        /* ── BRAND TOP ── */
        .sc-topbrand {
          display: flex; flex-direction: column; align-items: center; margin-bottom: 24px;
          animation: slideDown 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideDown { from{opacity:0;transform:translateY(-16px);} to{opacity:1;transform:translateY(0);} }

        .sc-logo {
          width: 64px; height: 64px; border-radius: 20px; margin-bottom: 12px;
          background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 60%, var(--mint) 100%);
          display: flex; align-items: center; justify-content: center; font-size: 28px;
          box-shadow: 0 8px 28px rgba(37,99,235,0.28), 0 0 0 4px rgba(255,255,255,0.9);
          position: relative; overflow: hidden;
        }
        .sc-logo::after {
          content:''; position:absolute; top:-20%; left:-10%; width:50%; height:50%;
          background:rgba(255,255,255,0.22); border-radius:50%; filter:blur(10px);
        }

        .sc-brand-name {
          font-size: 1.4rem; font-weight: 800; letter-spacing: -0.03em;
          color: var(--navy-d);
        }
        .sc-brand-name span { color: var(--blue); }
        .sc-brand-sub {
          font-size: 0.7rem; font-weight: 500; letter-spacing: 0.11em;
          text-transform: uppercase; color: var(--text-3); margin-top: 2px;
        }

        /* ── CARD ── */
        .sc-card {
          width: 100%; max-width: 400px;
          background: var(--white);
          border-radius: 28px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px rgba(15,36,64,0.03), 0 20px 60px rgba(15,36,64,0.08);
          padding: 36px 32px 32px;
          animation: cardUp 0.65s 0.05s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardUp { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }

        .sc-card-title {
          font-size: 1.25rem; font-weight: 700; color: var(--navy-d);
          margin-bottom: 4px; letter-spacing: -0.02em;
        }
        .sc-card-sub {
          font-size: 0.82rem; color: var(--text-2); font-weight: 400;
          margin-bottom: 28px; line-height: 1.5;
        }

        /* ── FIELDS ── */
        .sc-form { display: flex; flex-direction: column; gap: 16px; }

        .sc-field { display: flex; flex-direction: column; gap: 6px; }
        .sc-label {
          font-size: 0.78rem; font-weight: 600; color: var(--text-1);
          letter-spacing: 0.01em;
        }

        .sc-input-wrap { position: relative; }
        .sc-input {
          width: 100%; padding: 13px 16px 13px 44px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--bg);
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-size: 0.93rem; font-weight: 400; color: var(--text-1);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .sc-input::placeholder { color: var(--text-3); }
        .sc-input:focus {
          border-color: var(--blue-l);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.10);
        }
        .sc-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 15px; pointer-events: none;
        }
        .sc-pw-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 4px;
          font-size: 15px; color: var(--text-3);
          transition: color 0.18s;
        }
        .sc-pw-btn:hover { color: var(--blue); }

        /* ── REMEMBER + FORGOT ── */
        .sc-meta {
          display: flex; justify-content: space-between; align-items: center;
        }
        .sc-check-lbl {
          display: flex; align-items: center; gap: 7px; cursor: pointer;
          font-size: 0.82rem; font-weight: 500; color: var(--text-2);
        }
        .sc-check {
          width: 15px; height: 15px; border-radius: 4px; cursor: pointer;
          accent-color: var(--blue);
        }
        .sc-forgot {
          font-size: 0.82rem; font-weight: 600; color: var(--blue);
          text-decoration: none; transition: color 0.18s;
        }
        .sc-forgot:hover { color: var(--mint); }

        /* ── ERROR ── */
        .sc-error {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 11px 14px; border-radius: 10px;
          background: var(--error-bg);
          border: 1px solid rgba(220,38,38,0.2);
          font-size: 0.82rem; font-weight: 500; color: var(--error); line-height: 1.4;
        }

        /* ── SUBMIT ── */
        .sc-btn-submit {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 15px;
          border-radius: 14px; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 0.97rem; font-weight: 700;
          color: #fff; letter-spacing: 0.01em;
          background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 55%, var(--blue-l) 100%);
          box-shadow: 0 6px 24px rgba(37,99,235,0.28);
          position: relative; overflow: hidden;
          transition: transform 0.16s, box-shadow 0.16s;
        }
        .sc-btn-submit::after {
          content: ''; position: absolute; top:0; left:-70%; width:45%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-15deg);
          animation: sheen 2.8s ease-in-out infinite;
        }
        @keyframes sheen { 0%,100%{left:-70%;} 45%{left:140%;} }
        .sc-btn-submit:hover { transform:translateY(-1px); box-shadow:0 10px 32px rgba(37,99,235,0.35); }
        .sc-btn-submit:active { transform:scale(0.98); }
        .sc-btn-submit:disabled { opacity:0.65; cursor:not-allowed; transform:none; }

        .sc-spinner {
          width:18px; height:18px; border-radius:50%;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to{transform:rotate(360deg);} }

        /* ── SEPARATOR ── */
        .sc-sep {
          display: flex; align-items: center; gap: 10px;
        }
        .sc-sep-line { flex:1; height:1px; background: var(--border); }
        .sc-sep-text { font-size:0.75rem; font-weight:500; color:var(--text-3); }

        /* ── REGISTER BUTTON ── */
        .sc-btn-reg {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; padding: 14px;
          border-radius: 14px;
          background: var(--bg);
          border: 1.5px solid var(--border);
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          font-size: 0.92rem; font-weight: 600; color: var(--navy);
          text-decoration: none;
          transition: all 0.18s;
        }
        .sc-btn-reg:hover { background:var(--white); border-color:var(--blue-l); color:var(--blue); }
        .sc-btn-reg:active { transform:scale(0.98); }

        /* ── FEATURE CHIPS ── */
        .sc-chips {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-bottom: 24px; justify-content: center;
          animation: cardUp 0.65s 0.15s cubic-bezier(0.16,1,0.3,1) both;
        }
        .sc-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 100px;
          background: rgba(255,255,255,0.9);
          border: 1px solid var(--border);
          font-size: 0.7rem; font-weight: 600; color: var(--text-2);
          box-shadow: 0 1px 4px rgba(15,36,64,0.05);
        }
        .sc-chip-dot { width:6px; height:6px; border-radius:50%; }

        /* ── FOOTER ── */
        .sc-footer {
          margin-top: 20px; text-align: center;
          font-size: 0.67rem; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-3);
        }
      `}</style>

      {/* Backgrounds */}
      <div className="sc-bg" />
      <div className="sc-dots" />
      <div className="sc-blob sc-b1" />
      <div className="sc-blob sc-b2" />
      <div className="sc-shape sc-s1" />
      <div className="sc-shape sc-s2" />

      <main className="sc-page">

        {/* Brand */}
        <div className="sc-topbrand">
         <div className="lp-logo-container" style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '16px'
}}>
  <img 
    src="/logo.png" 
    alt="SignTranslate" 
    style={{ 
      width: '150px',       // ปรับขนาดความกว้างตามต้องการ
      height: '150px',      // ให้ความสูงปรับตามสัดส่วนภาพอัตโนมัติ
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' // ใส่เงาบางๆ ที่ตัวโลโก้เพื่อให้ดูมีมิติ
    }} 
  />
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
          <div className="sc-brand-sub">AI Sign Language Platform</div>
        </div>

        {/* Card */}
        <div className="sc-card">
          {/* Title - ยินดีต้อนรับ */}
          <h1 className="sc-card-title" style={{
            fontSize: '1.8rem',
            fontWeight: '850',
            color: '#0f172a',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            ยินดีต้อนรับ <span style={{ animation: 'wave 2s infinite' }}>👋</span>
          </h1>

          <form className="sc-form" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="sc-field">
              <label className="sc-label">อีเมล</label>
              <div className="sc-input-wrap">
                <span className="sc-input-icon">✉️</span>
                <input className="sc-input" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Password */}
            <div className="sc-field">
              <label className="sc-label">รหัสผ่าน</label>
              <div className="sc-input-wrap">
                <span className="sc-input-icon">🔒</span>
                <input className="sc-input" type={showPassword ? "text" : "password"}
                  placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  style={{paddingRight:"44px"}} />
                <button type="button" className="sc-pw-btn"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Meta */}
            <div className="sc-meta">
              <label className="sc-check-lbl">
                <input className="sc-check" type="checkbox" checked={remember}
                  onChange={() => setRemember(!remember)} />
                จดจำฉัน
              </label>
              <a className="sc-forgot" href="/forgot-password">ลืมรหัสผ่าน?</a>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="sc-error">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="sc-btn-submit" disabled={loading}>
              {loading ? <span className="sc-spinner" /> : <>🔑&nbsp; เข้าสู่ระบบ</>}
            </button>

            {/* Sep */}
            <div className="sc-sep">
              <div className="sc-sep-line" />
              <span className="sc-sep-text">ยังไม่มีบัญชี?</span>
              <div className="sc-sep-line" />
            </div>

            {/* Register */}
            <a href="/register" className="sc-btn-reg">
              ✨&nbsp; สมัครสมาชิกฟรี
            </a>

          </form>
        </div>

        <p className="sc-footer">© 2026 SignTranslate · Secured by Supabase Auth</p>
      </main>
    </>
  );
}