"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const SIGNS = [
  { id:  1, sign: "สวัสดี",            gesture: "มือเปิด 5 นิ้ว ตั้งตรง",           category: "ทักทาย",          emoji: "✋" },
  { id:  2, sign: "ขอบคุณ",            gesture: "4 นิ้วชิดกัน ไม่มีโป้ง",          category: "ทักทาย",          emoji: "🙏" },
  { id:  3, sign: "ขอโทษ",             gesture: "กำมือ วนกลางอก",                   category: "ทักทาย",          emoji: "✊" },
  { id:  4, sign: "ยินดีที่ได้รู้จัก", gesture: "นิ้วชี้แนวนอนเข้าหาตัว",          category: "ทักทาย",          emoji: "👋" },
  { id:  5, sign: "สบายดี",            gesture: "V shape นิ้วชี้+กลาง",             category: "ทักทาย",          emoji: "✌️" },
  { id:  6, sign: "ฉันรักคุณ",         gesture: "ILY โป้ง+ชี้+ก้อย",               category: "ทักทาย",          emoji: "🤟" },
  { id:  7, sign: "ใช่",               gesture: "โป้งชี้ขึ้น กำมือ",                category: "พื้นฐาน",         emoji: "👍" },
  { id:  8, sign: "ไม่",               gesture: "นิ้วชี้เดียว แนวนอน",               category: "พื้นฐาน",         emoji: "☝️" },
  { id:  9, sign: "ดี",                gesture: "โป้งชี้ขึ้น มือสูง",               category: "พื้นฐาน",         emoji: "👍" },
  { id: 10, sign: "ไม่ดี",             gesture: "โป้งชี้ลง",                        category: "พื้นฐาน",         emoji: "👎" },
  { id: 11, sign: "มา",                gesture: "นิ้วชี้ ชี้เข้าหาตัว",             category: "พื้นฐาน",         emoji: "👈" },
  { id: 12, sign: "ไป",                gesture: "นิ้วชี้ ชี้ขึ้นออกไป",             category: "พื้นฐาน",         emoji: "👉" },
  { id: 13, sign: "หยุด",              gesture: "ฝ่ามือออก แนวนอน",                 category: "พื้นฐาน",         emoji: "🤚" },
  { id: 14, sign: "เข้าใจ",            gesture: "นิ้วชี้แตะหน้าผาก",               category: "พื้นฐาน",         emoji: "👆" },
  { id: 15, sign: "เร็ว",              gesture: "L-shape โป้ง+ชี้ เอียงหน้า",      category: "พื้นฐาน",         emoji: "⚡" },
  { id: 16, sign: "ช้า",               gesture: "มือเปิด ต่ำ มุมต่ำ",               category: "พื้นฐาน",         emoji: "🐢" },
  { id: 17, sign: "ช่วยด้วย",          gesture: "กำมือ โป้งออกข้าง",               category: "ฉุกเฉิน",         emoji: "🆘" },
  { id: 18, sign: "เจ็บ",              gesture: "นิ้วชี้ ชี้ลงต่ำ",                category: "ฉุกเฉิน",         emoji: "🤕" },
  { id: 19, sign: "ยา",                gesture: "นิ้วก้อยเดียว",                    category: "ฉุกเฉิน",         emoji: "💊" },
  { id: 20, sign: "โรงพยาบาล",         gesture: "H: ชี้+กลาง ชิดแนวนอน",           category: "ฉุกเฉิน",         emoji: "🏥" },
  { id: 21, sign: "หิว",               gesture: "C-shape นิ้วงอ",                   category: "ชีวิตประจำวัน",   emoji: "😋" },
  { id: 22, sign: "น้ำ",               gesture: "W: ชี้+กลาง+นาง แยกกัน",          category: "ชีวิตประจำวัน",   emoji: "💧" },
  { id: 23, sign: "ข้าว",              gesture: "ปลายนิ้วรวม O-shape",              category: "ชีวิตประจำวัน",   emoji: "🍚" },
  { id: 24, sign: "กิน",               gesture: "ปลายนิ้วรวม ใกล้ปาก",              category: "ชีวิตประจำวัน",   emoji: "🍽️" },
  { id: 25, sign: "นอน",               gesture: "ฝ่ามือลง แนวนอน ต่ำ",              category: "ชีวิตประจำวัน",   emoji: "😴" },
  { id: 26, sign: "นั่ง",              gesture: "ชี้+กลางงอ เหมือนขาที่นั่ง",      category: "ชีวิตประจำวัน",   emoji: "🪑" },
  { id: 27, sign: "โทรศัพท์",          gesture: "Y: โป้ง+ก้อย (call me)",           category: "ชีวิตประจำวัน",   emoji: "📱" },
  { id: 28, sign: "รถ",                gesture: "กำมือจับพวงมาลัย",                 category: "ชีวิตประจำวัน",   emoji: "🚗" },
  { id: 29, sign: "เงิน",              gesture: "โป้งถูนิ้วชี้+กลาง",              category: "ชีวิตประจำวัน",   emoji: "💰" },
  { id: 30, sign: "ร้อน",              gesture: "นิ้วกางคล้าวเปลว ใกล้หน้า",       category: "ชีวิตประจำวัน",   emoji: "🔥" },
  { id: 31, sign: "เย็น",              gesture: "กำมือแน่น",                        category: "ชีวิตประจำวัน",   emoji: "❄️" },
  { id: 32, sign: "ใหญ่",              gesture: "มือเปิดกางสุด",                    category: "คำคุณศัพท์",      emoji: "🔴" },
  { id: 33, sign: "เล็ก",              gesture: "Pinch โป้ง+ชี้ใกล้กันมาก",         category: "คำคุณศัพท์",      emoji: "🔵" },
  { id: 34, sign: "พ่อ",               gesture: "มือเปิด ข้างขวาของหัว",            category: "ครอบครัว",        emoji: "👨" },
  { id: 35, sign: "แม่",               gesture: "มือเปิด ระดับคาง",                 category: "ครอบครัว",        emoji: "👩" },
  { id: 36, sign: "ครอบครัว",          gesture: "F: โป้ง+ชี้แตะกัน นิ้วอื่นเปิด",  category: "ครอบครัว",        emoji: "👨‍👩‍👧" },
  { id: 37, sign: "บ้าน",              gesture: "4 นิ้วตั้งตรง ไม่มีโป้ง",          category: "สถานที่",         emoji: "🏠" },
  { id: 38, sign: "โรงเรียน",          gesture: "มือเปิด เอียง 30°",                category: "สถานที่",         emoji: "🏫" },
  { id: 39, sign: "เรียน",             gesture: "นิ้วกึ่งเปิด กางปานกลาง",          category: "การศึกษา",        emoji: "📚" },
  { id: 40, sign: "ทำงาน",             gesture: "กำมือ แนวนอน",                     category: "การศึกษา",        emoji: "💼" },
]

const CATEGORIES = ["ทั้งหมด", ...Array.from(new Set(SIGNS.map(s => s.category)))]

const CAT_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  "ทักทาย":          { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  "พื้นฐาน":         { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
  "ฉุกเฉิน":         { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3" },
  "ชีวิตประจำวัน":   { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
  "คำคุณศัพท์":      { bg: "#faf5ff", text: "#7c3aed", border: "#ddd6fe" },
  "ครอบครัว":        { bg: "#fdf4ff", text: "#a21caf", border: "#f0abfc" },
  "สถานที่":         { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" },
  "การศึกษา":        { bg: "#f0f9ff", text: "#0284c7", border: "#bae6fd" },
}
  export default function VocabPage() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด")
  const [search, setSearch] = useState("")
  const [flipped, setFlipped] = useState<number | null>(null)
  const [learned, setLearned] = useState<Set<number>>(new Set())

  // --- วางตรงนี้ครับ (หลัง State ทั้งหมด) ---
  useEffect(() => {
    const saved = localStorage.getItem('learned_signs');
    if (saved) {
      try {
        setLearned(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Error loading learned signs", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('learned_signs', JSON.stringify(Array.from(learned)));
  }, [learned]);
  // ------------------------------------

  const filtered = SIGNS.filter(s => {
    const matchCat = activeCategory === "ทั้งหมด" || s.category === activeCategory
    const matchSearch = s.sign.includes(search) || s.gesture.includes(search) || s.category.includes(search)
    return matchCat && matchSearch
  })

  const toggleLearned = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setLearned(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const progress = Math.round((learned.size / SIGNS.length) * 100)

  return (
    <div className="min-h-screen pb-16"
      style={{ background: "linear-gradient(160deg,#e8f4ff 0%,#f5faff 45%,#eaf0ff 100%)", fontFamily: "'Outfit',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.2);border-radius:99px}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%)",
        padding: "44px 24px 80px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,0.06)" }}/>
        <div style={{ position:"absolute",bottom:-40,left:-40,width:150,height:150,borderRadius:"50%",background:"rgba(255,255,255,0.04)" }}/>

        <div className="max-w-2xl mx-auto" style={{ position:"relative",zIndex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:24 }}>
            <div style={{
              width:50,height:50,borderRadius:16,
              background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",
              border:"1px solid rgba(255,255,255,0.22)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,
            }}>🤟</div>
            <div>
              <h1 style={{ fontWeight:900,fontSize:22,color:"white",letterSpacing:"-0.02em",margin:0,lineHeight:1.2 }}>
                คลังคำศัพท์ภาษามือ
              </h1>
              <p style={{ fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:500,margin:0 }}>
                Thai Sign Language · 40 ท่า
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            background:"rgba(255,255,255,0.12)",backdropFilter:"blur(12px)",
            borderRadius:18,padding:"14px 18px",border:"1px solid rgba(255,255,255,0.18)",
          }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <span style={{ fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.8)" }}>ความคืบหน้า</span>
              <span style={{ fontSize:13,fontWeight:900,color:"white" }}>
                {learned.size} / {SIGNS.length} ท่า · {progress}%
              </span>
            </div>
            <div style={{ height:8,background:"rgba(255,255,255,0.15)",borderRadius:99,overflow:"hidden" }}>
              <div style={{
                height:"100%",borderRadius:99,width:`${progress}%`,
                background:"linear-gradient(90deg,#60a5fa,#a5f3fc)",
                boxShadow:"0 0 10px rgba(96,165,250,0.5)",
                transition:"width 0.6s cubic-bezier(.22,1,.36,1)",
              }}/>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4" style={{ marginTop:-48,position:"relative",zIndex:10 }}>

        {/* ── SEARCH ── */}
        <div className="fu" style={{
          background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",
          borderRadius:18,border:"1.5px solid rgba(255,255,255,0.75)",
          boxShadow:"0 8px 32px rgba(59,130,246,0.12)",
          display:"flex",alignItems:"center",gap:10,padding:"4px 14px",marginBottom:14,
        }}>
          <span style={{ fontSize:18,flexShrink:0 }}>🔍</span>
          <input
            type="text" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="ค้นหาคำศัพท์..."
            style={{
              flex:1,background:"transparent",border:"none",outline:"none",
              fontSize:14,fontWeight:500,color:"#1e293b",padding:"12px 0",
              fontFamily:"'Outfit',sans-serif",
            }}
          />
          {search && (
            <button onClick={()=>setSearch("")}
              style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:16,padding:4 }}>
              ✕
            </button>
          )}
        </div>

        {/* ── CATEGORY TABS ── */}
        <div className="fu" style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:16 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={()=>setActiveCategory(cat)}
              style={{
                flexShrink:0,padding:"7px 16px",borderRadius:999,fontSize:12,fontWeight:700,
                cursor:"pointer",transition:"all 0.2s ease",fontFamily:"'Outfit',sans-serif",
                background: activeCategory===cat ? "linear-gradient(135deg,#3b82f6,#1d4ed8)" : "rgba(255,255,255,0.85)",
                color: activeCategory===cat ? "white" : "#64748b",
                border: activeCategory===cat ? "none" : "1.5px solid rgba(203,213,225,0.5)",
                boxShadow: activeCategory===cat ? "0 4px 16px rgba(59,130,246,0.4)" : "0 1px 4px rgba(0,0,0,0.05)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── STATS ROW ── */}
        <div className="fu" style={{ display:"flex",gap:10,marginBottom:18 }}>
          {[
            { label:"ทั้งหมด", value:SIGNS.length,           color:"#3b82f6" },
            { label:"เรียนแล้ว", value:learned.size,         color:"#10b981" },
            { label:"คงเหลือ", value:SIGNS.length-learned.size, color:"#f59e0b" },
          ].map(s=>(
            <div key={s.label} style={{
              flex:1,background:"rgba(255,255,255,0.82)",backdropFilter:"blur(16px)",
              borderRadius:16,padding:"12px 0",textAlign:"center",
              border:"1.5px solid rgba(255,255,255,0.72)",
              boxShadow:"0 4px 16px rgba(59,130,246,0.08)",
            }}>
              <div style={{ fontSize:22,fontWeight:900,color:s.color,lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:10,fontWeight:700,color:"#94a3b8",marginTop:4,textTransform:"uppercase",letterSpacing:"0.1em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── CARDS GRID ── */}
        {filtered.length===0 ? (
          <div style={{ textAlign:"center",padding:"48px 0",color:"#94a3b8" }}>
            <div style={{ fontSize:40,marginBottom:12 }}>🔍</div>
            <p style={{ fontWeight:600 }}>ไม่พบคำที่ค้นหา</p>
          </div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12 }}>
            {filtered.map((s,i) => {
              const isFlipped  = flipped === s.id
              const isLearned  = learned.has(s.id)
              const cs = CAT_STYLE[s.category] ?? { bg:"#f8fafc", text:"#64748b", border:"#e2e8f0" }
              return (
                <div key={s.id} className="fu"
                  style={{ animationDelay:`${Math.min(i,18)*0.03}s`, cursor:"pointer" }}
                  onClick={()=>setFlipped(isFlipped ? null : s.id)}
                >
                  <div style={{
                    background: isLearned
                      ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                      : "rgba(255,255,255,0.88)",
                    backdropFilter:"blur(20px)",
                    border: isLearned ? "1.5px solid #86efac" : "1.5px solid rgba(255,255,255,0.72)",
                    borderRadius:22,padding:16,
                    boxShadow: isFlipped
                      ? "0 12px 40px rgba(59,130,246,0.22)"
                      : isLearned
                        ? "0 4px 16px rgba(16,185,129,0.15)"
                        : "0 4px 16px rgba(59,130,246,0.08)",
                    transition:"all 0.25s ease",
                    transform: isFlipped ? "translateY(-3px)" : "none",
                    minHeight:148,display:"flex",flexDirection:"column",
                  }}>

                    {/* top row */}
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                      <span style={{
                        fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:999,
                        background:cs.bg,color:cs.text,border:`1px solid ${cs.border}`,
                        letterSpacing:"0.05em",whiteSpace:"nowrap",
                      }}>{s.category}</span>
                      <button onClick={e=>toggleLearned(s.id,e)}
                        style={{
                          width:26,height:26,borderRadius:"50%",border:"none",cursor:"pointer",flexShrink:0,
                          background: isLearned ? "#10b981" : "rgba(203,213,225,0.35)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:14,fontWeight:900,color: isLearned ? "white" : "#94a3b8",
                          boxShadow: isLearned ? "0 2px 8px rgba(16,185,129,0.4)" : "none",
                          transition:"all 0.2s",
                        }}>
                        {isLearned ? "✓" : "○"}
                      </button>
                    </div>

                    {/* emoji + word */}
                    <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,textAlign:"center" }}>
                      <span style={{ fontSize:32,lineHeight:1 }}>{s.emoji}</span>
                      <p style={{ fontSize:17,fontWeight:900,color:"#1e3a8a",letterSpacing:"-0.02em",margin:0 }}>
                        {s.sign}
                      </p>
                    </div>

                    {/* gesture hint */}
                    <div style={{
                      marginTop:10,padding:"8px 10px",borderRadius:12,
                      background: isFlipped ? "linear-gradient(135deg,#eff6ff,#dbeafe)" : "rgba(241,245,249,0.5)",
                      border: isFlipped ? "1px solid rgba(147,197,253,0.4)" : "1px solid transparent",
                      transition:"all 0.3s ease",
                    }}>
                      <p style={{ fontSize:11,fontWeight:600,textAlign:"center",lineHeight:1.45,margin:0,
                        color: isFlipped ? "#2563eb" : "#94a3b8" }}>
                        {isFlipped ? s.gesture : "แตะเพื่อดูวิธีทำ"}
                      </p>
                    </div>

                    {/* id */}
                    <div style={{ textAlign:"right",marginTop:5,fontSize:9,fontWeight:700,color:"#cbd5e1",letterSpacing:"0.1em" }}>
                      #{String(s.id).padStart(2,"0")}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* reset */}
        {learned.size>0 && (
          <div style={{ textAlign:"center",marginTop:24 }}>
            <button onClick={()=>setLearned(new Set())}
              style={{
                background:"rgba(255,255,255,0.82)",border:"1.5px solid rgba(203,213,225,0.5)",
                borderRadius:999,padding:"8px 22px",fontSize:12,fontWeight:700,color:"#64748b",
                cursor:"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
              }}>
              รีเซ็ตความคืบหน้า
            </button>
          </div>
        )}

      </div>
    </div>
  )
}