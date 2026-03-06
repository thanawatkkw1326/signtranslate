"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { BookMarked } from "lucide-react"

// ── MediaPipe Holistic (npm install @mediapipe/holistic @mediapipe/camera_utils) ──
import type { Holistic, Results as HolisticResults } from "@mediapipe/holistic"
import type { Camera } from "@mediapipe/camera_utils"

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
interface SignResult  { sign: string; confidence: number }

/* ─── SVG ICONS ─── */
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
const IconPlay = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)

/* ══════════════════════════════════════════════════════════════════
   CLASSIFIER  —  Hand + Face + Pose (via Holistic)
   ══════════════════════════════════════════════════════════════════ */

/* ── hand geometry ── */
function dist(a: Landmark, b: Landmark) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}
function isExtended(lm: Landmark[], tip: number, pip: number) {
  return lm[tip].y < lm[pip].y
}
function fingers(lm: Landmark[]): boolean[] {
  const thumbOut = dist(lm[4], lm[0]) > dist(lm[3], lm[0])
  return [
    thumbOut,
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
function palmSize(lm: Landmark[]) { return dist(lm[0], lm[9]) }
function handY(lm: Landmark[])    { return (lm[0].y + lm[9].y) / 2 }
function pinchNorm(lm: Landmark[], a: number, b: number) {
  return dist(lm[a], lm[b]) / (palmSize(lm) + 0.001)
}
function handRaised(lm: Landmark[]) { return lm[8].y < lm[0].y - 0.05 }
function bentDeep(lm: Landmark[], tip: number) { return lm[tip].y > lm[0].y }

/* ── handedness normalization ── */
function normalizeLandmarks(lm: Landmark[], isLeft: boolean): Landmark[] {
  if (!isLeft) return lm
  return lm.map(pt => ({ ...pt, x: 1 - pt.x }))
}

/* ── face helpers (Holistic — 468 face landmarks)
   mouth upper-lip 13, lower-lip 14, face-height nose 1 → chin 152
   left eyebrow inner 107, right eyebrow inner 336
   mouth corners: left 61, right 291
*/
function mouthOpenRatio(face: Landmark[]): number {
  if (face.length < 155) return 0
  const mH = Math.abs(face[14].y - face[13].y)
  const fH = Math.abs(face[10].y - face[152].y) || 0.001
  return mH / fH
}
function eyebrowFurrowed(face: Landmark[]): boolean {
  if (face.length < 340) return false
  return Math.abs(face[107].x - face[336].x) < 0.042
}
function eyebrowRaised(face: Landmark[]): boolean {
  if (face.length < 340) return false
  return (face[107].y + face[336].y) / 2 < face[1].y - 0.07
}
function mouthSmile(face: Landmark[]): boolean {
  if (face.length < 295) return false
  return (face[61].y + face[291].y) / 2 < face[13].y - 0.004
}

/* ── pose helpers (Holistic — 33 pose landmarks)
   0=nose 11=L-shoulder 12=R-shoulder 15=L-wrist 16=R-wrist
*/
function shoulderMidY(pose: Landmark[]): number {
  return pose.length >= 13 ? (pose[11].y + pose[12].y) / 2 : 0.5
}
function wristAboveShoulder(pose: Landmark[]): boolean {
  if (pose.length < 17) return false
  const sY = shoulderMidY(pose)
  return pose[15].y < sY - 0.04 || pose[16].y < sY - 0.04
}
function wristNearFace(pose: Landmark[]): boolean {
  if (pose.length < 17) return false
  const nY = pose[0].y
  return Math.abs(pose[15].y - nY) < 0.13 || Math.abs(pose[16].y - nY) < 0.13
}
function wristNearChin(pose: Landmark[]): boolean {
  if (pose.length < 17) return false
  const nY = pose[0].y
  const chinY = nY + 0.06
  return (pose[15].y > chinY && pose[15].y < nY + 0.20) ||
         (pose[16].y > chinY && pose[16].y < nY + 0.20)
}
function wristLow(pose: Landmark[]): boolean {
  if (pose.length < 17) return false
  const sY = shoulderMidY(pose)
  return pose[15].y > sY + 0.05 || pose[16].y > sY + 0.05
}

/* ── rule type ── */
type FullRule = (lm: Landmark[], face: Landmark[], pose: Landmark[]) => number

const SIGN_RULES: { sign: string; hint: string; rule: FullRule }[] = [

  /* ═══ HAND ONLY ═══ */
  { sign:"ฉันรักคุณ",  hint:"ILY: โป้ง+ชี้+ก้อย",
    rule:(lm)=>{ const f=fingers(lm); return f[0]&&f[1]&&!f[2]&&!f[3]&&f[4]?0.96:0 }},
  { sign:"โทรศัพท์",   hint:"Y: โป้ง+ก้อย กำมือ",
    rule:(lm)=>{ const f=fingers(lm); return f[0]&&!f[1]&&!f[2]&&!f[3]&&f[4]&&!handRaised(lm)?0.91:0 }},
  { sign:"ใช่",        hint:"โป้งขึ้น กำมือ",
    rule:(lm)=>{ const f=fingers(lm); return f[0]&&!f[1]&&!f[2]&&!f[3]&&!f[4]&&lm[4].y<lm[2].y?0.94:0 }},
  { sign:"ไม่ดี",      hint:"โป้งลง",
    rule:(lm)=>{ const f=fingers(lm); return f[0]&&!f[1]&&!f[2]&&!f[3]&&!f[4]&&lm[4].y>lm[2].y?0.88:0 }},
  { sign:"ไม่",        hint:"นิ้วชี้แนวนอน",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return !f[0]&&f[1]&&!f[2]&&!f[3]&&!f[4]&&Math.abs(a)<35?0.91:0 }},
  { sign:"มา",         hint:"นิ้วชี้ชี้เข้าหาตัว",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return !f[0]&&f[1]&&!f[2]&&!f[3]&&!f[4]&&a>120&&a<180?0.83:0 }},
  { sign:"ไป",         hint:"นิ้วชี้ชี้ออก",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return !f[0]&&f[1]&&!f[2]&&!f[3]&&!f[4]&&a>60&&a<120?0.84:0 }},
  { sign:"ยินดีที่ได้รู้จัก", hint:"นิ้วชี้แนวนอนต่ำ",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return !f[0]&&f[1]&&!f[2]&&!f[3]&&!f[4]&&Math.abs(a)<28&&handY(lm)>0.4?0.81:0 }},
  { sign:"ยา",         hint:"นิ้วก้อยเดียว",
    rule:(lm)=>{ const f=fingers(lm); return !f[0]&&!f[1]&&!f[2]&&!f[3]&&f[4]?0.87:0 }},
  { sign:"สบายดี",     hint:"V: ชี้+กลาง แยกออก",
    rule:(lm)=>{ const f=fingers(lm); return !f[0]&&f[1]&&f[2]&&!f[3]&&!f[4]&&dist(lm[8],lm[12])>palmSize(lm)*0.35?0.90:0 }},
  { sign:"หยุด",       hint:"ฝ่ามือออก แนวนอน",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return f.every(Boolean)&&Math.abs(a)<22?0.88:0 }},
  { sign:"ใหญ่",       hint:"มือเปิดกางสุด",
    rule:(lm)=>{ const f=fingers(lm); return f.every(Boolean)&&tipSpreadAll(lm)>palmSize(lm)*1.1?0.86:0 }},
  { sign:"โรงเรียน",   hint:"มือเปิด เอียง 20-45°",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return f.every(Boolean)&&a>20&&a<45?0.82:0 }},
  { sign:"ขอบคุณ",     hint:"4 นิ้วชิดกัน ระดับหน้า",
    rule:(lm)=>{ const f=fingers(lm); return !f[0]&&f[1]&&f[2]&&f[3]&&f[4]&&dist(lm[8],lm[20])<palmSize(lm)*0.9&&handY(lm)<0.5?0.89:0 }},
  { sign:"บ้าน",       hint:"4 นิ้วตั้งตรง",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return !f[0]&&f[1]&&f[2]&&f[3]&&f[4]&&a>70&&a<110?0.84:0 }},
  { sign:"น้ำ",        hint:"W: ชี้+กลาง+นาง แยก",
    rule:(lm)=>{ const f=fingers(lm); return !f[0]&&f[1]&&f[2]&&f[3]&&!f[4]&&dist(lm[8],lm[16])>palmSize(lm)*0.7?0.86:0 }},
  { sign:"ขอโทษ",      hint:"กำมือ กลางหน้าจอ",
    rule:(lm)=>{ const cx=(lm[0].x+lm[9].x)/2; return extCount(fingers(lm))===0&&cx>0.28&&cx<0.72?0.83:0 }},
  { sign:"ช่วยด้วย",   hint:"กำมือ โป้งออกข้าง",
    rule:(lm)=>{ return extCount(fingers(lm))===0&&dist(lm[4],lm[9])>palmSize(lm)*0.45?0.86:0 }},
  { sign:"ทำงาน",      hint:"กำมือ แนวนอน",
    rule:(lm)=>{ const a=wristAngle(lm); return extCount(fingers(lm))===0&&Math.abs(a)<32?0.82:0 }},
  { sign:"รถ",         hint:"กำมือ มือสูง",
    rule:(lm)=>{ return extCount(fingers(lm))===0&&tipSpreadAll(lm)>palmSize(lm)*0.28&&handY(lm)<0.6?0.80:0 }},
  { sign:"เล็ก",       hint:"Pinch โป้ง+ชี้ใกล้มาก",
    rule:(lm)=>{ const f=fingers(lm); return pinchNorm(lm,4,8)<0.22&&!f[2]&&!f[3]&&!f[4]?0.87:0 }},
  { sign:"เงิน",       hint:"โป้งถูนิ้วชี้+กลาง",
    rule:(lm)=>{ const f=fingers(lm); return pinchNorm(lm,4,8)<0.35&&pinchNorm(lm,4,12)<0.40&&!f[3]&&!f[4]?0.86:0 }},
  { sign:"ครอบครัว",   hint:"F: โป้ง+ชี้แตะ",
    rule:(lm)=>{ const f=fingers(lm); return pinchNorm(lm,4,8)<0.30&&f[2]&&f[3]&&f[4]?0.84:0 }},
  { sign:"ข้าว",       hint:"O-shape ปลายนิ้วรวม",
    rule:(lm)=>{ return extCount(fingers(lm))<=1&&tipSpreadAll(lm)<palmSize(lm)*0.6?0.81:0 }},
  { sign:"โรงพยาบาล",  hint:"H: ชี้+กลาง ชิดกัน แนวนอน",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return !f[0]&&f[1]&&f[2]&&!f[3]&&!f[4]&&dist(lm[8],lm[12])<palmSize(lm)*0.30&&Math.abs(a)<50?0.85:0 }},
  { sign:"นั่ง",       hint:"ชี้+กลางงอ เหมือนขาพับ",
    rule:(lm)=>{ const f=fingers(lm),bi=!isExtended(lm,8,6)&&bentDeep(lm,8),bm=!isExtended(lm,12,10)&&bentDeep(lm,12); return bi&&bm&&!f[3]&&!f[4]?0.83:0 }},
  { sign:"เร็ว",       hint:"L: โป้ง+ชี้ เอียง",
    rule:(lm)=>{ const f=fingers(lm),a=wristAngle(lm); return f[0]&&f[1]&&!f[2]&&!f[3]&&!f[4]&&a>28&&a<85?0.83:0 }},

  /* ═══ HAND + POSE ═══ */
  { sign:"สวัสดี",     hint:"มือเปิด 5 นิ้ว + มือสูงเหนือไหล่",
    rule:(lm,_f,pose)=>{
      const f=fingers(lm),a=wristAngle(lm)
      const open = f.every(Boolean)&&a>50&&a<130
      const high = pose.length>17 ? wristAboveShoulder(pose) : handY(lm)<0.45
      return open&&high?0.94:open?0.85:0
    }},
  { sign:"ดี",         hint:"โป้งขึ้น + มือสูงกว่าไหล่",
    rule:(lm,_f,pose)=>{
      const f=fingers(lm)
      const thumbUp = f[0]&&!f[1]&&!f[2]&&!f[3]&&!f[4]&&lm[4].y<lm[2].y
      const high    = pose.length>17 ? wristAboveShoulder(pose) : handY(lm)<0.40
      return thumbUp&&high?0.91:thumbUp?0.82:0
    }},
  { sign:"พ่อ",        hint:"มือเปิด + มือเหนือไหล่ (ขมับ)",
    rule:(lm,_f,pose)=>{
      const f=fingers(lm),a=wristAngle(lm)
      const open = f.every(Boolean)&&a>50&&a<130
      const high = pose.length>17 ? wristAboveShoulder(pose) : handY(lm)<0.32
      return open&&high?0.85:0
    }},
  { sign:"แม่",        hint:"มือเปิด + มือระดับคาง",
    rule:(lm,_f,pose)=>{
      const f=fingers(lm),a=wristAngle(lm)
      const open = f.every(Boolean)&&a>50&&a<130
      const chin = pose.length>17 ? wristNearChin(pose) : (handY(lm)>0.32&&handY(lm)<0.52)
      return open&&chin?0.85:0
    }},
  { sign:"นอน",        hint:"4 นิ้วแนวนอน + มือต่ำ",
    rule:(lm,_f,pose)=>{
      const f=fingers(lm),a=wristAngle(lm)
      const flat = !f[0]&&f[1]&&f[2]&&f[3]&&f[4]&&Math.abs(a)<18
      const low  = pose.length>17 ? wristLow(pose) : handY(lm)>0.50
      return flat&&low?0.84:0
    }},
  { sign:"ช้า",        hint:"มือเปิดแนวนอน + มือต่ำ",
    rule:(lm,_f,pose)=>{
      const f=fingers(lm),a=wristAngle(lm)
      const flat = f.every(Boolean)&&Math.abs(a)<28
      const low  = pose.length>17 ? wristLow(pose) : handY(lm)>0.52
      return flat&&low?0.82:0
    }},

  /* ═══ HAND + FACE ═══ */
  { sign:"หิว",        hint:"C-shape + คิ้วขมวด",
    rule:(lm,face)=>{
      const f=fingers(lm),p=pinchNorm(lm,4,8)
      const cShape = !f[0]&&!f[1]&&!f[2]&&!f[3]&&!f[4]&&p>0.30&&p<0.90
      const frown  = face.length>200 ? eyebrowFurrowed(face) : true
      return cShape&&frown?0.87:cShape?0.78:0
    }},
  { sign:"เจ็บ",       hint:"นิ้วชี้ลง + คิ้วขมวด",
    rule:(lm,face)=>{
      const f=fingers(lm)
      const point = !f[0]&&f[1]&&!f[2]&&!f[3]&&!f[4]&&lm[8].y>lm[0].y
      const pain  = face.length>200 ? eyebrowFurrowed(face)||mouthOpenRatio(face)>0.04 : true
      return point&&pain?0.87:point?0.78:0
    }},
  { sign:"ร้อน",       hint:"นิ้วกาง ระดับหน้า + ปากเปิด",
    rule:(lm,face)=>{
      const f=fingers(lm)
      const spread = !f[0]&&f[1]&&f[2]&&f[3]&&f[4]&&tipSpreadAll(lm)>palmSize(lm)*0.8&&handY(lm)<0.42
      const mouth  = face.length>20 ? mouthOpenRatio(face)>0.045 : true
      return spread&&mouth?0.85:spread?0.79:0
    }},
  { sign:"เย็น",       hint:"กำมือแน่น",
    rule:(lm,face)=>{
      const fist = extCount(fingers(lm))===0&&tipSpreadAll(lm)<palmSize(lm)*0.4
      const cold = face.length>200 ? !mouthSmile(face) : true
      return fist&&cold?0.82:fist?0.78:0
    }},
  { sign:"กิน",        hint:"ปลายนิ้วรวม ระดับปาก + ปากกึ่งเปิด",
    rule:(lm,face)=>{
      const f=fingers(lm)
      const pinch = pinchNorm(lm,4,8)<0.35&&!f[2]&&!f[3]&&!f[4]&&handY(lm)<0.55
      const mouth = face.length>20 ? mouthOpenRatio(face)>0.025 : true
      return pinch&&mouth?0.88:pinch?0.80:0
    }},
  { sign:"เข้าใจ",     hint:"นิ้วชี้แตะหัว + คิ้วยก",
    rule:(lm,face)=>{
      const f=fingers(lm),a=wristAngle(lm)
      const point = !f[0]&&f[1]&&!f[2]&&!f[3]&&!f[4]&&a>60&&a<120&&handY(lm)<0.35
      const brow  = face.length>200 ? eyebrowRaised(face) : true
      return point&&brow?0.90:point?0.81:0
    }},

  /* ═══ HAND + FACE + POSE ═══ */
  { sign:"น้ำ",        hint:"W-shape + ปากเปิด + มือใกล้หน้า",
    rule:(lm,face,pose)=>{
      const f=fingers(lm)
      const w     = !f[0]&&f[1]&&f[2]&&f[3]&&!f[4]&&dist(lm[8],lm[16])>palmSize(lm)*0.7
      const mouth = face.length>20 ? mouthOpenRatio(face)>0.025 : true
      const near  = pose.length>17 ? wristNearFace(pose) : true
      return w&&mouth&&near?0.90:w?0.82:0
    }},
  { sign:"เรียน",      hint:"นิ้วกึ่งเปิด + มือระดับหน้า",
    rule:(lm,_f,pose)=>{
      const near = pose.length>17 ? wristNearFace(pose) : handY(lm)<0.45
      return extCount(fingers(lm))>=3&&tipSpreadAll(lm)>palmSize(lm)*0.45&&tipSpreadAll(lm)<palmSize(lm)*0.85&&near?0.81:0
    }},
]

/* ── main classifier ── */
function classifyAll(
  multiHandLandmarks: Landmark[][],
  multiHandedness: { label: string; score: number }[],
  face: Landmark[],
  pose: Landmark[]
): SignResult | null {
  let best: SignResult | null = null
  for (let i = 0; i < multiHandLandmarks.length; i++) {
    const rawLm = multiHandLandmarks[i]
    if (rawLm.length < 21) continue
    const label = multiHandedness?.[i]?.label ?? "Right"
    const lm    = normalizeLandmarks(rawLm, label === "Left")
    for (const { sign, rule } of SIGN_RULES) {
      const confidence = rule(lm, face, pose)
      if (confidence >= 0.76 && (!best || confidence > best.confidence))
        best = { sign, confidence }
    }
  }
  return best
}

/* ─── VIDEO MAP ─── */
const BASE = "https://www.th-sl.com/wp-content/uploads"
const SIGN_VIDEOS: Record<string, string> = {
  "สวัสดี":            `${BASE}/2020/09/1.1.2.mp4`,
  "ขอบคุณ":            `${BASE}/2020/09/1.2.1.mp4`,
  "ขอโทษ":             `${BASE}/2020/09/1.3.2.mp4`,
  "สบายดี":            `${BASE}/2020/09/1.4.1.mp4`,
  "ฉันรักคุณ":         `${BASE}/2020/09/1.6.1.mp4`,
  "ยินดีที่ได้รู้จัก":  `${BASE}/2020/09/1.7.1.mp4`,
  "ใช่":               `${BASE}/2020/09/2.1.1.mp4`,
  "ไม่":               `${BASE}/2020/09/2.2.1.mp4`,
  "ดี":                `${BASE}/2020/09/2.3.1.mp4`,
  "ไม่ดี":             `${BASE}/2020/09/2.4.1.mp4`,
  "มา":                `${BASE}/2020/09/2.5.1.mp4`,
  "ไป":                `${BASE}/2020/09/2.6.1.mp4`,
  "หยุด":              `${BASE}/2020/09/2.7.1.mp4`,
  "เข้าใจ":            `${BASE}/2020/09/2.8.1.mp4`,
  "เร็ว":              `${BASE}/2020/09/2.9.1.mp4`,
  "ช้า":               `${BASE}/2020/09/2.10.1.mp4`,
  "ช่วยด้วย":          `${BASE}/2020/09/3.1.1.mp4`,
  "เจ็บ":              `${BASE}/2020/09/3.2.1.mp4`,
  "ยา":                `${BASE}/2020/09/3.3.1.mp4`,
  "โรงพยาบาล":         `${BASE}/2020/09/3.4.1.mp4`,
  "หิว":               `${BASE}/2020/09/4.1.1.mp4`,
  "น้ำ":               `${BASE}/2020/09/4.2.1.mp4`,
  "ข้าว":              `${BASE}/2020/09/4.3.1.mp4`,
  "กิน":               `${BASE}/2020/09/4.4.1.mp4`,
  "นอน":               `${BASE}/2020/09/4.5.1.mp4`,
  "นั่ง":              `${BASE}/2020/09/4.6.1.mp4`,
  "โทรศัพท์":          `${BASE}/2020/09/4.7.1.mp4`,
  "รถ":                `${BASE}/2020/09/4.8.1.mp4`,
  "เงิน":              `${BASE}/2020/09/4.9.1.mp4`,
  "ร้อน":              `${BASE}/2020/09/4.10.1.mp4`,
  "เย็น":              `${BASE}/2020/09/4.11.1.mp4`,
  "ใหญ่":              `${BASE}/2020/09/5.1.1.mp4`,
  "เล็ก":              `${BASE}/2020/09/5.2.1.mp4`,
  "พ่อ":               `${BASE}/2020/09/6.1.1.mp4`,
  "แม่":               `${BASE}/2020/09/6.2.1.mp4`,
  "ครอบครัว":          `${BASE}/2020/09/6.3.1.mp4`,
  "บ้าน":              `${BASE}/2020/09/7.1.1.mp4`,
  "โรงเรียน":          `${BASE}/2020/09/7.2.1.mp4`,
  "เรียน":             `${BASE}/2020/09/8.1.1.mp4`,
  "ทำงาน":             `${BASE}/2020/09/8.2.1.mp4`,
}
function getSignVideo(text: string): string | null {
  for (const [key, url] of Object.entries(SIGN_VIDEOS))
    if (text.includes(key)) return url
  return null
}

/* ─── MOBILE HOOK ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export function CameraFeed({ onTranslation, recentTranslations }: CameraFeedProps) {
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const streamRef     = useRef<MediaStream | null>(null)
  const holisticRef   = useRef<Holistic | null>(null)
  const camRef        = useRef<Camera | null>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const lastDetRef    = useRef(0)
  const replyVideoRef = useRef<HTMLVideoElement>(null)
  const faceRef       = useRef<Landmark[]>([])
  const poseRef       = useRef<Landmark[]>([])

  const isMobile = useIsMobile()

  const [cameraOn,       setCameraOn]       = useState(false)
  const [handsActive,    setHandsActive]    = useState(false)
  const [translation,    setTranslation]    = useState("")
  const [confidence,     setConfidence]     = useState(0)
  const [isAnalyzing,    setIsAnalyzing]    = useState(false)
  const [isSpeaking,     setIsSpeaking]     = useState(false)
  const [facingMode,     setFacingMode]     = useState<"user"|"environment">("user")
  const [replyText,      setReplyText]      = useState("")
  const [isRecording,    setIsRecording]    = useState(false)
  const [replyVideoUrl,  setReplyVideoUrl]  = useState<string | null>(null)
  const [showVideoPanel, setShowVideoPanel] = useState(false)
  const [videoCaption,   setVideoCaption]   = useState("")
  const [videoError,     setVideoError]     = useState(false)
  const [isPlaying,      setIsPlaying]      = useState(false)
  const [history,        setHistory]        = useState<{id:number;from:string;text:string}[]>([])
  const mediaRecRef = useRef<any>(null)

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = "th-TH"; u.rate = 0.9
    setIsSpeaking(true)
    u.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(u)
  }, [])

  /* ── startMP: Holistic from node_modules, dynamic import (client-only) ── */
  const startMP = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    // Dynamic imports resolve from node_modules — no CDN, no WASM path issues
    const {
      Holistic,
      HAND_CONNECTIONS,
    } = await import("@mediapipe/holistic")
    const { Camera } = await import("@mediapipe/camera_utils")

    const holistic = new Holistic({
      locateFile: (file: string) => `/node_modules/@mediapipe/holistic/${file}`,
    })

    holistic.setOptions({
      modelComplexity:        1,
      smoothLandmarks:        true,
      enableSegmentation:     false,
      smoothSegmentation:     false,
      refineFaceLandmarks:    false,   // 468 pts, no iris — faster
      minDetectionConfidence: 0.5,
      minTrackingConfidence:  0.5,
    })

    holistic.onResults((results: HolisticResults) => {
      // Persist face & pose for classifier
      faceRef.current = (results.faceLandmarks as unknown as Landmark[]) ?? []
      poseRef.current = (results.poseLandmarks as unknown as Landmark[]) ?? []

      const canvas = canvasRef.current; if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height)) {
        canvas.width  = Math.round(rect.width)
        canvas.height = Math.round(rect.height)
      }

      const ctx = canvas.getContext("2d")!
      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw video frame
      if (results.image) {
        const src = results.image as any
        const sw = src.width ?? src.videoWidth ?? canvas.width
        const sh = src.height ?? src.videoHeight ?? canvas.height
        const scale = Math.max(canvas.width / sw, canvas.height / sh)
        const dw = sw * scale, dh = sh * scale
        ctx.drawImage(src, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh)
      }

      const W = canvas.width, H = canvas.height

      // Build hand arrays from Holistic (separate left/right results)
      const hands: Landmark[][]                        = []
      const handedness: { label: string; score: number }[] = []

      if (results.leftHandLandmarks) {
        hands.push(results.leftHandLandmarks as unknown as Landmark[])
        handedness.push({ label: "Left",  score: 1 })
      }
      if (results.rightHandLandmarks) {
        hands.push(results.rightHandLandmarks as unknown as Landmark[])
        handedness.push({ label: "Right", score: 1 })
      }

      // Draw hand skeletons
      for (const lm of hands) {
        ctx.strokeStyle = "rgba(96,165,250,0.72)"; ctx.lineWidth = 2.5
        for (const [a, b] of HAND_CONNECTIONS as [number, number][]) {
          ctx.beginPath()
          ctx.moveTo(lm[a].x * W, lm[a].y * H)
          ctx.lineTo(lm[b].x * W, lm[b].y * H)
          ctx.stroke()
        }
        for (const pt of lm) {
          ctx.beginPath(); ctx.arc(pt.x * W, pt.y * H, 5, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fill()
          ctx.strokeStyle = "rgba(59,130,246,0.9)"; ctx.lineWidth = 2; ctx.stroke()
        }
        for (const idx of [4, 8, 12, 16, 20]) {
          ctx.beginPath(); ctx.arc(lm[idx].x * W, lm[idx].y * H, 10, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(147,197,253,0.65)"; ctx.lineWidth = 2.5; ctx.stroke()
          ctx.beginPath(); ctx.arc(lm[idx].x * W, lm[idx].y * H, 5.5, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(59,130,246,1)"; ctx.fill()
        }
      }

      if (hands.length > 0) {
        setHandsActive(true)
        const now = Date.now()
        if (now - lastDetRef.current > 1200) {
          const result = classifyAll(hands, handedness, faceRef.current, poseRef.current)
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

    await holistic.initialize()

    const cam = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) await holistic.send({ image: videoRef.current })
      },
      width: 1280, height: 720,
    })
    cam.start()

    holisticRef.current = holistic
    camRef.current      = cam
  }, [speak, onTranslation])

  const startCamera = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && window.speechSynthesis)
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(""))
      setCameraOn(true)
      await startMP()
    } catch (e) { console.warn("camera denied", e) }
  }, [startMP])

  const stopCamera = useCallback(() => {
    try { camRef.current?.stop() }       catch {}
    try { holisticRef.current?.close() } catch {}
    holisticRef.current = null
    camRef.current      = null
    faceRef.current     = []
    poseRef.current     = []
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current   = null
    setCameraOn(false); setHandsActive(false); setTranslation(""); setConfidence(0)
  }, [])

  const sendReply = useCallback((text: string) => {
    if (!text.trim()) return
    setReplyVideoUrl(getSignVideo(text))
    setVideoCaption(text); setVideoError(false); setIsPlaying(false)
    setShowVideoPanel(true)
    setHistory(h => [...h, { id: Date.now(), from: "user", text }])
    setReplyText("")
  }, [])

  const handleVideoPlay = useCallback(() => {
    if (replyVideoRef.current) {
      replyVideoRef.current.currentTime = 0
      replyVideoRef.current.play()
      setIsPlaying(true)
    }
  }, [])

  const toggleMic = useCallback(() => {
    if (isRecording) { mediaRecRef.current?.stop(); setIsRecording(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("เบราว์เซอร์นี้ไม่รองรับ กรุณาพิมพ์แทน"); return }
    const rec = new SR()
    rec.lang = "th-TH"; rec.continuous = false; rec.interimResults = false
    rec.onresult = (e: any) => { const txt = e.results[0][0].transcript; setReplyText(txt); sendReply(txt) }
    rec.onerror  = () => setIsRecording(false)
    rec.onend    = () => setIsRecording(false)
    rec.start(); mediaRecRef.current = rec; setIsRecording(true)
  }, [isRecording, sendReply])

  useEffect(() => () => stopCamera(), [stopCamera])

  /* ─── RENDER ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=K2D:wght@300;400;500;600;700;800&display=swap');
        .cf-root * { font-family: 'K2D', sans-serif !important; }

        @keyframes cf-up    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { 0%{top:0%;opacity:0} 6%{opacity:1} 94%{opacity:1} 100%{top:100%;opacity:0} }
        @keyframes floatpill{ 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-5px)} }
        @keyframes ripple   { 0%{transform:scale(0.9);opacity:1} 100%{transform:scale(2.4);opacity:0} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wavebar  { 0%,100%{height:6px} 50%{height:18px} }
        @keyframes cfSheen  { 0%,100%{left:-70%} 55%{left:130%} }

        .cf-card {
          animation: cf-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255,255,255,0.9); border-radius: 28px;
          box-shadow: 0 6px 32px rgba(37,99,235,0.07), 0 1px 4px rgba(37,99,235,0.04), inset 0 1px 0 rgba(255,255,255,1);
        }
        .cf-card:nth-child(1){animation-delay:0.04s}
        .cf-card:nth-child(2){animation-delay:0.09s}
        .cf-card:nth-child(3){animation-delay:0.14s}
        .cf-card:nth-child(4){animation-delay:0.19s}
        .cf-card:nth-child(5){animation-delay:0.24s}

        .cf-label { font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8; }

        .cf-accent-blue::before,.cf-accent-sky::before {
          content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:28px 28px 0 0;
        }
        .cf-accent-blue::before { background:linear-gradient(90deg,#2563eb,#60a5fa); }
        .cf-accent-sky::before  { background:linear-gradient(90deg,#0ea5e9,#38bdf8); }

        .cf-shortcut {
          display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:16px;
          font-size:13px;font-weight:700;color:#fff;text-decoration:none;
          background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);
          box-shadow:0 6px 20px rgba(37,99,235,0.30);transition:all 0.2s cubic-bezier(0.4,0,0.2,1);
          position:relative;overflow:hidden;
        }
        .cf-shortcut::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent 50%);border-radius:inherit; }
        .cf-shortcut:active { transform:scale(0.97); }

        .cf-camera-bg { background:linear-gradient(160deg,#dbeafe 0%,#e0f2fe 50%,#eff6ff 100%); }
        .cf-corner { position:absolute;width:28px;height:28px;border-color:rgba(37,99,235,0.55);border-style:solid;pointer-events:none; }
        .cf-idle-icon { width:80px;height:80px;border-radius:24px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);display:flex;align-items:center;justify-content:center;color:#3b82f6;box-shadow:0 8px 28px rgba(59,130,246,0.18); }

        .cf-start-btn {
          display:inline-flex;align-items:center;gap:10px;padding:16px 36px;border-radius:100px;
          font-size:15px;font-weight:700;color:#fff;
          background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);
          box-shadow:0 8px 28px rgba(37,99,235,0.38);transition:all 0.2s;cursor:pointer;border:none;
          position:relative;overflow:hidden;
        }
        .cf-start-btn::before { content:'';position:absolute;top:0;left:-70%;width:45%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);transform:skewX(-18deg);animation:cfSheen 3s ease-in-out infinite; }
        .cf-start-btn:active { transform:scale(0.97); }

        .cf-scanline { position:absolute;left:0;right:0;height:2px;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(59,130,246,0.9) 50%,transparent);box-shadow:0 0 22px rgba(59,130,246,0.7);animation:scanline 3s linear infinite; }

        .cf-result-box { border-radius:20px;min-height:100px;display:flex;align-items:center;justify-content:center;padding:24px;transition:all 0.5s; }
        .cf-result-box.has-result { background:linear-gradient(135deg,#eff6ff 0%,#e0f2fe 50%,#f0f9ff 100%);border:1.5px solid rgba(96,165,250,0.25);box-shadow:inset 0 1px 0 rgba(255,255,255,0.9); }
        .cf-result-box.empty { background:#f8fafc;border:1.5px solid #f1f5f9; }
        .cf-result-text { font-size:clamp(28px,5vw,46px);font-weight:800;text-align:center;letter-spacing:-0.02em;background:linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#0ea5e9 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        .cf-conf-badge { padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid rgba(96,165,250,0.3);color:#1d4ed8; }

        .cf-speak-btn { display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:100px;font-size:13px;font-weight:700;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);box-shadow:0 4px 16px rgba(59,130,246,0.35);transition:all 0.2s; }
        .cf-speak-btn:disabled { opacity:0.5; }
        .cf-speak-btn:active   { transform:scale(0.97); }

        .cf-input-row { display:flex;align-items:center;gap:10px;background:rgba(241,245,249,0.7);border:1.5px solid rgba(148,163,184,0.2);border-radius:100px;padding:8px 8px 8px 20px; }
        .cf-input-row input { flex:1;background:transparent;border:none;outline:none;font-size:14px;font-weight:500;color:#1e293b; }
        .cf-input-row input::placeholder { color:#94a3b8; }

        .cf-icon-btn { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;flex-shrink:0;transition:all 0.2s; }
        .cf-icon-btn.mic-idle  { background:#fff;border:1.5px solid #e2e8f0;color:#64748b;box-shadow:0 2px 8px rgba(0,0,0,0.06); }
        .cf-icon-btn.mic-idle:hover { border-color:#93c5fd;color:#3b82f6; }
        .cf-icon-btn.mic-active { background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 4px 16px rgba(239,68,68,0.4); }
        .cf-icon-btn.send-btn { background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);color:#fff;box-shadow:0 4px 14px rgba(59,130,246,0.38); }
        .cf-icon-btn.send-btn:disabled { opacity:0.4; }
        .cf-icon-btn:active    { transform:scale(0.93); }

        .cf-wave-bar { width:4px;border-radius:4px;background:#ef4444; }

        .cf-video-panel { border-radius:28px;padding:24px;position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(239,246,255,0.96),rgba(224,242,254,0.96));border:1.5px solid rgba(147,197,253,0.35);box-shadow:0 12px 48px rgba(37,99,235,0.12);animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
        .cf-video-panel::before { content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#2563eb,#38bdf8);border-radius:28px 28px 0 0; }
        .cf-caption-box { background:rgba(255,255,255,0.85);border:1px solid rgba(147,197,253,0.3);border-radius:16px;padding:12px 24px;text-align:center; }
        .cf-caption-text { font-size:16px;font-weight:700;color:#1d4ed8; }
        .cf-video-wrap { position:relative;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(37,99,235,0.18);max-width:360px;width:100%;background:#0f172a; }
        .cf-play-overlay { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.28);transition:background 0.2s;cursor:pointer; }
        .cf-play-overlay:hover { background:rgba(15,23,42,0.15); }
        .cf-play-circle { width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.92);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(0,0,0,0.2);color:#1d4ed8; }
        .cf-replay-btn { display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:100px;font-size:13px;font-weight:700;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 4px 16px rgba(59,130,246,0.38);transition:all 0.2s; }
        .cf-replay-btn:active { transform:scale(0.97); }
        .cf-dl-btn { display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:100px;font-size:13px;font-weight:700;color:#1d4ed8;text-decoration:none;background:#eff6ff;border:1.5px solid #bfdbfe;transition:all 0.2s; }
        .cf-dl-btn:hover { background:#dbeafe; }
        .cf-fallback-box { background:rgba(255,255,255,0.85);border:1.5px solid rgba(147,197,253,0.3);border-radius:18px;padding:24px;text-align:center;max-width:360px;width:100%; }
        .cf-ext-link { display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:100px;font-size:13px;font-weight:700;color:#fff;text-decoration:none;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 4px 16px rgba(59,130,246,0.38);transition:all 0.2s; }

        .cf-bubble-sign { background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid rgba(147,197,253,0.3);border-radius:18px 18px 18px 4px;padding:10px 16px;font-size:13px;font-weight:600;color:#1e3a8a;max-width:75%; }
        .cf-bubble-user { background:linear-gradient(135deg,#dbeafe,#bfdbfe);border:1px solid rgba(96,165,250,0.3);border-radius:18px 18px 4px 18px;padding:10px 16px;font-size:13px;font-weight:600;color:#1e40af;max-width:75%; }
        .cf-avatar-sign { width:32px;height:32px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#dbeafe,#bfdbfe);display:flex;align-items:center;justify-content:center;color:#3b82f6; }
        .cf-avatar-user { width:32px;height:32px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#3b82f6,#1d4ed8);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 3px 10px rgba(37,99,235,0.28); }

        .cf-cam-close-btn { display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:100px;border:none;cursor:pointer;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,#f87171,#ef4444);box-shadow:0 4px 14px rgba(239,68,68,0.38);transition:all 0.2s; }
        .cf-cam-close-btn:active { transform:scale(0.95); }
        .cf-flip-btn { display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:100px;border:none;cursor:pointer;font-size:12px;font-weight:700;color:#1e40af;background:rgba(255,255,255,0.88);backdrop-filter:blur(12px);border:1px solid rgba(147,197,253,0.5);box-shadow:0 2px 10px rgba(0,0,0,0.07);transition:all 0.2s; }
        .cf-flip-btn:active { transform:scale(0.95); }
        .cf-live-pill { display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:100px;font-size:11px;font-weight:800;letter-spacing:0.08em;color:#1e3a8a;background:rgba(255,255,255,0.88);backdrop-filter:blur(12px);border:1px solid rgba(147,197,253,0.5);box-shadow:0 2px 10px rgba(0,0,0,0.07); }
        .cf-analyzing-pill { display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:100px;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,rgba(30,58,138,0.92),rgba(37,99,235,0.92));backdrop-filter:blur(12px);box-shadow:0 6px 24px rgba(37,99,235,0.45);white-space:nowrap;animation:floatpill 2s ease-in-out infinite; }
        .cf-hands-pill { display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;font-size:11px;font-weight:700;color:#1e40af;background:rgba(255,255,255,0.88);backdrop-filter:blur(12px);border:1px solid rgba(147,197,253,0.4);box-shadow:0 2px 10px rgba(0,0,0,0.06);white-space:nowrap;animation:floatpill 2.5s ease-in-out infinite; }
        .cf-close-panel-btn { position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.85);border:1.5px solid #e2e8f0;display:flex;align-items:center;justify-content:center;color:#64748b;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.06); }
        .cf-close-panel-btn:hover { color:#1e293b;background:#fff; }
      `}</style>

      <div className="cf-root flex flex-col gap-4 w-full">

        {/* ── SHORTCUT ROW ── */}
        <div className="flex items-center gap-3 flex-wrap" style={{ animation:'cf-up 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>
          <Link href="/dashboard/user/vocab" className="cf-shortcut">
            <BookMarked size={15} />คู่มือภาษามือ
          </Link>
        </div>

        {/* ── CAMERA CARD ── */}
        <div className="cf-card" style={{ padding:10, position:'relative' }}>
          <div
            className="cf-camera-bg relative rounded-[22px] overflow-hidden"
            style={{ aspectRatio: isMobile ? "3/4" : "16/9" }}
          >
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            <canvas
              ref={canvasRef} width={1280} height={720}
              className={`absolute inset-0 w-full h-full rounded-[22px] ${!cameraOn ? "hidden" : ""}`}
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none", objectFit:"cover" }}
            />

            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <div className="cf-idle-icon"><IconCamera size={36} /></div>
                <button onClick={startCamera} className="cf-start-btn">
                  <IconCamera size={18} />เปิดกล้องเพื่อเริ่มแปลภาษามือ
                </button>
                <p style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>
                  AI จะตรวจจับมือ ใบหน้า และร่างกายเพื่อแปลท่าทาง
                </p>
              </div>
            )}

            {cameraOn && (
              <>
                <div className="cf-scanline" />

                {[
                  { top:'14px',    left:'14px',   borderTop:'3px',    borderLeft:'3px',   borderRadius:'10px 0 0 0' },
                  { top:'14px',    right:'14px',  borderTop:'3px',    borderRight:'3px',  borderRadius:'0 10px 0 0' },
                  { bottom:'14px', left:'14px',   borderBottom:'3px', borderLeft:'3px',   borderRadius:'0 0 0 10px' },
                  { bottom:'14px', right:'14px',  borderBottom:'3px', borderRight:'3px',  borderRadius:'0 0 10px 0' },
                ].map((style, i) => (
                  <div key={i} className="cf-corner" style={style as any} />
                ))}

                {isAnalyzing && (
                  <div className="cf-analyzing-pill" style={{ position:'absolute', top:16, left:'50%' }}>
                    <span style={{ width:8,height:8,borderRadius:'50%',background:'#93c5fd',animation:'pulse 1.2s infinite',display:'inline-block' }} />
                    AI กำลังวิเคราะห์...
                  </div>
                )}

                {handsActive && !isAnalyzing && (
                  <div className="cf-hands-pill" style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)' }}>
                    <IconHand size={12} />ตรวจพบมือ · กำลังอ่าน
                  </div>
                )}

                <div style={{ position:'absolute', bottom:14, right:14, display:'flex', alignItems:'center', gap:8 }}>
                  <button
                    onClick={() => { const nm = facingMode === "user" ? "environment" : "user"; setFacingMode(nm); stopCamera(); setTimeout(startCamera, 300) }}
                    className="cf-flip-btn"
                  >
                    <IconFlip size={12} />สลับ
                  </button>
                  <div className="cf-live-pill">
                    <span style={{ width:7,height:7,borderRadius:'50%',background:'#10b981',animation:'pulse 1.5s infinite',display:'inline-block',boxShadow:'0 0 6px rgba(16,185,129,0.8)' }} />
                    LIVE
                  </div>
                </div>

                <div style={{ position:'absolute', bottom:14, left:14 }}>
                  <button onClick={stopCamera} className="cf-cam-close-btn">
                    <IconCameraOff size={12} />ปิดกล้อง
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RESULT CARD ── */}
        <div className="cf-card cf-accent-blue" style={{ padding:24, position:'relative', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{
                width:8, height:8, borderRadius:'50%',
                background: translation ? '#3b82f6' : '#cbd5e1',
                display:'inline-block',
                boxShadow: translation ? '0 0 8px rgba(59,130,246,0.65)' : 'none',
                animation: translation ? 'pulse 1.5s infinite' : 'none',
                transition:'all 0.5s',
              }} />
              <span className="cf-label">ผลการแปลภาษามือ</span>
            </div>
            {confidence > 0 && <span className="cf-conf-badge">✦ {confidence}% แม่นยำ</span>}
          </div>

          <div className={`cf-result-box ${translation ? "has-result" : "empty"}`}>
            {translation ? (
              <p className="cf-result-text">{translation}</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center' }}>
                <span style={{ color:'#e2e8f0' }}><IconHand size={34} /></span>
                <p style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>
                  {cameraOn ? "ทำท่าทางภาษามือให้กล้องเห็น" : "เปิดกล้องเพื่อเริ่มต้น"}
                </p>
              </div>
            )}
          </div>

          {translation && (
            <div style={{ marginTop:16, display:'flex', gap:12, flexWrap:'wrap' }}>
              <button onClick={() => speak(translation)} disabled={isSpeaking} className="cf-speak-btn">
                <IconVolume size={14} />{isSpeaking ? "กำลังพูด..." : "ฟังเสียง"}
              </button>
            </div>
          )}
        </div>

        {/* ── REPLY CARD ── */}
        <div className="cf-card cf-accent-sky" style={{ padding:24, position:'relative', overflow:'hidden' }}>
          <p className="cf-label" style={{ marginBottom:4 }}>ตอบโต้กลับ</p>
          <p style={{ fontSize:12, color:'#94a3b8', fontWeight:500, marginBottom:16 }}>
            พิมพ์หรืออัดเสียง · แสดงวิดีโอภาษามือจริงจาก th-sl.com
          </p>

          <div className="cf-input-row">
            <input
              ref={inputRef} type="text" value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendReply(replyText)}
              placeholder="พิมพ์ข้อความที่ต้องการตอบ..."
            />
            <button onClick={toggleMic} className={`cf-icon-btn ${isRecording ? "mic-active" : "mic-idle"}`} style={{ position:'relative' }}>
              {isRecording && (
                <span style={{ position:'absolute', inset:-6, borderRadius:'50%', border:'2px solid rgba(239,68,68,0.4)', animation:'ripple 1s infinite' }} />
              )}
              {isRecording ? <IconMicOff size={15} /> : <IconMic size={15} />}
            </button>
            <button onClick={() => sendReply(replyText)} disabled={!replyText.trim()} className="cf-icon-btn send-btn">
              <IconSend size={14} />
            </button>
          </div>

          {isRecording && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, paddingLeft:8 }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:20 }}>
                {["0s","0.15s","0.3s"].map((d, i) => (
                  <div key={i} className="cf-wave-bar" style={{ animation:`wavebar 0.8s ${d} ease-in-out infinite`, height:16 }} />
                ))}
              </div>
              <span style={{ fontSize:12, color:'#ef4444', fontWeight:600 }}>กำลังฟัง...</span>
            </div>
          )}
        </div>

        {/* ── VIDEO PANEL ── */}
        {showVideoPanel && (
          <div className="cf-video-panel">
            <button onClick={() => setShowVideoPanel(false)} className="cf-close-panel-btn">
              <IconX size={13} />
            </button>
            <p className="cf-label" style={{ color:'#2563eb', marginBottom:4 }}>
              ภาษามือ · หันหน้าจอให้ผู้พิการทางการได้ยิน
            </p>
            <p style={{ fontSize:12, color:'#94a3b8', marginBottom:16 }}>
              วิดีโอจาก th-sl.com — สมาคมคนหูหนวกแห่งประเทศไทย
            </p>

            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
              <div className="cf-caption-box" style={{ maxWidth:360, width:'100%' }}>
                <p className="cf-caption-text">"{videoCaption}"</p>
              </div>

              {replyVideoUrl && !videoError ? (
                <div className="cf-video-wrap">
                  <video
                    ref={replyVideoRef} src={replyVideoUrl} loop playsInline className="w-full block"
                    onError={() => setVideoError(true)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  {!isPlaying && (
                    <div className="cf-play-overlay" onClick={handleVideoPlay}>
                      <div className="cf-play-circle"><IconPlay size={26} /></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="cf-fallback-box">
                  <p style={{ fontSize:40, marginBottom:12 }}>🤟</p>
                  <p style={{ fontSize:14, fontWeight:600, color:'#475569', marginBottom:16 }}>
                    {videoError ? "โหลดวิดีโอไม่ได้" : "ยังไม่มีวิดีโอสำหรับคำนี้"}
                  </p>
                  <a
                    href={`https://www.th-sl.com/en/search-by-word/?s=${encodeURIComponent(videoCaption)}`}
                    target="_blank" rel="noopener noreferrer" className="cf-ext-link"
                  >ค้นหาบน th-sl.com →</a>
                </div>
              )}

              {replyVideoUrl && !videoError && (
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
                  <button onClick={handleVideoPlay} className="cf-replay-btn">
                    <IconPlay size={13} />เล่นซ้ำ
                  </button>
                  <a href={replyVideoUrl} download className="cf-dl-btn">⬇ ดาวน์โหลด</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY CARD ── */}
        {history.length > 0 && (
          <div className="cf-card" style={{ padding:24 }}>
            <p className="cf-label" style={{ marginBottom:16 }}>ประวัติการสนทนา</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12, maxHeight:224, overflowY:'auto', paddingRight:4 }}>
              {history.slice().reverse().map(h => (
                <div key={h.id} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection: h.from === "user" ? "row-reverse" : "row" }}>
                  <div className={h.from === "sign" ? "cf-avatar-sign" : "cf-avatar-user"}>
                    {h.from === "sign" ? <IconHand size={13} /> : <IconMic size={13} />}
                  </div>
                  <div className={h.from === "sign" ? "cf-bubble-sign" : "cf-bubble-user"}>
                    {h.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default CameraFeed