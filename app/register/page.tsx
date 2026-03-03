"use client";
import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient();

export default function Register() {
  const router = useRouter();

  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const nameOk    = name.trim().length >= 3;
  const emailOk   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passOk    = password.length >= 6;
  const matchOk   = password === confirm && confirm.length > 0;
  const valid     = nameOk && emailOk && passOk && matchOk;

  const strength  = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthLabel = ["", "อ่อน", "ปานกลาง", "แข็งแกร่ง"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) { setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง"); return; }
    setLoading(true); setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setErrorMsg(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert([{ id: data.user.id, role: "user" }]);
    }
    localStorage.setItem("verifyEmail", email);
    router.push("/otp");
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }

        :root {
          --forest:  #0d7a5f;
          --forest-d:#065f46;
          --forest-l:#34d399;
          --slate:   #334e68;
          --slate-d: #1e3a50;
          --slate-l: #627d98;
          --bg:      #f6faf8;
          --bg2:     #edf5f1;
          --white:   #ffffff;
          --border:  #d4e6dc;
          --text-1:  #0f2318;
          --text-2:  #3d5a47;
          --text-3:  #8aad97;
          --red:     #dc2626;
          --red-bg:  #fef2f2;
        }

        html, body {
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
          background: var(--bg);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          color: var(--text-1);
        }

        /* ── BACKGROUND ── */
        .rg-bg {
          position: fixed; inset:0; z-index:0; pointer-events:none;
          background:
            radial-gradient(ellipse 75% 50% at 5%  0%,   rgba(13,122,95,0.09)  0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 95% 100%, rgba(51,78,104,0.08)  0%, transparent 60%),
            radial-gradient(ellipse 45% 40% at 80% 15%,  rgba(52,211,153,0.07) 0%, transparent 55%),
            linear-gradient(155deg, #f0faf5 0%, #f6faf8 50%, #f0f5fa 100%);
        }

        /* Subtle dot texture */
        .rg-texture {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image: radial-gradient(circle, rgba(13,122,95,0.11) 1px, transparent 1px);
          background-size: 30px 30px;
          mask-image: radial-gradient(ellipse 65% 65% at 50% 50%, black 10%, transparent 75%);
          opacity: 0.55;
        }

        /* Blobs */
        .rg-blob { position:fixed; border-radius:50%; pointer-events:none; z-index:0; filter:blur(65px); animation:bdrift ease-in-out infinite alternate; }
        .rb1 { width:320px; height:320px; background:rgba(13,122,95,0.09);  top:-70px;  left:-60px;  animation-duration:18s; }
        .rb2 { width:260px; height:260px; background:rgba(51,78,104,0.08);  bottom:-50px; right:-50px; animation-duration:14s; animation-delay:-7s; }
        .rb3 { width:200px; height:200px; background:rgba(52,211,153,0.07); top:40%;    left:62%;    animation-duration:22s; animation-delay:-11s; }
        @keyframes bdrift { from{transform:translate(0,0) scale(1);} to{transform:translate(16px,22px) scale(1.07);} }

        /* ── PAGE ── */
        .rg-page {
          position:relative; z-index:2;
          min-height:100svh;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding: 28px 20px 44px;
        }

        /* ── TOP BRAND ── */
        .rg-brand {
          display:flex; flex-direction:column; align-items:center; margin-bottom:20px;
          animation: rUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes rUp { from{opacity:0;transform:translateY(-14px);} to{opacity:1;transform:translateY(0);} }

        .rg-logo {
          width:58px; height:58px; border-radius:18px; margin-bottom:10px;
          background: linear-gradient(135deg, var(--forest) 0%, var(--slate) 100%);
          display:flex; align-items:center; justify-content:center; font-size:26px;
          box-shadow: 0 8px 26px rgba(13,122,95,0.28), 0 0 0 4px rgba(255,255,255,0.92);
          position:relative; overflow:hidden;
        }
        .rg-logo::after {
          content:''; position:absolute; top:-18%; left:-8%; width:48%; height:48%;
          background:rgba(255,255,255,0.22); border-radius:50%; filter:blur(8px);
        }

        .rg-brand-name { font-size:1.3rem; font-weight:800; letter-spacing:-0.02em; color:var(--slate-d); }
        .rg-brand-name span { color:var(--forest); }
        .rg-brand-sub { font-size:0.68rem; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-3); margin-top:2px; }

        /* ── CARD ── */
        .rg-card {
          width:100%; max-width:420px;
          background: var(--white);
          border-radius:28px;
          border:1px solid var(--border);
          box-shadow: 0 2px 4px rgba(15,35,24,0.03), 0 16px 52px rgba(15,35,24,0.08);
          padding:36px 32px 32px;
          animation: cUp 0.65s 0.06s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cUp { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }

        .rg-card-title { font-size:1.22rem; font-weight:700; color:var(--text-1); letter-spacing:-0.02em; margin-bottom:3px; }
        .rg-card-sub   { font-size:0.8rem; color:var(--text-2); font-weight:400; margin-bottom:26px; line-height:1.5; }

        /* ── STEP INDICATOR ── */
        .rg-steps {
          display:flex; align-items:center; gap:0; margin-bottom:26px;
        }
        .rg-step {
          display:flex; align-items:center; gap:6px;
          font-size:0.7rem; font-weight:600; letter-spacing:0.04em;
          color:var(--text-3);
        }
        .rg-step.active { color:var(--forest); }
        .rg-step-circle {
          width:22px; height:22px; border-radius:50%;
          border:2px solid currentColor;
          display:flex; align-items:center; justify-content:center;
          font-size:0.65rem; font-weight:700;
          background:transparent;
          transition:all 0.2s;
        }
        .rg-step.active .rg-step-circle { background:var(--forest); color:#fff; border-color:var(--forest); }
        .rg-step-line { flex:1; height:1.5px; background:var(--border); margin:0 6px; }

        /* ── FORM ── */
        .rg-form { display:flex; flex-direction:column; gap:14px; }

        .rg-field { display:flex; flex-direction:column; gap:5px; }
        .rg-lbl-row { display:flex; align-items:center; justify-content:space-between; }
        .rg-label { font-size:0.77rem; font-weight:600; color:var(--text-1); }
        .rg-hint  { font-size:0.68rem; color:var(--text-3); }

        .rg-input-wrap { position:relative; }
        .rg-input-icon {
          position:absolute; left:13px; top:50%; transform:translateY(-50%);
          color:var(--text-3); pointer-events:none;
          display:flex; align-items:center;
        }
        .rg-input {
          width:100%; padding:13px 16px 13px 42px;
          border-radius:12px; border:1.5px solid var(--border);
          background:var(--bg); color:var(--text-1);
          font-family:'Inter','Noto Sans Thai',sans-serif;
          font-size:0.93rem; font-weight:400; outline:none;
          transition:border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .rg-input::placeholder { color:var(--text-3); }
        .rg-input:focus { border-color:var(--forest); background:var(--white); box-shadow:0 0 0 3px rgba(13,122,95,0.10); }
        .rg-input.valid   { border-color:var(--forest-l); }
        .rg-input.invalid { border-color:#fca5a5; }

        .rg-eye-btn {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; padding:4px;
          color:var(--text-3); display:flex; align-items:center;
          transition:color 0.18s;
        }
        .rg-eye-btn:hover { color:var(--forest); }

        /* Validation tick */
        .rg-tick {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          font-size:14px;
        }

        /* ── PASSWORD STRENGTH ── */
        .rg-strength { display:flex; align-items:center; gap:8px; margin-top:5px; }
        .rg-str-bars { display:flex; gap:3px; flex:1; }
        .rg-str-bar  { flex:1; height:3px; border-radius:3px; background:var(--border); transition:background 0.3s; }
        .rg-str-text { font-size:0.68rem; font-weight:600; min-width:52px; text-align:right; }

        /* ── ERROR ── */
        .rg-error {
          display:flex; align-items:flex-start; gap:8px;
          padding:11px 14px; border-radius:10px;
          background:var(--red-bg); border:1px solid rgba(220,38,38,0.2);
          font-size:0.82rem; font-weight:500; color:var(--red); line-height:1.4;
        }

        /* ── SUBMIT ── */
        .rg-btn-submit {
          display:flex; align-items:center; justify-content:center; gap:8px;
          width:100%; padding:15px; margin-top:2px;
          border-radius:14px; border:none; cursor:pointer;
          font-family:'Inter','Noto Sans Thai',sans-serif;
          font-size:0.97rem; font-weight:700; color:#fff; letter-spacing:0.01em;
          position:relative; overflow:hidden;
          transition:transform 0.16s, box-shadow 0.16s, background 0.2s;
        }
        .rg-btn-submit.ready {
          background:linear-gradient(135deg, var(--forest-d) 0%, var(--forest) 55%, #1aad82 100%);
          box-shadow:0 8px 26px rgba(13,122,95,0.32);
        }
        .rg-btn-submit.ready::after {
          content:''; position:absolute; top:0; left:-70%; width:45%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
          transform:skewX(-15deg); animation:sheen 2.8s ease-in-out infinite;
        }
        @keyframes sheen { 0%,100%{left:-70%;} 45%{left:140%;} }
        .rg-btn-submit.ready:hover  { transform:translateY(-1px); box-shadow:0 12px 32px rgba(13,122,95,0.38); }
        .rg-btn-submit.ready:active { transform:scale(0.98); }
        .rg-btn-submit.disabled {
          background:var(--bg2); color:var(--text-3); cursor:not-allowed; box-shadow:none;
        }

        .rg-spinner {
          width:18px; height:18px; border-radius:50%;
          border:2.5px solid rgba(255,255,255,0.3); border-top-color:white;
          animation:spin 0.7s linear infinite;
        }
        @keyframes spin { to{transform:rotate(360deg);} }

        /* ── LOGIN LINK ── */
        .rg-login-row { text-align:center; margin-top:4px; font-size:0.82rem; color:var(--text-2); }
        .rg-login-row a { color:var(--forest); font-weight:600; text-decoration:none; }
        .rg-login-row a:hover { color:var(--forest-d); text-decoration:underline; }

        /* ── FOOTER ── */
        .rg-footer {
          margin-top:18px; text-align:center;
          font-size:0.66rem; font-weight:500; letter-spacing:0.06em;
          text-transform:uppercase; color:var(--text-3);
        }
      `}</style>

      <div className="rg-bg" />
      <div className="rg-texture" />
      <div className="rg-blob rb1" />
      <div className="rg-blob rb2" />
      <div className="rg-blob rb3" />

      <main className="rg-page">

        {/* Brand */}
        <div className="rg-brand">
          <div className="rg-logo">🤟</div>
          <div className="rg-brand-name">Sign<span>Translate</span></div>
          <div className="rg-brand-sub">AI Sign Language Platform</div>
        </div>

        {/* Card */}
        <div className="rg-card">
          <h1 className="rg-card-title">สร้างบัญชีใหม่ 🌱</h1>
          <p className="rg-card-sub">กรอกข้อมูลด้านล่างเพื่อเริ่มต้นใช้งาน SignTranslate</p>

          {/* Steps */}
          <div className="rg-steps">
            <div className="rg-step active">
              <div className="rg-step-circle">1</div>
              <span>ข้อมูล</span>
            </div>
            <div className="rg-step-line" />
            <div className="rg-step">
              <div className="rg-step-circle">2</div>
              <span>ยืนยัน OTP</span>
            </div>
            <div className="rg-step-line" />
            <div className="rg-step">
              <div className="rg-step-circle">3</div>
              <span>เสร็จสิ้น</span>
            </div>
          </div>

          <form className="rg-form" onSubmit={handleRegister}>

            {/* Name */}
            <div className="rg-field">
              <label className="rg-label">ชื่อ-นามสกุล</label>
              <div className="rg-input-wrap">
                <span className="rg-input-icon"><User size={15} /></span>
                <input className={`rg-input${nameOk ? " valid" : name.length > 0 ? " invalid" : ""}`}
                  type="text" placeholder="เช่น สมชาย ใจดี (อย่างน้อย 3 ตัวอักษร)"
                  value={name} onChange={(e) => setName(e.target.value)} />
                {nameOk && <span className="rg-tick">✅</span>}
              </div>
            </div>

            {/* Email */}
            <div className="rg-field">
              <label className="rg-label">อีเมล</label>
              <div className="rg-input-wrap">
                <span className="rg-input-icon"><Mail size={15} /></span>
                <input className={`rg-input${emailOk ? " valid" : email.length > 0 ? " invalid" : ""}`}
                  type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
                {emailOk && <span className="rg-tick">✅</span>}
              </div>
            </div>

            {/* Password */}
            <div className="rg-field">
              <div className="rg-lbl-row">
                <label className="rg-label">รหัสผ่าน</label>
                <span className="rg-hint">ขั้นต่ำ 6 ตัวอักษร</span>
              </div>
              <div className="rg-input-wrap">
                <span className="rg-input-icon"><Lock size={15} /></span>
                <input className={`rg-input${passOk ? " valid" : password.length > 0 ? " invalid" : ""}`}
                  type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{paddingRight:"44px"}} />
                <button type="button" className="rg-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="rg-strength">
                  <div className="rg-str-bars">
                    {[1,2,3].map(i => (
                      <div key={i} className="rg-str-bar"
                        style={{background: strength >= i ? strengthColor : undefined}} />
                    ))}
                  </div>
                  <span className="rg-str-text" style={{color:strengthColor}}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="rg-field">
              <label className="rg-label">ยืนยันรหัสผ่าน</label>
              <div className="rg-input-wrap">
                <span className="rg-input-icon"><Lock size={15} /></span>
                <input className={`rg-input${matchOk ? " valid" : confirm.length > 0 ? " invalid" : ""}`}
                  type={showConfirm ? "text" : "password"} placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  style={{paddingRight:"44px"}} />
                <button type="button" className="rg-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {confirm.length > 0 && !matchOk && (
                <span style={{fontSize:"0.72rem",color:"#ef4444",marginTop:"2px"}}>
                  รหัสผ่านไม่ตรงกัน
                </span>
              )}
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rg-error">
                <span>⚠️</span><span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={!valid || loading}
              className={`rg-btn-submit ${valid ? "ready" : "disabled"}`}>
              {loading
                ? <span className="rg-spinner" />
                : <>{valid ? "🚀" : "🔒"}&nbsp; {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}</>
              }
            </button>

            {/* Login link */}
            <div className="rg-login-row">
              มีบัญชีแล้ว?&nbsp;
              <Link href="/login">เข้าสู่ระบบ</Link>
            </div>

          </form>
        </div>

        <p className="rg-footer">© 2026 SignTranslate · Secured by Supabase Auth</p>
      </main>
    </>
  );
}