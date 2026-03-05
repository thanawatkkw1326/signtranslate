"use client"; // บรรทัดที่ 1 ต้องเป็นอันนี้เท่านั้น ห้ามมีอะไรอยู่ข้างบน

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  User, Bell, Camera, ChevronRight, Activity, 
  ShieldCheck, LogOut, Loader2 
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export default function UserProfileDashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [translationCount, setTranslationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles").select("*").eq("id", user.id).single();
        if (profileData) setProfile(profileData);

        const { count } = await supabase
          .from("translations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (count !== null) setTranslationCount(count);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayName = profile?.full_name 
    ? profile.full_name 
    : profile?.email?.split('@')[0] || "ผู้ใช้งานใหม่";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=K2D:wght@300;400;500;600;700;800&display=swap');

        .upd-root {
          min-height: 100svh;
          font-family: 'K2D', sans-serif;
          background: #eef9f4;
          position: relative;
          overflow-x: hidden;
          padding-bottom: 72px;
        }

        .upd-bg-mesh {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 90% 55% at 15% -5%,  rgba(16,185,129,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 65% 45% at 92% 18%,  rgba(37,99,235,0.08)  0%, transparent 55%),
            radial-gradient(ellipse 70% 55% at 50% 105%, rgba(52,211,153,0.07) 0%, transparent 60%),
            linear-gradient(160deg, #edfdf5 0%, #f8fbff 45%, #f0faf6 100%);
        }
        .upd-bg-dots {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(16,185,129,0.13) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 65% 75% at 50% 25%, black 20%, transparent 80%);
          opacity: 0.5;
        }

        .upd-wrap {
          position: relative; z-index: 2;
          max-width: 430px; margin: 0 auto;
          padding: 0 18px;
        }

        /* ── HEADER ── */
        .upd-header {
          position: relative;
          padding: 48px 0 108px;
          overflow: hidden;
        }
        .upd-header-bg {
          position: absolute; inset: 0;
          background: linear-gradient(140deg, #047857 0%, #10b981 42%, #1d4ed8 100%);
          border-radius: 0 0 44px 44px;
          z-index: 0;
        }
        .upd-header-bg::before {
          content: '';
          position: absolute; top: -40%; left: -10%; right: -10%; height: 80%;
          background: radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 70%);
        }
        .upd-header-grid {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 36px 36px;
          border-radius: 0 0 44px 44px;
        }
        .upd-hc1 { position:absolute; width:220px; height:220px; border-radius:50%; background:rgba(255,255,255,0.07); top:-70px; right:-50px; z-index:1; }
        .upd-hc2 { position:absolute; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,0.05); bottom:30px; left:-30px; z-index:1; }
        .upd-hc3 { position:absolute; width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,0.06); top:30px; left:40%; z-index:1; }

        .upd-header-inner {
          position: relative; z-index: 2;
          display: flex; justify-content: space-between; align-items: flex-start;
        }
        .upd-header-eyebrow {
          font-size: 0.67rem; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.65);
          margin-bottom: 6px; display: flex; align-items: center; gap: 6px;
        }
        .upd-ey-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.5); }
        .upd-header-title {
          font-family:'K2D',sans-serif; font-size:2rem; font-weight:800;
          line-height:1; letter-spacing:-0.04em; color:#fff;
        }
        .upd-header-sub { font-size:0.73rem; color:rgba(255,255,255,0.58); font-weight:500; margin-top:7px; }

        .upd-bell-btn {
          position:relative; width:46px; height:46px; border-radius:16px;
          background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.28);
          display:flex; align-items:center; justify-content:center;
          backdrop-filter:blur(12px); cursor:pointer; flex-shrink:0; transition:all 0.2s;
        }
        .upd-bell-btn:active { transform:scale(0.91); }
        .upd-bell-dot {
          position:absolute; top:9px; right:9px; width:9px; height:9px;
          border-radius:50%; background:#fb7185; border:2px solid rgba(5,150,105,0.4);
          animation:bellPulse 2.2s ease-in-out infinite;
        }
        @keyframes bellPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(251,113,133,0.45)}
          55%    {box-shadow:0 0 0 5px rgba(251,113,133,0)}
        }

        /* ── CONTENT ── */
        .upd-content {
          margin-top: -80px;
          display: flex; flex-direction: column; gap: 13px;
        }

        .glass-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(24px);
          border: 1.5px solid rgba(255,255,255,0.95);
          border-radius: 26px;
          box-shadow: 0 6px 28px rgba(15,31,46,0.06), 0 1px 4px rgba(15,31,46,0.04), inset 0 1px 0 rgba(255,255,255,1);
        }

        /* ── PROFILE CARD ── */
        .upd-profile-card {
          padding: 18px 18px 18px 16px;
          display: flex; align-items: center; gap: 14px;
          animation: cardUp 0.55s 0.04s cubic-bezier(0.16,1,0.3,1) both;
        }
        .upd-avatar-wrap { position:relative; flex-shrink:0; }
        .upd-avatar-ring {
          width:70px; height:70px; border-radius:22px;
          padding:2.5px; background:linear-gradient(135deg,#10b981,#3b82f6);
        }
        .upd-avatar-inner {
          width:100%; height:100%; border-radius:19px;
          background:linear-gradient(135deg,#e8fdf5,#eff6ff);
          display:flex; align-items:center; justify-content:center;
          overflow:hidden; border:2px solid white;
        }
        .upd-avatar-inner img { width:100%; height:100%; object-fit:cover; border-radius:17px; }
        .upd-online-dot {
          position:absolute; bottom:-2px; right:-2px;
          width:15px; height:15px; border-radius:50%;
          background:#10b981; border:2.5px solid white;
          box-shadow:0 2px 6px rgba(16,185,129,0.45);
        }
        .upd-profile-info { flex:1; min-width:0; }
        .upd-profile-name {
          font-family:'K2D',sans-serif; font-size:1.1rem; font-weight:800;
          letter-spacing:-0.02em; color:#0f1f2e;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .upd-profile-email {
          font-size:0.68rem; color:#94a3b8; font-weight:500;
          margin-top:2px; margin-bottom:7px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .upd-profile-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:3px 9px;
          background:linear-gradient(135deg,rgba(16,185,129,0.10),rgba(37,99,235,0.07));
          border:1px solid rgba(16,185,129,0.22); border-radius:100px;
          font-size:0.62rem; font-weight:800; letter-spacing:0.09em;
          color:#059669; text-transform:uppercase;
        }
        .upd-badge-dot { width:5px; height:5px; border-radius:50%; background:#10b981; }
        .upd-edit-btn {
          width:40px; height:40px; border-radius:14px; flex-shrink:0;
          background:linear-gradient(135deg,#f0fdf9,#eff6ff);
          border:1px solid rgba(16,185,129,0.15);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; font-size:17px;
          box-shadow:0 2px 8px rgba(16,185,129,0.09); transition:all 0.2s;
        }
        .upd-edit-btn:active { transform:scale(0.91); }

        /* ── STATS ROW ── */
        .upd-stats-card {
          padding:16px 14px;
          display:flex; gap:0;
          animation: cardUp 0.55s 0.09s cubic-bezier(0.16,1,0.3,1) both;
        }
        .upd-stat-item {
          flex:1; display:flex; flex-direction:column; align-items:center;
          gap:4px; padding:0 6px; position:relative;
        }
        .upd-stat-item + .upd-stat-item::before {
          content:''; position:absolute; left:0; top:10%; height:80%;
          width:1px; background:rgba(16,185,129,0.12);
        }
        .upd-stat-icon {
          width:36px; height:36px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          font-size:16px; margin-bottom:2px;
        }
        .upd-stat-num {
          font-family:'K2D',sans-serif; font-size:1.3rem; font-weight:800;
          line-height:1; letter-spacing:-0.03em;
        }
        .blue  { color:#1d4ed8; } .green { color:#059669; } .amber { color:#b45309; }
        .upd-stat-lbl {
          font-size:0.6rem; font-weight:700; letter-spacing:0.09em;
          text-transform:uppercase; color:#94a3b8; text-align:center;
        }

        /* ── AI BUTTON ── */
        .upd-ai-btn {
          border-radius:26px; overflow:hidden;
          cursor:pointer; border:none; padding:0; background:none; width:100%;
          animation: cardUp 0.55s 0.14s cubic-bezier(0.16,1,0.3,1) both;
          transition:transform 0.2s; display:block;
        }
        .upd-ai-btn:active { transform:scale(0.985); }
        .upd-ai-inner {
          background:linear-gradient(135deg,#047857 0%,#10b981 48%,#1d4ed8 100%);
          padding:18px 20px;
          display:flex; align-items:center; justify-content:space-between;
          box-shadow:0 14px 44px rgba(16,185,129,0.30),0 4px 14px rgba(37,99,235,0.14);
          position:relative; overflow:hidden;
        }
        .upd-ai-inner::before {
          content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px);
          background-size:24px 24px;
        }
        .upd-ai-inner::after {
          content:''; position:absolute; top:0; left:-55%; width:35%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          transform:skewX(-18deg); animation:aiSheen 3.8s ease-in-out infinite;
        }
        @keyframes aiSheen { 0%,100%{left:-55%} 55%{left:130%} }

        .upd-ai-icon {
          width:54px; height:54px; border-radius:18px;
          background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.28);
          display:flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden; flex-shrink:0; z-index:1;
        }
        .upd-scan {
          position:absolute; width:100%; height:2px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent);
          top:0; animation:scanLine 2.2s ease-in-out infinite;
        }
        @keyframes scanLine {
          0%{top:0;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{top:100%;opacity:0}
        }
        .upd-ai-texts { flex:1; padding:0 14px; text-align:left; z-index:1; }
        .upd-ai-label {
          font-family:'K2D',sans-serif; font-size:1.02rem; font-weight:800;
          color:#fff; letter-spacing:-0.01em;
        }
        .upd-ai-sub { font-size:0.69rem; color:rgba(255,255,255,0.68); font-weight:500; margin-top:3px; }
        .upd-ai-chip {
          display:inline-flex; align-items:center; gap:4px;
          margin-top:7px; padding:3px 9px;
          background:rgba(255,255,255,0.18); border-radius:100px;
          font-size:0.58rem; font-weight:800; letter-spacing:0.1em;
          text-transform:uppercase; color:rgba(255,255,255,0.85);
          border:1px solid rgba(255,255,255,0.2);
        }
        .upd-chip-dot {
          width:5px; height:5px; border-radius:50%; background:#a7f3d0;
          animation:chipBlink 1.8s ease-in-out infinite;
        }
        @keyframes chipBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .upd-ai-arrow {
          width:40px; height:40px; border-radius:14px; flex-shrink:0; z-index:1;
          background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.22);
          display:flex; align-items:center; justify-content:center;
        }

        /* ── LOGOUT ── */
        .upd-logout-wrap { animation: cardUp 0.55s 0.19s cubic-bezier(0.16,1,0.3,1) both; }
        .upd-logout-btn {
          width:100%; border:none; cursor:pointer; padding:0; background:none;
          transition:transform 0.2s;
        }
        .upd-logout-btn:active { transform:scale(0.985); }
        .upd-logout-inner {
          display:flex; align-items:center;
          padding:15px 18px;
          background:rgba(255,255,255,0.88); backdrop-filter:blur(20px);
          border:1.5px solid rgba(251,113,133,0.18); border-radius:22px;
          box-shadow:0 4px 22px rgba(251,113,133,0.07),inset 0 1px 0 white;
          transition:border-color 0.22s,box-shadow 0.22s;
        }
        .upd-logout-icon {
          width:44px; height:44px; border-radius:15px; flex-shrink:0;
          background:linear-gradient(135deg,#fff1f2,#ffe4e6);
          display:flex; align-items:center; justify-content:center;
        }
        .upd-logout-texts { flex:1; text-align:left; padding:0 14px; }
        .upd-logout-title { font-size:0.9rem; font-weight:700; color:#e11d48; }
        .upd-logout-sub { font-size:0.65rem; color:#fca5b0; font-weight:500; margin-top:2px; }

        /* ── FOOTER ── */
        .upd-footer {
          animation: cardUp 0.55s 0.24s cubic-bezier(0.16,1,0.3,1) both;
          display:flex; flex-direction:column; align-items:center; gap:10px; margin-top:8px;
        }
        .upd-footer-divider { width:100%; display:flex; align-items:center; gap:10px; }
        .upd-footer-line {
          flex:1; height:1px;
          background:linear-gradient(90deg,transparent,rgba(16,185,129,0.22),rgba(37,99,235,0.15),transparent);
        }
        .upd-footer-gem {
          width:22px; height:22px; border-radius:7px;
          background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(37,99,235,0.12));
          border:1px solid rgba(16,185,129,0.2); transform:rotate(45deg);
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .upd-footer-copy {
          font-size:0.62rem; font-weight:700; letter-spacing:0.14em;
          text-transform:uppercase; color:#cbd5e1; text-align:center;
        }
        .upd-footer-copy strong {
          background:linear-gradient(90deg,#10b981,#2563eb);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; font-weight:900;
        }
        .upd-footer-powered {
          display:flex; align-items:center; gap:6px;
          font-size:0.58rem; font-weight:600;
          letter-spacing:0.1em; text-transform:uppercase; color:#e2e8f0;
        }
        .upd-footer-chip {
          padding:2px 8px; border-radius:100px;
          background:rgba(255,255,255,0.7); border:1px solid rgba(16,185,129,0.13);
          font-size:0.58rem; font-weight:800; letter-spacing:0.07em; color:#64748b;
        }

        /* ── SKELETON ── */
        .skel {
          background:linear-gradient(90deg,#e4f5ef 25%,#f0fbf7 50%,#e4f5ef 75%);
          background-size:200% 100%; animation:skelShimmer 1.5s infinite; border-radius:10px;
        }
        @keyframes skelShimmer { from{background-position:200% 0} to{background-position:-200% 0} }

        @keyframes cardUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="upd-root">
        <div className="upd-bg-mesh" />
        <div className="upd-bg-dots" />

        {/* ── HEADER ── */}
        <div className="upd-wrap" style={{ padding: 0 }}>
          <div className="upd-header">
            <div className="upd-header-bg" />
            <div className="upd-header-grid" />
            <div className="upd-hc1" /><div className="upd-hc2" /><div className="upd-hc3" />
            <div className="upd-wrap">
              <div className="upd-header-inner">
                <div>
                  <div className="upd-header-eyebrow">
                    <span className="upd-ey-dot" />ยินดีต้อนรับกลับมา
                  </div>
                  <div className="upd-header-title">โปรไฟล์</div>
                  <div className="upd-header-sub">จัดการบัญชีของคุณ</div>
                </div>
                <button className="upd-bell-btn" aria-label="การแจ้งเตือน">
                  <Bell size={20} color="white" />
                  <span className="upd-bell-dot" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="upd-wrap">
          <div className="upd-content">

            {/* 1. Profile */}
            <div className="glass-card upd-profile-card">
              <div className="upd-avatar-wrap">
                <div className="upd-avatar-ring">
                  <div className="upd-avatar-inner">
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="avatar" />
                      : <User size={28} color="#10b981" />
                    }
                  </div>
                </div>
                <div className="upd-online-dot" />
              </div>
              <div className="upd-profile-info">
                {loading ? (
                  <>
                    <div className="skel" style={{ height:20, width:'68%', marginBottom:7 }} />
                    <div className="skel" style={{ height:13, width:'50%', marginBottom:7 }} />
                    <div className="skel" style={{ height:18, width:'35%' }} />
                  </>
                ) : (
                  <>
                    <div className="upd-profile-name">{displayName}</div>
                    <div className="upd-profile-email">{profile?.email ?? "—"}</div>
                    <div className="upd-profile-badge">
                      <span className="upd-badge-dot" />ผู้ใช้งานทั่วไป
                    </div>
                  </>
                )}
              </div>
              <button className="upd-edit-btn" aria-label="แก้ไขโปรไฟล์">✏️</button>
            </div>

            {/* 2. Stats */}
            <div className="glass-card upd-stats-card">
              <div className="upd-stat-item">
                <div className="upd-stat-icon" style={{ background:'linear-gradient(135deg,#dbeafe,#eff6ff)' }}>
                  <Activity size={17} color="#2563eb" />
                </div>
                {loading
                  ? <div className="skel" style={{ height:26, width:48 }} />
                  : <div className="upd-stat-num blue">{translationCount.toLocaleString()}</div>
                }
                <div className="upd-stat-lbl">แปลแล้ว</div>
              </div>
              <div className="upd-stat-item">
                <div className="upd-stat-icon" style={{ background:'linear-gradient(135deg,#d1fae5,#ecfdf5)' }}>
                  <ShieldCheck size={17} color="#059669" />
                </div>
                <div className="upd-stat-num green">ปกติ</div>
                <div className="upd-stat-lbl">สถานะ</div>
              </div>
              <div className="upd-stat-item">
                <div className="upd-stat-icon" style={{ background:'linear-gradient(135deg,#fef3c7,#fff7ed)', fontSize:17 }}>🔥</div>
                <div className="upd-stat-num amber">7</div>
                <div className="upd-stat-lbl">วันติดต่อ</div>
              </div>
            </div>

            {/* 3. AI Button */}
            <button className="upd-ai-btn" onClick={() => router.push("/dashboard/user/translate")}>
              <div className="upd-ai-inner">
                <div className="upd-ai-icon">
                  <Camera size={24} color="white" style={{ position:'relative', zIndex:1 }} />
                  <div className="upd-scan" />
                </div>
                <div className="upd-ai-texts">
                  <div className="upd-ai-label">เครื่องมือแปลภาษามือ</div>
                  <div className="upd-ai-sub">แตะเพื่อเปิด AI Scanner</div>
                  <div className="upd-ai-chip">
                    <span className="upd-chip-dot" />พร้อมใช้งาน
                  </div>
                </div>
                <div className="upd-ai-arrow">
                  <ChevronRight size={20} color="white" />
                </div>
              </div>
            </button>

            {/* 4. Logout */}
            <div className="upd-logout-wrap">
              <button className="upd-logout-btn" onClick={handleLogout} disabled={isLoggingOut}>
                <div className="upd-logout-inner">
                  <div className="upd-logout-icon">
                    {isLoggingOut
                      ? <Loader2 size={18} color="#e11d48" style={{ animation:'spin 1s linear infinite' }} />
                      : <LogOut size={18} color="#e11d48" />
                    }
                  </div>
                  <div className="upd-logout-texts">
                    <div className="upd-logout-title">
                      {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                    </div>
                    <div className="upd-logout-sub">ล้างข้อมูลเซสชัน &amp; กลับสู่หน้าหลัก</div>
                  </div>
                  <ChevronRight size={16} color="#fca5b0" />
                </div>
              </button>
            </div>

            {/* 5. Footer */}
            <div className="upd-footer">
              <div className="upd-footer-divider">
                <div className="upd-footer-line" />
                <div className="upd-footer-gem" />
                <div className="upd-footer-line" />
              </div>
              <div className="upd-footer-copy">
                © 2026 <strong>SignTranslate</strong> · All rights reserved
              </div>
              <div className="upd-footer-powered">
                Powered by
                <span className="upd-footer-chip">Next.js</span>
                <span style={{ color:'#cbd5e1' }}>×</span>
                <span className="upd-footer-chip">Supabase</span>
                <span style={{ color:'#cbd5e1' }}>×</span>
                <span className="upd-footer-chip">AI</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html:`@keyframes spin{to{transform:rotate(360deg)}}`}} />
    </>
  );
}