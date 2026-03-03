"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/* ─── TYPES ─── */
interface TranslationEntry {
  id: string
  text: string
  timestamp: Date
  isFavorite: boolean
}

interface CameraFeedProps {
  onTranslation: (entry: TranslationEntry) => void
  recentTranslations: TranslationEntry[]
}

interface Landmark { x: number; y: number; z: number }
interface SignResult { sign: string; confidence: number }

/* ─── ICONS ─── */
const IconCamera = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconCameraOff = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconMic = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)
const IconMicOff = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)
const IconSend = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconHand = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
)
const IconVolume = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
)
const IconX = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconFlip = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)

/* ─── SIGN CLASSIFIER (inlined — no external import needed) ─── */
function dist(a: Landmark, b: Landmark) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}
function isExtended(lm: Landmark[], tip: number, pip: number) {
  return lm[tip].y < lm[pip].y
}
function fingers(lm: Landmark[]): boolean[] {
  return [
    lm[4].x < lm[3].x,
    isExtended(lm, 8,  6),
    isExtended(lm, 12, 10),
    isExtended(lm, 16, 14),
    isExtended(lm, 20, 18),
  ]
}
function extCount(f: boolean[]) { return f.filter(Boolean).length }
function wristAngle(lm: Landmark[]) {
  return Math.atan2(-(lm[9].y - lm[0].y), lm[9].x - lm[0].x) * (180 / Math.PI)
}
function tipSpreadAll(lm: Landmark[]) {
  const tips = [lm[4], lm[8], lm[12], lm[16], lm[20]]
  let total = 0, count = 0
  for (let i = 0; i < tips.length; i++)
    for (let j = i + 1; j < tips.length; j++) { total += dist(tips[i], tips[j]); count++ }
  return total / count
}

type Rule = (lm: Landmark[]) => number
const SIGN_RULES: { sign: string; gesture: string; rule: Rule }[] = [
  { sign: "สวัสดี", gesture: "มือเปิด 5 นิ้ว ตั้งตรง",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f.every(Boolean)&&a>45&&a<135?0.92:0 }},
  { sign: "ขอบคุณ", gesture: "4 นิ้วชิดกัน ไม่มีโป้ง",
    rule: lm => { const f=fingers(lm); return !f[0]&&f[1]&&f[2]&&f[3]&&f[4]&&dist(lm[8],lm[20])<0.12?0.88:0 }},
  { sign: "ใช่", gesture: "โป้งชี้ขึ้น กำมือ",
    rule: lm => { const f=fingers(lm); return lm[4].y<lm[3].y&&!f[1]&&!f[2]&&!f[3]&&!f[4]?0.94:0 }},
  { sign: "ไม่", gesture: "นิ้วชี้เดียว แนวนอน",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f[1]&&!f[2]&&!f[3]&&!f[4]&&Math.abs(a)<35?0.90:0 }},
  { sign: "ช่วยด้วย", gesture: "กำมือ โป้งออกข้าง",
    rule: lm => { const f=fingers(lm); return extCount(f)===0&&Math.abs(lm[4].x-lm[0].x)>0.06?0.85:0 }},
  { sign: "ขอโทษ", gesture: "กำมือ อยู่กลางหน้าจอ",
    rule: lm => { const f=fingers(lm),cx=(lm[0].x+lm[9].x)/2; return extCount(f)===0&&cx>0.3&&cx<0.7?0.82:0 }},
  { sign: "สบายดี", gesture: "V shape นิ้วชี้+กลาง",
    rule: lm => { const f=fingers(lm); return !f[0]&&f[1]&&f[2]&&!f[3]&&!f[4]&&dist(lm[8],lm[12])>0.05?0.89:0 }},
  { sign: "ยินดีที่ได้รู้จัก", gesture: "นิ้วชี้ แนวนอนเข้าหาตัว",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f[1]&&!f[2]&&!f[3]&&!f[4]&&Math.abs(a)<25?0.80:0 }},
  { sign: "ฉันรักคุณ", gesture: "ILY โป้ง+ชี้+ก้อย",
    rule: lm => { const f=fingers(lm); return f[0]&&f[1]&&!f[2]&&!f[3]&&f[4]?0.95:0 }},
  { sign: "หิว", gesture: "C-shape นิ้วงอ",
    rule: lm => { const f=fingers(lm); return !f[1]&&!f[2]&&!f[3]&&!f[4]&&lm[4].x>lm[8].x?0.82:0 }},
  { sign: "น้ำ", gesture: "W: ชี้+กลาง+นาง แยกกัน",
    rule: lm => { const f=fingers(lm); return !f[0]&&f[1]&&f[2]&&f[3]&&!f[4]&&dist(lm[8],lm[16])>0.10?0.85:0 }},
  { sign: "ข้าว", gesture: "ปลายนิ้วรวม O-shape",
    rule: lm => { return extCount(fingers(lm))<=1&&tipSpreadAll(lm)<0.08?0.80:0 }},
  { sign: "บ้าน", gesture: "4 นิ้วตั้งตรง ไม่มีโป้ง",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f[1]&&f[2]&&f[3]&&f[4]&&!f[0]&&a>70&&a<110?0.83:0 }},
  { sign: "โรงพยาบาล", gesture: "H: ชี้+กลาง ชิดแนวนอน",
    rule: lm => { const f=fingers(lm); return !f[0]&&f[1]&&f[2]&&!f[3]&&!f[4]&&dist(lm[8],lm[12])<0.04?0.84:0 }},
  { sign: "โรงเรียน", gesture: "มือเปิด เอียง 30",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f.every(Boolean)&&a>20&&a<45?0.81:0 }},
  { sign: "ครอบครัว", gesture: "F: โป้ง+ชี้แตะกัน",
    rule: lm => { const f=fingers(lm); return dist(lm[4],lm[8])<0.04&&f[2]&&f[3]&&f[4]?0.83:0 }},
  { sign: "พ่อ", gesture: "มือเปิด ข้างขวาของหัว",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f.every(Boolean)&&lm[0].x>0.55&&a>50&&a<130?0.80:0 }},
  { sign: "แม่", gesture: "มือเปิด ระดับคาง",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f.every(Boolean)&&lm[0].y>0.55&&a>50&&a<130?0.80:0 }},
  { sign: "ดี", gesture: "โป้งชี้ขึ้น มือสูง",
    rule: lm => { const f=fingers(lm); return lm[4].y<lm[3].y&&!f[1]&&!f[2]&&!f[3]&&!f[4]&&lm[0].y<0.45?0.88:0 }},
  { sign: "ไม่ดี", gesture: "โป้งชี้ลง",
    rule: lm => { const f=fingers(lm); return lm[4].y>lm[3].y&&!f[1]&&!f[2]&&!f[3]&&!f[4]?0.87:0 }},
  { sign: "มา", gesture: "นิ้วชี้ ชี้เข้าหาตัว",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f[1]&&!f[2]&&!f[3]&&!f[4]&&a>120&&a<180?0.82:0 }},
  { sign: "ไป", gesture: "นิ้วชี้ ชี้ขึ้นออกไป",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f[1]&&!f[2]&&!f[3]&&!f[4]&&a>60&&a<120?0.83:0 }},
  { sign: "หยุด", gesture: "ฝ่ามือออก แนวนอน",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f.every(Boolean)&&Math.abs(a)<20?0.87:0 }},
  { sign: "นั่ง", gesture: "ชี้+กลางงอ เหมือนขาที่นั่ง",
    rule: lm => {
      const bentIdx=!isExtended(lm,8,6)&&lm[8].y>lm[5].y
      const bentMid=!isExtended(lm,12,10)&&lm[12].y>lm[9].y
      const f=fingers(lm)
      return bentIdx&&bentMid&&!f[3]&&!f[4]?0.82:0
    }},
  { sign: "กิน", gesture: "ปลายนิ้วรวม ใกล้ปาก",
    rule: lm => { const f=fingers(lm); return dist(lm[4],lm[8])<0.05&&!f[2]&&!f[3]&&!f[4]?0.84:0 }},
  { sign: "นอน", gesture: "ฝ่ามือลง แนวนอน ต่ำ",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f[1]&&f[2]&&f[3]&&f[4]&&!f[0]&&Math.abs(a)<15&&lm[0].y>0.5?0.81:0 }},
  { sign: "เรียน", gesture: "นิ้วกึ่งเปิด กางปานกลาง",
    rule: lm => { return extCount(fingers(lm))>=3&&tipSpreadAll(lm)>0.06&&tipSpreadAll(lm)<0.12?0.79:0 }},
  { sign: "ทำงาน", gesture: "กำมือ แนวนอน",
    rule: lm => { const a=wristAngle(lm); return extCount(fingers(lm))===0&&Math.abs(a)<30?0.81:0 }},
  { sign: "เงิน", gesture: "โป้งถูนิ้วชี้+กลาง",
    rule: lm => { const f=fingers(lm); return dist(lm[4],lm[8])<0.05&&dist(lm[4],lm[12])<0.06&&!f[3]&&!f[4]?0.85:0 }},
  { sign: "เจ็บ", gesture: "นิ้วชี้ ชี้ลงต่ำ",
    rule: lm => { const f=fingers(lm); return f[1]&&!f[2]&&!f[3]&&!f[4]&&lm[8].y>0.5?0.80:0 }},
  { sign: "ยา", gesture: "นิ้วก้อยเดียว",
    rule: lm => { const f=fingers(lm); return !f[0]&&!f[1]&&!f[2]&&!f[3]&&f[4]?0.86:0 }},
  { sign: "โทรศัพท์", gesture: "Y: โป้ง+ก้อย",
    rule: lm => { const f=fingers(lm); return f[0]&&!f[1]&&!f[2]&&!f[3]&&f[4]?0.90:0 }},
  { sign: "รถ", gesture: "กำมือจับพวงมาลัย",
    rule: lm => { return extCount(fingers(lm))===0&&tipSpreadAll(lm)>0.04?0.79:0 }},
  { sign: "เร็ว", gesture: "L-shape โป้ง+ชี้ เอียงหน้า",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f[0]&&f[1]&&!f[2]&&!f[3]&&!f[4]&&a>30&&a<80?0.82:0 }},
  { sign: "ช้า", gesture: "มือเปิด ต่ำ มุมต่ำ",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f.every(Boolean)&&Math.abs(a)<25&&lm[0].y>0.5?0.80:0 }},
  { sign: "ร้อน", gesture: "นิ้วกางคล้าวเปลว ใกล้หน้า",
    rule: lm => { const f=fingers(lm); return f[1]&&f[2]&&f[3]&&f[4]&&tipSpreadAll(lm)>0.08&&lm[0].y<0.4?0.81:0 }},
  { sign: "เย็น", gesture: "กำมือแน่น",
    rule: lm => { return extCount(fingers(lm))===0&&tipSpreadAll(lm)<0.05?0.80:0 }},
  { sign: "ใหญ่", gesture: "มือเปิดกางสุด",
    rule: lm => { const f=fingers(lm); return f.every(Boolean)&&tipSpreadAll(lm)>0.14?0.85:0 }},
  { sign: "เล็ก", gesture: "Pinch โป้ง+ชี้ใกล้กันมาก",
    rule: lm => { const f=fingers(lm); return dist(lm[4],lm[8])<0.03&&!f[2]&&!f[3]&&!f[4]?0.86:0 }},
  { sign: "เข้าใจ", gesture: "นิ้วชี้แตะหน้าผาก",
    rule: lm => { const f=fingers(lm),a=wristAngle(lm); return f[1]&&!f[2]&&!f[3]&&!f[4]&&a>60&&a<120&&lm[0].y<0.35?0.87:0 }},
]

function classifyHands(multiHandLandmarks: Landmark[][]): SignResult | null {
  let best: SignResult | null = null
  for (const lm of multiHandLandmarks) {
    if (lm.length < 21) continue
    for (const { sign, rule } of SIGN_RULES) {
      const confidence = rule(lm)
      if (confidence >= 0.75 && (!best || confidence > best.confidence))
        best = { sign, confidence }
    }
  }
  return best
}

const SIGN_GIFS: Record<string, string> = {
  default: "https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif",
  hello:   "https://media.giphy.com/media/26BRzQS5HXcEWx7du/giphy.gif",
  thanks:  "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
  yes:     "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
}

export function CameraFeed({ onTranslation, recentTranslations }: CameraFeedProps) {
  const videoRef     = useRef<HTMLVideoElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const streamRef    = useRef<MediaStream | null>(null)
  const mpRef        = useRef<{ hands: any; cam: any } | null>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const lastDetRef   = useRef(0)

  const [cameraOn,     setCameraOn]     = useState(false)
  const [handsActive,  setHandsActive]  = useState(false)
  const [translation,  setTranslation]  = useState("")
  const [confidence,   setConfidence]   = useState(0)
  const [isAnalyzing,  setIsAnalyzing]  = useState(false)
  const [isSpeaking,   setIsSpeaking]   = useState(false)
  const [facingMode,   setFacingMode]   = useState<"user"|"environment">("user")
  const [replyText,    setReplyText]    = useState("")
  const [isRecording,  setIsRecording]  = useState(false)
  const [replyGif,     setReplyGif]     = useState<string|null>(null)
  const [showGifPanel, setShowGifPanel] = useState(false)
  const [gifCaption,   setGifCaption]   = useState("")
  const [history,      setHistory]      = useState<{id:number;from:string;text:string}[]>([])
  const [showGuide,    setShowGuide]    = useState(false)
  const mediaRecRef  = useRef<any>(null)

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = "th-TH"; u.rate = 0.9
    setIsSpeaking(true)
    u.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(u)
  }, [])

  const loadScript = (src: string): Promise<void> => new Promise(res => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return }
    const s = document.createElement("script"); s.src = src; s.async = true; s.onload = () => res()
    document.body.appendChild(s)
  })

  const startMP = useCallback(async () => {
    await Promise.all([
      "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
      "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
      "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
    ].map(loadScript))
    if (!videoRef.current || !canvasRef.current) return

    const hands = new (window as any).Hands({
      locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
    })
    hands.setOptions({ maxNumHands:2, modelComplexity:1, minDetectionConfidence:0.55, minTrackingConfidence:0.5 })

    hands.onResults((results: any) => {
      const canvas = canvasRef.current; if (!canvas) return
      const ctx = canvas.getContext("2d")!
      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

      if (results.multiHandLandmarks?.length) {
        for (const lm of results.multiHandLandmarks) {
          const W = canvas.width, H = canvas.height
          // connections
          const CONNECTIONS = (window as any).HAND_CONNECTIONS
          ctx.strokeStyle = "rgba(96,165,250,0.72)"; ctx.lineWidth = 2.5
          for (const [a, b] of CONNECTIONS) {
            ctx.beginPath()
            ctx.moveTo(lm[a].x*W, lm[a].y*H)
            ctx.lineTo(lm[b].x*W, lm[b].y*H)
            ctx.stroke()
          }
          // joint dots
          for (const pt of lm) {
            ctx.beginPath(); ctx.arc(pt.x*W, pt.y*H, 5, 0, Math.PI*2)
            ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fill()
            ctx.strokeStyle = "rgba(59,130,246,0.9)"; ctx.lineWidth = 2; ctx.stroke()
          }
          // fingertip rings
          for (const idx of [4,8,12,16,20]) {
            ctx.beginPath(); ctx.arc(lm[idx].x*W, lm[idx].y*H, 10, 0, Math.PI*2)
            ctx.strokeStyle = "rgba(147,197,253,0.65)"; ctx.lineWidth = 2.5; ctx.stroke()
            ctx.beginPath(); ctx.arc(lm[idx].x*W, lm[idx].y*H, 5.5, 0, Math.PI*2)
            ctx.fillStyle = "rgba(59,130,246,1)"; ctx.fill()
          }
        }
        setHandsActive(true)

        // ── REAL CLASSIFIER ──
        const now = Date.now()
        if (now - lastDetRef.current > 1200) {
          const result = classifyHands(results.multiHandLandmarks as Landmark[][])
          if (result) {
            lastDetRef.current = now
            setIsAnalyzing(true)
            setTimeout(() => {
              setTranslation(result.sign)
              setConfidence(Math.round(result.confidence * 100))
              speak(result.sign)
              onTranslation({ id: Date.now().toString(), text: result.sign, timestamp: new Date(), isFavorite: false })
              setHistory(h => [...h, { id: Date.now(), from: "sign", text: result.sign }])
              setIsAnalyzing(false)
            }, 400)
          }
        }
      } else {
        setHandsActive(false)
      }
      ctx.restore()
    })

    const cam = new (window as any).Camera(videoRef.current, {
      onFrame: async () => { await hands.send({ image: videoRef.current! }) },
      width: 1280, height: 720,
    })
    cam.start()
    mpRef.current = { hands, cam }
  }, [speak, onTranslation])

  const startCamera = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && window.speechSynthesis)
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(""))
      setCameraOn(true)
      await startMP()
    } catch(e) { console.warn("camera denied", e) }
  }, [startMP])

  const stopCamera = useCallback(() => {
    try { mpRef.current?.cam?.stop() } catch {}
    mpRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraOn(false); setHandsActive(false); setTranslation(""); setConfidence(0)
  }, [])

  const sendReply = useCallback((text: string) => {
    if (!text.trim()) return
    const lower = text.toLowerCase()
    let gif = SIGN_GIFS.default
    if (lower.includes("สวัสดี")||lower.includes("hello")) gif = SIGN_GIFS.hello
    else if (lower.includes("ขอบคุณ")||lower.includes("thank")) gif = SIGN_GIFS.thanks
    else if (lower.includes("ใช่")||lower.includes("yes")) gif = SIGN_GIFS.yes
    setReplyGif(gif); setGifCaption(text); setShowGifPanel(true)
    setHistory(h => [...h, { id: Date.now(), from: "user", text }])
    setReplyText("")
  }, [])

  const toggleMic = useCallback(() => {
    if (isRecording) { mediaRecRef.current?.stop(); setIsRecording(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("เบราว์เซอร์นี้ไม่รองรับ กรุณาพิมพ์แทน"); return }
    const rec = new SR(); rec.lang="th-TH"; rec.continuous=false; rec.interimResults=false
    rec.onresult = (e: any) => { const txt=e.results[0][0].transcript; setReplyText(txt); sendReply(txt) }
    rec.onerror = () => setIsRecording(false)
    rec.onend   = () => setIsRecording(false)
    rec.start(); mediaRecRef.current=rec; setIsRecording(true)
  }, [isRecording, sendReply])

  useEffect(() => () => stopCamera(), [stopCamera])

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* CAMERA */}
      <div className="rounded-3xl overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_12px_48px_rgba(59,130,246,0.12)]">
        <div className="m-2.5 relative rounded-[22px] overflow-hidden bg-gradient-to-br from-blue-100 via-sky-100 to-indigo-100" style={{aspectRatio:"16/9"}}>
          <video ref={videoRef} autoPlay playsInline muted className="hidden"/>
          <canvas ref={canvasRef} width={1280} height={720}
            className={`absolute inset-0 w-full h-full object-cover rounded-[22px] ${!cameraOn?"hidden":""}`}
            style={{transform:facingMode==="user"?"scaleX(-1)":"none"}}/>

          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg shadow-blue-200/50 text-blue-400">
                <IconCamera size={38}/>
              </div>
              <button onClick={startCamera}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-bold text-base
                  bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_6px_24px_rgba(59,130,246,0.45)]
                  hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(59,130,246,0.55)] active:scale-[0.97] transition-all duration-200">
                <IconCamera size={20}/>เปิดกล้องเพื่อเริ่มแปลภาษามือ
              </button>
              <p className="text-sm text-slate-400 font-medium">AI จะตรวจจับมือและแปลท่าทางให้อัตโนมัติ</p>
            </div>
          )}

          {cameraOn && (<>
            <div className="absolute left-0 right-0 h-0.5 pointer-events-none animate-[scanline_3s_linear_infinite]"
              style={{background:"linear-gradient(90deg,transparent,rgba(59,130,246,0.9) 50%,transparent)",boxShadow:"0 0 22px rgba(59,130,246,0.7)"}}/>
            {["top-3.5 left-3.5 border-t-[3px] border-l-[3px] rounded-tl-xl",
              "top-3.5 right-3.5 border-t-[3px] border-r-[3px] rounded-tr-xl",
              "bottom-3.5 left-3.5 border-b-[3px] border-l-[3px] rounded-bl-xl",
              "bottom-3.5 right-3.5 border-b-[3px] border-r-[3px] rounded-br-xl",
            ].map((cls,i)=>(<div key={i} className={`absolute w-7 h-7 border-blue-500/70 pointer-events-none ${cls}`}/>))}

            {isAnalyzing && (
              <div className="absolute top-4 left-1/2 flex items-center gap-2 px-5 py-2 rounded-full text-white text-xs font-bold backdrop-blur-xl shadow-[0_6px_24px_rgba(59,130,246,0.5)] whitespace-nowrap animate-[floatpill_2s_ease-in-out_infinite]"
                style={{transform:"translateX(-50%)",background:"linear-gradient(135deg,rgba(30,58,138,0.93),rgba(37,99,235,0.93))"}}>
                <span className="w-2 h-2 rounded-full bg-blue-200 animate-pulse"/>AI กำลังวิเคราะห์...
              </div>
            )}
            {handsActive && !isAnalyzing && (
              <div className="absolute top-4 left-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/88 backdrop-blur-md text-blue-600 text-xs font-bold shadow-[0_3px_14px_rgba(0,0,0,0.08)] whitespace-nowrap animate-[floatpill_2.5s_ease-in-out_infinite]"
                style={{transform:"translateX(-50%)"}}>
                <IconHand size={13}/>ตรวจพบมือ · กำลังอ่าน
              </div>
            )}

            <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2">
              <button onClick={()=>{const nm=facingMode==="user"?"environment":"user";setFacingMode(nm);stopCamera();setTimeout(startCamera,300)}}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/88 backdrop-blur-md border border-white/80 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm">
                <IconFlip size={13}/>สลับ
              </button>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/88 backdrop-blur-md text-xs font-bold text-blue-900 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.9)]"/>LIVE
              </div>
            </div>
            <div className="absolute bottom-3.5 left-3.5">
              <button onClick={stopCamera}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-400 to-red-500 shadow-[0_4px_16px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)] transition-all">
                <IconCameraOff size={13}/>ปิดกล้อง
              </button>
            </div>
          </>)}
        </div>
      </div>

      {/* RESULT */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_12px_48px_rgba(59,130,246,0.10)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full transition-all duration-500 ${translation?"bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)] animate-pulse":"bg-slate-300"}`}/>
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">ผลการแปลภาษามือ</span>
          </div>
          {confidence>0 && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/50">
              ✦ {confidence}% แม่นยำ
            </span>
          )}
        </div>
        <div className={`min-h-[100px] rounded-2xl flex items-center justify-center p-6 transition-all duration-500
          ${translation?"bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]":"bg-slate-50 border border-slate-100"}`}>
          {translation?(
            <p className="text-center font-black tracking-tight animate-[fadeUp_0.4s_cubic-bezier(.22,1,.36,1)_both]"
              style={{fontSize:"clamp(28px,5vw,46px)",background:"linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#6366f1 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              {translation}
            </p>
          ):(
            <div className="flex flex-col items-center gap-2.5 text-center">
              <span className="text-slate-200"><IconHand size={36}/></span>
              <p className="text-sm text-slate-400 font-medium">{cameraOn?"ทำท่าทางภาษามือให้กล้องเห็น":"เปิดกล้องเพื่อเริ่มต้น"}</p>
            </div>
          )}
        </div>
        {translation && (
          <div className="mt-4 flex gap-3 flex-wrap">
            <button onClick={()=>speak(translation)} disabled={isSpeaking}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_16px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 disabled:opacity-50 active:scale-[0.97] transition-all duration-200">
              <IconVolume size={15}/>{isSpeaking?"กำลังพูด...":"ฟังเสียง"}
            </button>
          </div>
        )}
      </div>

      {/* SIGN GUIDE TOGGLE */}
      <button onClick={()=>setShowGuide(v=>!v)}
        className="w-full py-3 rounded-2xl text-sm font-bold text-blue-600 bg-blue-50/80 border border-blue-100 hover:bg-blue-100 transition-all">
        {showGuide?"▲ ซ่อนคู่มือท่าภาษามือ":"▼ ดูคู่มือท่าภาษามือทั้ง 40 ท่า"}
      </button>

      {showGuide && (
        <div className="rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_12px_48px_rgba(59,130,246,0.10)] p-5">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-4">คู่มือท่าภาษามือ · 40 ท่า</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SIGN_RULES.map((s,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100/60">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 flex-shrink-0">
                  {String(i+1).padStart(2,"0")}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-blue-900 truncate">{s.sign}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.gesture}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPLY */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_12px_48px_rgba(59,130,246,0.10)] p-6">
        <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-1">ตอบโต้กลับ</p>
        <p className="text-xs text-slate-500 font-medium mb-4">พิมพ์หรืออัดเสียง · จะแสดงเป็น GIF ภาษามือ</p>
        <div className="flex items-center gap-2.5 bg-slate-50/90 border border-slate-200/60 rounded-full px-5 py-2">
          <input ref={inputRef} type="text" value={replyText}
            onChange={e=>setReplyText(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sendReply(replyText)}
            placeholder="พิมพ์ข้อความที่ต้องการตอบ..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 font-medium placeholder:text-slate-400"/>
          <button onClick={toggleMic}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200
              ${isRecording?"bg-gradient-to-br from-red-400 to-red-500 text-white shadow-[0_4px_14px_rgba(239,68,68,0.45)]"
              :"bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500 shadow-sm"}`}>
            {isRecording&&<span className="absolute inset-[-6px] rounded-full border-2 border-red-400/40 animate-[ripple_1s_infinite]"/>}
            {isRecording?<IconMicOff size={16}/>:<IconMic size={16}/>}
          </button>
          <button onClick={()=>sendReply(replyText)} disabled={!replyText.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)] disabled:opacity-40 active:scale-[0.95] transition-all duration-200">
            <IconSend size={15}/>
          </button>
        </div>
        {isRecording&&(
          <div className="flex items-center gap-2 mt-3 pl-2">
            <div className="flex items-end gap-0.5 h-5">
              {[0,"0.15s","0.3s"].map((d,i)=>(
                <div key={i} className="w-1 rounded-full bg-red-400" style={{animation:`wavebar 0.8s ${d} ease-in-out infinite`,height:16}}/>
              ))}
            </div>
            <span className="text-xs text-red-500 font-semibold">กำลังฟัง...</span>
          </div>
        )}
      </div>

      {/* GIF PANEL */}
      {showGifPanel&&(
        <div className="relative rounded-3xl p-6 border shadow-[0_12px_48px_rgba(59,130,246,0.18)] bg-gradient-to-br from-blue-50/95 to-sky-50/95 border-blue-200/50 animate-[fadeUp_0.4s_cubic-bezier(.22,1,.36,1)_both]">
          <button onClick={()=>setShowGifPanel(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm transition-all">
            <IconX size={14}/>
          </button>
          <p className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase mb-4">ภาษามือ · หันหน้าจอให้ผู้พิการทางการได้ยิน</p>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(59,130,246,0.22)] max-w-sm w-full bg-white">
              <img src={replyGif!} alt="sign language" className="w-full block"
                onError={(e)=>{(e.target as HTMLImageElement).src=SIGN_GIFS.default}}/>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-white/85 border border-blue-100 text-center max-w-sm w-full">
              <p className="text-base font-bold text-blue-700">"{gifCaption}"</p>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {history.length>0&&(
        <div className="rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_12px_48px_rgba(59,130,246,0.10)] p-6">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-4">ประวัติการสนทนา</p>
          <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
            {history.slice().reverse().map(h=>(
              <div key={h.id} className={`flex gap-2.5 items-start ${h.from==="user"?"flex-row-reverse":""}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                  ${h.from==="sign"?"bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600":"bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_3px_10px_rgba(59,130,246,0.3)]"}`}>
                  {h.from==="sign"?<IconHand size={14}/>:<IconMic size={14}/>}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm font-semibold text-blue-900 max-w-[75%] border
                  ${h.from==="sign"?"bg-blue-50 border-blue-100":"bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50"}`}>
                  {h.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanline{0%{top:0%;opacity:0}6%{opacity:1}94%{opacity:1}100%{top:100%;opacity:0}}
        @keyframes floatpill{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-5px)}}
        @keyframes ripple{0%{transform:scale(0.9);opacity:1}100%{transform:scale(2.4);opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wavebar{0%,100%{height:6px}50%{height:18px}}
      `}</style>
    </div>
  )
}

export default CameraFeed