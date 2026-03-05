"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { BookMarked } from "lucide-react"

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
const IconPlay = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)

/* ══════════════════════════════════════════════════════════════
   CLASSIFIER — Hand + Face + Pose
   ══════════════════════════════════════════════════════════════ */

function dist(a: Landmark, b: Landmark) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function _isExtended(lm: Landmark[], tip: number, pip: number) {
  return lm[tip].y < lm[pip].y
}

function fingers(lm: Landmark[]): boolean[] {
  const thumbExtended = dist(lm[4], lm[0]) > dist(lm[3], lm[0])
  return [
    thumbExtended,
    _isExtended(lm, 8,  6),
    _isExtended(lm, 12, 10),
    _isExtended(lm, 16, 14),
    _isExtended(lm, 20, 18),
  ]
}

function normalizeLandmarks(lm: Landmark[], isLeft: boolean): Landmark[] {
  if (!isLeft) return lm
  return lm.map(pt => ({ ...pt, x: 1 - pt.x }))
}

interface FaceLm { x: number; y: number; z?: number }

function mouthOpenRatio(face: FaceLm[]): number {
  if (face.length < 15) return 0
  const mouthH = Math.abs(face[14].y - face[13].y)
  const faceH  = Math.abs(face[10].y - face[152].y) || 0.001
  return mouthH / faceH
}

function eyebrowRaised(face: FaceLm[]): boolean {
  if (face.length < 340) return false
  const browY = (face[107].y + face[336].y) / 2
  const noseY = face[1].y
  return browY < noseY - 0.08
}

interface PoseLm { x: number; y: number; z?: number; visibility?: number }

function shoulderMidY(pose: PoseLm[]): number {
  if (pose.length < 13) return 0.5
  return (pose[11].y + pose[12].y) / 2
}

function hipMidY(pose: PoseLm[]): number {
  if (pose.length < 25) return 0.75
  return (pose[23].y + pose[24].y) / 2
}

function wristAboveShoulder(pose: PoseLm[], side: "L"|"R"): boolean {
  if (pose.length < 17) return false
  const wristY = side === "L" ? pose[15].y : pose[16].y
  return wristY < shoulderMidY(pose) - 0.04
}

function wristNearChest(pose: PoseLm[], side: "L"|"R"): boolean {
  if (pose.length < 17) return false
  const wristY = side === "L" ? pose[15].y : pose[16].y
  const sY = shoulderMidY(pose)
  return wristY > sY && wristY < hipMidY(pose)
}

interface HandFrame { x: number; y: number; size: number; tip_x: number; tip_y: number }
type FullRule = (lm: Landmark[], face: FaceLm[], pose: PoseLm[], history?: HandFrame[]) => number

const getDist = (p1: { x: number; y: number } | undefined, p2: { x: number; y: number } | undefined): number => {
  if (!p1 || !p2) return 999
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

const SIGN_RULES: { sign: string; hint: string; rule: FullRule }[] = [

  /* ══ หมวด 1: ทักทาย & พื้นฐาน ══ */
  { sign: "สวัสดี", hint: "แบมือขวาแตะหน้าผากแล้วเคลื่อนออก",
    rule: (lm, face, pose) => {
      const nearForehead = getDist(lm[8], face[10]) < 0.12
      const allOpen = fingers(lm).every(Boolean)
      const highWrist = wristAboveShoulder(pose, "R")
      return nearForehead && allOpen && highWrist ? 0.95 : 0
    }
  },
  { sign: "ขอบคุณ", hint: "นิ้วชี้ถึงก้อยแบออก แตะปาก (โป้งงอ)",
    rule: (lm, face, pose) => {
      const nearMouth = getDist(lm[8], face[13]) < 0.07
      const fourOpen = fingers(lm).slice(1).every(Boolean)
      const thumbClosed = !fingers(lm)[0]
      const mouthClosed = mouthOpenRatio(face) < 0.025
      return nearMouth && fourOpen && thumbClosed && mouthClosed ? 0.93 : 0
    }
  },
  { sign: "ขอโทษ", hint: "แบมือขวาแตะหน้าผากแล้ววนเป็นวงกลม",
    rule: (lm, face, pose, history) => {
      const nearForehead = getDist(lm[8], face[10]) < 0.15
      const allOpen = fingers(lm).every(Boolean)
      return nearForehead && allOpen ? 0.88 : 0
    }
  },
  { sign: "สบายดีไหม", hint: "นิ้วชี้กับนิ้วโป้งแตะที่อกแล้วยกขึ้น",
    rule: (lm, face, pose) => {
      const nearChest = wristNearChest(pose, "R")
      const checkMark = fingers(lm)[0] && fingers(lm)[1] && !fingers(lm)[2]
      return nearChest && checkMark ? 0.90 : 0
    }
  },
  { sign: "ยินดีที่ได้รู้จัก", hint: "กำมือขวาถูอกวน + นิ้วชี้แตะขมับ",
    rule: (lm, face, pose) => {
      const atChest = wristNearChest(pose, "R")
      const atTemple = getDist(lm[8], face[139]) < 0.1 || getDist(lm[8], face[368]) < 0.1
      const isIndex = fingers(lm)[1] && !fingers(lm)[2]
      return (atChest || atTemple) && isIndex ? 0.85 : 0
    }
  },
  { sign: "ใช่/ตกลง", hint: "พยักหน้า + กำมือขวาโยกขึ้นลง",
    rule: (lm, face, pose) => {
      const isFist = fingers(lm).every(f => !f)
      return isFist ? 0.82 : 0
    }
  },
  { sign: "ไม่ใช่", hint: "ส่ายหน้า + แบมือขวาส่ายไปมา",
    rule: (lm, face, pose) => {
      const allOpen = fingers(lm).every(Boolean)
      return allOpen && lm[0].y > 0.4 ? 0.80 : 0
    }
  },
  { sign: "ลาก่อน", hint: "โบกมือลาปกติ (มือสูงระดับไหล่)",
    rule: (lm, face, pose) => {
      const isHigh = lm[0].y < 0.4
      const allOpen = fingers(lm).every(Boolean)
      return isHigh && allOpen ? 0.85 : 0
    }
  },
  { sign: "ชื่อ", hint: "ใช้มือขวาทำรูปตัว V แตะที่อกด้านซ้าย",
    rule: (lm, face, pose) => {
      const vShape = fingers(lm)[1] && fingers(lm)[2] && !fingers(lm)[3]
      const atLeftChest = lm[0].x < 0.45 && wristNearChest(pose, "R")
      return vShape && atLeftChest ? 0.88 : 0
    }
  },
  { sign: "หิว", hint: "แบมือขวาลูบบริเวณท้อง",
    rule: (lm, face, pose) => {
      const lowHand = lm[0].y > 0.65
      const allOpen = fingers(lm).every(Boolean)
      return lowHand && allOpen ? 0.84 : 0
    }
  },

  /* ══ หมวดที่ 2: บุคคลและโรงเรียน ══ */
  { sign: "ครู", hint: "มือขวาจีบอยู่ระดับหูแล้วขยับขึ้นลง",
    rule: (lm, face, pose) => {
      const nearEar = getDist(lm[8], face[127]) < 0.12 || getDist(lm[8], face[356]) < 0.12
      const isPinch = getDist(lm[4], lm[8]) < 0.05 && !fingers(lm)[2]
      const highWrist = wristAboveShoulder(pose, "R") || wristAboveShoulder(pose, "L")
      return nearEar && isPinch && highWrist ? 0.92 : 0
    }
  },
  { sign: "นักเรียน", hint: "แบมือประกบแล้วกางออกเหมือนเปิดหนังสือ",
    rule: (lm, face, pose) => {
      const allOpen = fingers(lm).every(Boolean)
      const palmUp = lm[0].y > 0.5
      const isNearCenter = Math.abs(lm[0].x - 0.5) < 0.2
      return allOpen && palmUp && isNearCenter ? 0.85 : 0
    }
  },
  { sign: "เพื่อน", hint: "กำมือสองข้างขัดกันในระดับอก",
    rule: (lm, face, pose) => {
      const isFist = fingers(lm).every(f => !f)
      const atChest = wristNearChest(pose, "R") || wristNearChest(pose, "L")
      return isFist && atChest ? 0.88 : 0
    }
  },
  { sign: "โรงเรียน", hint: "ปลายนิ้วมือสองข้างแตะกันเป็นรูปหลังคา",
    rule: (lm, face, pose) => {
      const allOpen = fingers(lm).every(Boolean)
      const fingersTouching = getDist(lm[8], {x: 0.5, y: 0.3}) < 0.2
      return allOpen && fingersTouching ? 0.82 : 0
    }
  },
  { sign: "หูหนวก", hint: "นิ้วชี้ขวาแตะที่หูแล้วแตะที่ริมฝีปาก",
    rule: (lm, face, pose) => {
      const isIndex = fingers(lm)[1] && !fingers(lm)[2]
      const nearEar = getDist(lm[8], face[127]) < 0.15 || getDist(lm[8], face[356]) < 0.15
      const nearMouth = getDist(lm[8], face[13]) < 0.1
      return isIndex && (nearEar || nearMouth) ? 0.90 : 0
    }
  },
  { sign: "คนปกติ (หูดี)", hint: "นิ้วชี้ขวาแตะที่หูแล้วชูนิ้วโป้ง",
    rule: (lm, face, pose) => {
      const nearEar = getDist(lm[8], face[127]) < 0.15
      const thumbUp = fingers(lm)[0] && !fingers(lm)[2]
      return nearEar && thumbUp ? 0.93 : 0
    }
  },
  { sign: "ภาษามือ", hint: "นิ้วชี้กับนิ้วกลางเคลื่อนที่สลับวนกันไปมา",
    rule: (lm, face, pose) => {
      const vShape = fingers(lm)[1] && fingers(lm)[2] && !fingers(lm)[3]
      const inFront = lm[0].y > 0.4 && lm[0].y < 0.6
      return vShape && inFront ? 0.84 : 0
    }
  },
  { sign: "เข้าใจ", hint: "นิ้วชี้แตะที่หน้าผากแล้วดีดนิ้วขึ้น",
    rule: (lm, face, pose) => {
      const nearForehead = getDist(lm[8], face[10]) < 0.1
      const isIndex = fingers(lm)[1]
      return nearForehead && isIndex ? 0.95 : 0
    }
  },
  { sign: "ไม่เข้าใจ", hint: "ท่าเข้าใจ แต่ส่ายหน้า",
    rule: (lm, face, pose) => {
      const nearForehead = getDist(lm[8], face[10]) < 0.15
      const shakingHead = Math.abs(face[234].z ?? 0 - (face[454].z ?? 0)) < 0.04
      return nearForehead && shakingHead ? 0.90 : 0
    }
  },

  /* ══ หมวดที่ 3: กริยาและคำศัพท์ทั่วไป ══ */
  { sign: "กิน", hint: "ปลายนิ้วมือขวารวมกันทำท่าป้อนข้าวเข้าปาก",
    rule: (lm, face, pose) => {
      const nearMouth = getDist(lm[8], face[13]) < 0.06
      const isPinchFull = getDist(lm[4], lm[8]) < 0.05 && getDist(lm[4], lm[12]) < 0.05
      const mouthOpen = mouthOpenRatio(face) > 0.03
      return nearMouth && isPinchFull && mouthOpen ? 0.96 : 0
    }
  },
  { sign: "ไป", hint: "แบมือขวาคว่ำลงแล้วเคลื่อนออกไปข้างหน้า",
    rule: (lm, face, pose) => {
      const palmDown = lm[0].y < lm[9].y
      const allOpen = fingers(lm).every(Boolean)
      const inFront = lm[0].y > 0.4 && lm[0].y < 0.7
      return palmDown && allOpen && inFront ? 0.82 : 0
    }
  },
  { sign: "มา", hint: "แบมือขวาหงายขึ้นแล้วกวักเข้าหาตัว",
    rule: (lm, face, pose) => {
      const palmUp = lm[0].y > lm[9].y
      const allOpen = fingers(lm).every(Boolean)
      return palmUp && allOpen ? 0.82 : 0
    }
  },
  { sign: "ดู/เห็น", hint: "นิ้วชี้กับนิ้วกลาง (รูปตัว V) ชี้ออกจากตา",
    rule: (lm, face, pose) => {
      const vShape = fingers(lm)[1] && fingers(lm)[2] && !fingers(lm)[3]
      const nearEye = getDist(lm[8], face[33]) < 0.12 || getDist(lm[8], face[263]) < 0.12
      return vShape && nearEye ? 0.90 : 0
    }
  },
  { sign: "พูด", hint: "นิ้วชี้วนเป็นวงกลมหน้าปาก",
    rule: (lm, face, pose) => {
      const onlyIndex = fingers(lm)[1] && !fingers(lm)[2]
      const nearMouth = getDist(lm[8], face[13]) < 0.1
      const mouthMoving = mouthOpenRatio(face) > 0.01
      return onlyIndex && nearMouth && mouthMoving ? 0.86 : 0
    }
  },
  { sign: "อ่าน", hint: "แบมือซ้าย นิ้วชี้กับนิ้วกลางขวากวาดผ่าน",
    rule: (lm, face, pose) => {
      const vShape = fingers(lm)[1] && fingers(lm)[2]
      const palmLevel = lm[0].y > 0.5
      return vShape && palmLevel ? 0.80 : 0
    }
  },
  { sign: "เขียน", hint: "ทำท่าเหมือนถือปากกาเขียนบนฝ่ามือซ้าย",
    rule: (lm, face, pose) => {
      const isWriting = getDist(lm[4], lm[8]) < 0.04
      const lowLevel = lm[0].y > 0.6
      return isWriting && lowLevel ? 0.82 : 0
    }
  },
  { sign: "รัก", hint: "กำมือสองข้างไขว้กันแนบอก",
    rule: (lm, face, pose) => {
      if (pose.length < 17) return 0
      const crossed = Math.abs(pose[15].x - pose[16].x) < 0.15
      const atChest = pose[15].y < 0.7 && pose[15].y > 0.4
      return crossed && atChest ? 0.95 : 0
    }
  },
  { sign: "ชอบ", hint: "นิ้วโป้งกับนิ้วกลางจีบกันที่หน้าอกแล้วดึงออกมา",
    rule: (lm, face, pose) => {
      const nearChest = wristNearChest(pose, "R")
      const pinchMiddle = getDist(lm[4], lm[12]) < 0.05 && fingers(lm)[1]
      return nearChest && pinchMiddle ? 0.90 : 0
    }
  },
  { sign: "ช่วย", hint: "มือขวาตบหลังมือซ้ายเบาๆ",
    rule: (lm, face, pose) => {
      const flatHand = fingers(lm).every(Boolean)
      const atChestLevel = lm[0].y > 0.5 && lm[0].y < 0.8
      return flatHand && atChestLevel ? 0.75 : 0
    }
  },

  /* ══ หมวดที่ 4: คำถามและเวลา ══ */
  { sign: "ใคร", hint: "นิ้วชี้ขวาชี้ขึ้นแล้วหมุนวนเป็นวงกลมเล็กๆ",
    rule: (lm, face, pose) => {
      const onlyIndex = fingers(lm)[1] && !fingers(lm)[2] && !fingers(lm)[0]
      const upright = lm[8].y < lm[6].y
      return onlyIndex && upright ? 0.85 : 0
    }
  },
  { sign: "อะไร", hint: "แบมือขวาหงายขึ้นแล้วสั่นมือไปมาเล็กน้อย",
    rule: (lm, face, pose) => {
      const palmUp = lm[0].y > lm[9].y
      const allOpen = fingers(lm).every(Boolean)
      const chestLevel = wristNearChest(pose, "R")
      return palmUp && allOpen && chestLevel ? 0.82 : 0
    }
  },
  { sign: "ที่ไหน", hint: "แบมือขวาคว่ำลงแล้ววนเป็นวงกลมขนานกับพื้น",
    rule: (lm, face, pose) => {
      const palmDown = lm[0].y < lm[9].y
      const allOpen = fingers(lm).every(Boolean)
      const waistLevel = lm[0].y > 0.6
      return palmDown && allOpen && waistLevel ? 0.80 : 0
    }
  },
  { sign: "เมื่อไหร่", hint: "นิ้วชี้ขวาเคาะที่ข้อมือซ้าย (เหมือนดูนาฬิกา)",
    rule: (lm, face, pose) => {
      if (pose.length < 16) return 0
      const nearLeftWrist = getDist(lm[8], pose[15]) < 0.12
      const isIndex = fingers(lm)[1]
      return nearLeftWrist && isIndex ? 0.92 : 0
    }
  },
  { sign: "ทำไม", hint: "นิ้วชี้ขวาลากผ่านหน้าผากจากซ้ายไปขวา",
    rule: (lm, face, pose) => {
      const nearForehead = getDist(lm[8], face[10]) < 0.15
      const isIndex = fingers(lm)[1] && !fingers(lm)[2]
      const highWrist = wristAboveShoulder(pose, "R")
      return nearForehead && isIndex && highWrist ? 0.88 : 0
    }
  },
  { sign: "เท่าไหร่", hint: "ขยับนิ้วมือทั้งห้าขึ้นลงสลับกัน",
    rule: (lm, face, pose) => {
      const allOpen = fingers(lm).every(Boolean)
      const lowLevel = lm[0].y > 0.5
      return allOpen && lowLevel ? 0.75 : 0
    }
  },
  { sign: "วันนี้", hint: "แบมือสองข้างคว่ำลงแล้วกดลงระดับเอว",
    rule: (lm, face, pose) => {
      const palmDown = lm[0].y < lm[9].y
      const allOpen = fingers(lm).every(Boolean)
      const lowLevel = lm[0].y > 0.7
      return palmDown && allOpen && lowLevel ? 0.85 : 0
    }
  },
  { sign: "พรุ่งนี้", hint: "นิ้วโป้งขวาแตะข้างแก้มแล้วดีดออกไปข้างหน้า",
    rule: (lm, face, pose) => {
      const nearCheek = getDist(lm[4], face[205]) < 0.12 || getDist(lm[4], face[425]) < 0.12
      const thumbOnly = fingers(lm)[0] && !fingers(lm)[1]
      return nearCheek && thumbOnly ? 0.90 : 0
    }
  },
  { sign: "ตอนนี้", hint: "แบมือสองข้างคว่ำลงและเกร็งมือเน้นน้ำหนักลง",
    rule: (lm, face, pose) => {
      const palmDown = lm[0].y < lm[9].y
      const allOpen = fingers(lm).every(Boolean)
      const chestLevel = lm[0].y > 0.5 && lm[0].y < 0.7
      return palmDown && allOpen && chestLevel ? 0.85 : 0
    }
  },
  { sign: "รอ", hint: "แบมือซ้ายตั้งขึ้น มือขวาประคองใต้ศอกซ้าย",
    rule: (lm, face, pose) => {
      if (pose.length < 14) return 0
      const nearLeftElbow = getDist(lm[0], pose[13]) < 0.18
      const allOpen = fingers(lm).every(Boolean)
      return nearLeftElbow && allOpen ? 0.88 : 0
    }
  },
]

/* ══════════════════════════════════════════════════════════════
   CLASSIFIER — พร้อม Stability Buffer
   ══════════════════════════════════════════════════════════════ */
const CONFIRM_FRAMES = 4
const MIN_CONFIDENCE = 0.88
const COOLDOWN_MS    = 2500

let _pendingSign  = ""
let _pendingCount = 0

function classifyAll(
  multiHandLandmarks: Landmark[][],
  multiHandedness: { label: string; score: number }[],
  face: FaceLm[],
  pose: PoseLm[],
  leftHistory: HandFrame[],
  rightHistory: HandFrame[]
): SignResult | null {
  let best: SignResult | null = null

  for (let i = 0; i < multiHandLandmarks.length; i++) {
    const rawLm = multiHandLandmarks[i]
    if (rawLm.length < 21) continue

    const label = multiHandedness?.[i]?.label ?? "Right"
    const lm    = normalizeLandmarks(rawLm, label === "Left")
    const otherHistory = label === "Left" ? rightHistory : leftHistory

    for (const { sign, rule } of SIGN_RULES) {
      const confidence = rule(lm, face, pose, otherHistory)
      if (confidence >= MIN_CONFIDENCE && (!best || confidence > best.confidence))
        best = { sign, confidence }
    }
  }

  if (!best) {
    _pendingSign  = ""
    _pendingCount = 0
    return null
  }

  if (best.sign === _pendingSign) {
    _pendingCount++
  } else {
    _pendingSign  = best.sign
    _pendingCount = 1
  }

  if (_pendingCount >= CONFIRM_FRAMES) {
    _pendingCount = 0
    return best
  }

  return null
}

/* ─── VIDEO MAP ─── */
const BASE = "https://www.th-sl.com/wp-content/uploads"
const SIGN_VIDEOS: Record<string, string> = {
  "สวัสดี":           `${BASE}/2020/09/1.1.2.mp4`,
  "ขอบคุณ":           `${BASE}/2020/09/1.2.1.mp4`,
  "ขอโทษ":            `${BASE}/2020/09/1.3.2.mp4`,
  "สบายดี":           `${BASE}/2020/09/1.4.1.mp4`,
  "ฉันรักคุณ":        `${BASE}/2020/09/1.6.1.mp4`,
  "ยินดีที่ได้รู้จัก": `${BASE}/2020/09/1.7.1.mp4`,
  "ใช่":              `${BASE}/2020/09/2.1.1.mp4`,
  "ไม่":              `${BASE}/2020/09/2.2.1.mp4`,
  "ดี":               `${BASE}/2020/09/2.3.1.mp4`,
  "ไม่ดี":            `${BASE}/2020/09/2.4.1.mp4`,
  "มา":               `${BASE}/2020/09/2.5.1.mp4`,
  "ไป":               `${BASE}/2020/09/2.6.1.mp4`,
  "หยุด":             `${BASE}/2020/09/2.7.1.mp4`,
  "เข้าใจ":           `${BASE}/2020/09/2.8.1.mp4`,
  "เร็ว":             `${BASE}/2020/09/2.9.1.mp4`,
  "ช้า":              `${BASE}/2020/09/2.10.1.mp4`,
  "ช่วยด้วย":         `${BASE}/2020/09/3.1.1.mp4`,
  "เจ็บ":             `${BASE}/2020/09/3.2.1.mp4`,
  "ยา":               `${BASE}/2020/09/3.3.1.mp4`,
  "โรงพยาบาล":        `${BASE}/2020/09/3.4.1.mp4`,
  "หิว":              `${BASE}/2020/09/4.1.1.mp4`,
  "น้ำ":              `${BASE}/2020/09/4.2.1.mp4`,
  "ข้าว":             `${BASE}/2020/09/4.3.1.mp4`,
  "กิน":              `${BASE}/2020/09/4.4.1.mp4`,
  "นอน":              `${BASE}/2020/09/4.5.1.mp4`,
  "นั่ง":             `${BASE}/2020/09/4.6.1.mp4`,
  "โทรศัพท์":         `${BASE}/2020/09/4.7.1.mp4`,
  "รถ":               `${BASE}/2020/09/4.8.1.mp4`,
  "เงิน":             `${BASE}/2020/09/4.9.1.mp4`,
  "ร้อน":             `${BASE}/2020/09/4.10.1.mp4`,
  "เย็น":             `${BASE}/2020/09/4.11.1.mp4`,
  "ใหญ่":             `${BASE}/2020/09/5.1.1.mp4`,
  "เล็ก":             `${BASE}/2020/09/5.2.1.mp4`,
  "พ่อ":              `${BASE}/2020/09/6.1.1.mp4`,
  "แม่":              `${BASE}/2020/09/6.2.1.mp4`,
  "ครอบครัว":         `${BASE}/2020/09/6.3.1.mp4`,
  "บ้าน":             `${BASE}/2020/09/7.1.1.mp4`,
  "โรงเรียน":         `${BASE}/2020/09/7.2.1.mp4`,
  "เรียน":            `${BASE}/2020/09/8.1.1.mp4`,
  "ทำงาน":            `${BASE}/2020/09/8.2.1.mp4`,
}

function getSignVideo(text: string): string | null {
  for (const [key, url] of Object.entries(SIGN_VIDEOS)) {
    if (text.includes(key)) return url
  }
  return null
}

/* ─── MOBILE DETECTION HOOK ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

export function CameraFeed({ onTranslation, recentTranslations }: CameraFeedProps) {
  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const streamRef     = useRef<MediaStream | null>(null)
  const mpRef         = useRef<{ holistic: any; cam: any } | null>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const lastDetRef    = useRef(0)
  const replyVideoRef = useRef<HTMLVideoElement>(null)
  const faceRef       = useRef<FaceLm[]>([])
  const poseRef       = useRef<PoseLm[]>([])
  const rightHandMemoryRef = useRef<HandFrame[]>([])
  const leftHandMemoryRef  = useRef<HandFrame[]>([])

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

  const loadScript = (src: string): Promise<void> => new Promise(res => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return }
    const s = document.createElement("script"); s.src = src; s.async = true; s.onload = () => res()
    document.body.appendChild(s)
  })

  const stopCamera = useCallback(() => {
    if (mpRef.current) {
      const { cam, holistic } = mpRef.current
      mpRef.current = null
      try { cam?.stop() } catch {}
      try { holistic?.close() } catch {}
    }
    faceRef.current = []
    poseRef.current = []
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraOn(false)
    setHandsActive(false)
    setTranslation("")
    setConfidence(0)
  }, [])

  const startMP = useCallback(async () => {
    const CDN_HOLISTIC = "https://cdn.jsdelivr.net/npm/@mediapipe/holistic"
    const CDN_CAM      = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils"

    await loadScript(`${CDN_CAM}/camera_utils.js`)
    await loadScript(`${CDN_HOLISTIC}/holistic.js`)

    if (!videoRef.current || !canvasRef.current) return

    const holistic = new (window as any).Holistic({
      locateFile: (f: string) => `${CDN_HOLISTIC}/${f}`,
    })

    holistic.setOptions({
      modelComplexity: 2,
      smoothLandmarks: true,
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4,
    })

    holistic.onResults((results: any) => {
      const canvas = canvasRef.current; if (!canvas) return
      const ctx = canvas.getContext("2d")!

      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const src = results.image
      const sw = src.width ?? src.videoWidth ?? canvas.width
      const sh = src.height ?? src.videoHeight ?? canvas.height
      const scale = Math.max(canvas.width / sw, canvas.height / sh)
      const dw = sw * scale; const dh = sh * scale
      const dx = (canvas.width - dw) / 2; const dy = (canvas.height - dh) / 2
      ctx.drawImage(src, dx, dy, dw, dh)

      const multiHandLandmarks: Landmark[][] = []
      const multiHandedness: { label: string; score: number }[] = []

      const face: FaceLm[] = results.faceLandmarks || []
      const pose: PoseLm[] = results.poseLandmarks || []

      if (results.rightHandLandmarks) {
        const lm: Landmark[] = results.rightHandLandmarks
        multiHandLandmarks.push(lm)
        multiHandedness.push({ label: "Left", score: 1.0 })
        const wrist = lm[0]
        const size = Math.sqrt(Math.pow(lm[0].x - lm[9].x, 2) + Math.pow(lm[0].y - lm[9].y, 2))
        rightHandMemoryRef.current.push({ x: wrist.x, y: wrist.y, size, tip_x: lm[8].x, tip_y: lm[8].y })
        if (rightHandMemoryRef.current.length > 15) rightHandMemoryRef.current.shift()
      } else {
        rightHandMemoryRef.current = []
      }

      if (results.leftHandLandmarks) {
        const lm: Landmark[] = results.leftHandLandmarks
        multiHandLandmarks.push(lm)
        multiHandedness.push({ label: "Right", score: 1.0 })
        const wrist = lm[0]
        const size = Math.sqrt(Math.pow(lm[0].x - lm[9].x, 2) + Math.pow(lm[0].y - lm[9].y, 2))
        leftHandMemoryRef.current.push({ x: wrist.x, y: wrist.y, size, tip_x: lm[8].x, tip_y: lm[8].y })
        if (leftHandMemoryRef.current.length > 15) leftHandMemoryRef.current.shift()
      } else {
        leftHandMemoryRef.current = []
      }

      faceRef.current = face
      poseRef.current = pose

      const W = canvas.width, H = canvas.height

      /* ══ วาด Face Mesh ══ */
      if (face.length > 0) {
        for (const pt of face) {
          ctx.beginPath()
          ctx.arc(pt.x * W, pt.y * H, 1.2, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(147,210,200,0.28)"
          ctx.fill()
        }

        const FACE_CONTOURS: number[][] = [
          [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109,10],
          [46,53,52,65,55,70,63,105,66,107,55,65,52,53,46],
          [276,283,282,295,285,300,293,334,296,336,285,295,282,283,276],
          [33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246,33],
          [362,382,381,380,374,373,390,249,263,466,388,387,386,385,384,398,362],
          [61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185,61],
          [78,95,88,178,87,14,317,402,318,324,308,415,310,311,312,13,82,81,80,191,78],
          [168,6,197,195,5,4,1,19,94,2,164,0],
        ]

        ctx.lineWidth   = 1.2
        ctx.strokeStyle = "rgba(52,211,153,0.50)"
        for (const loop of FACE_CONTOURS) {
          if (loop.some(i => i >= face.length)) continue
          ctx.beginPath()
          ctx.moveTo(face[loop[0]].x * W, face[loop[0]].y * H)
          for (let i = 1; i < loop.length; i++) {
            ctx.lineTo(face[loop[i]].x * W, face[loop[i]].y * H)
          }
          ctx.stroke()
        }

        const KEY_LANDMARKS: { idx: number; color: string; r: number; label: string }[] = [
          { idx: 10,  color: "rgba(251,191,36,0.90)",  r: 5, label: "หน้าผาก" },
          { idx: 13,  color: "rgba(249,115,22,0.90)",  r: 5, label: "ปาก" },
          { idx: 14,  color: "rgba(249,115,22,0.60)",  r: 3, label: "" },
          { idx: 33,  color: "rgba(167,139,250,0.90)", r: 5, label: "ตา" },
          { idx: 263, color: "rgba(167,139,250,0.90)", r: 5, label: "" },
          { idx: 127, color: "rgba(251,113,133,0.90)", r: 5, label: "หู" },
          { idx: 356, color: "rgba(251,113,133,0.90)", r: 5, label: "" },
          { idx: 205, color: "rgba(52,211,153,0.90)",  r: 4, label: "แก้ม" },
          { idx: 425, color: "rgba(52,211,153,0.90)",  r: 4, label: "" },
        ]

        for (const { idx, color, r, label } of KEY_LANDMARKS) {
          if (idx >= face.length) continue
          const x = face[idx].x * W
          const y = face[idx].y * H

          ctx.beginPath()
          ctx.arc(x, y, r + 4, 0, Math.PI * 2)
          ctx.strokeStyle = color.replace("0.90", "0.25").replace("0.60", "0.15")
          ctx.lineWidth = 2
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()

          if (label) {
            ctx.font      = "bold 10px sans-serif"
            ctx.fillStyle = "rgba(255,255,255,0.85)"
            ctx.fillText(label, x + r + 4, y + 4)
          }
        }
      }

      /* ══ วาด Hand Landmarks ══ */
      if (multiHandLandmarks.length > 0) {
        const HAND_CONNS = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]]

        for (const lm of multiHandLandmarks) {
          ctx.strokeStyle = "rgba(96,165,250,0.72)"; ctx.lineWidth = 2.5
          for (const [a, b] of HAND_CONNS) {
            ctx.beginPath(); ctx.moveTo(lm[a].x*W, lm[a].y*H); ctx.lineTo(lm[b].x*W, lm[b].y*H); ctx.stroke()
          }
          for (const pt of lm) {
            ctx.beginPath(); ctx.arc(pt.x*W, pt.y*H, 5, 0, Math.PI*2)
            ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fill()
            ctx.strokeStyle = "rgba(59,130,246,0.9)"; ctx.lineWidth = 2; ctx.stroke()
          }
          for (const idx of [4,8,12,16,20]) {
            ctx.beginPath(); ctx.arc(lm[idx].x*W, lm[idx].y*H, 10, 0, Math.PI*2)
            ctx.strokeStyle = "rgba(147,197,253,0.65)"; ctx.lineWidth = 2.5; ctx.stroke()
            ctx.beginPath(); ctx.arc(lm[idx].x*W, lm[idx].y*H, 5.5, 0, Math.PI*2)
            ctx.fillStyle = "rgba(59,130,246,1)"; ctx.fill()
          }
        }

        setHandsActive(true)

        const now = Date.now()
        if (now - lastDetRef.current > COOLDOWN_MS) {
          const result = classifyAll(
            multiHandLandmarks,
            multiHandedness,
            faceRef.current,
            poseRef.current,
            rightHandMemoryRef.current,
            leftHandMemoryRef.current
          )
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
      onFrame: async () => {
        if (!mpRef.current) return
        try {
          const v = videoRef.current
          if (v && v.videoWidth > 0) {
            await holistic.send({ image: v })
          }
        } catch (error) {
          console.warn("Wasm object deleted, skipping frame.", error)
        }
      },
      width: 1280, height: 720,
    })

    mpRef.current = { holistic, cam }
    cam.start()
  }, [speak, onTranslation])

  const sendReply = useCallback((text: string) => {
    if (!text.trim()) return
    const url = getSignVideo(text)
    setReplyVideoUrl(url)
    setVideoCaption(text)
    setVideoError(false)
    setIsPlaying(false)
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
    const rec = new SR(); rec.lang="th-TH"; rec.continuous=false; rec.interimResults=false
    rec.onresult = (e: any) => { const txt=e.results[0][0].transcript; setReplyText(txt); sendReply(txt) }
    rec.onerror = () => setIsRecording(false)
    rec.onend   = () => setIsRecording(false)
    rec.start(); mediaRecRef.current=rec; setIsRecording(true)
  }, [isRecording, sendReply])

  useEffect(() => () => stopCamera(), [stopCamera])

  const startCamera = useCallback(async () => {
    setCameraOn(true)
    setHandsActive(false)
    setTranslation("")
    setConfidence(0)
    await startMP()
  }, [startMP])

  /* ─── RENDER ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=K2D:wght@300;400;500;600;700;800&display=swap');

        .cf-root * { font-family: 'K2D', sans-serif !important; }

        @keyframes cf-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cf-card {
          animation: cf-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: 28px;
          box-shadow:
            0 6px 32px rgba(37,99,235,0.07),
            0 1px 4px  rgba(37,99,235,0.04),
            inset 0 1px 0 rgba(255,255,255,1);
        }
        .cf-card:nth-child(1){ animation-delay:0.04s }
        .cf-card:nth-child(2){ animation-delay:0.09s }
        .cf-card:nth-child(3){ animation-delay:0.14s }
        .cf-card:nth-child(4){ animation-delay:0.19s }
        .cf-card:nth-child(5){ animation-delay:0.24s }

        @keyframes scanline {
          0%  {top:0%;  opacity:0}
          6%  {opacity:1}
          94% {opacity:1}
          100%{top:100%;opacity:0}
        }
        @keyframes floatpill {
          0%,100%{transform:translateX(-50%) translateY(0)}
          50%    {transform:translateX(-50%) translateY(-5px)}
        }
        @keyframes ripple {
          0%  {transform:scale(0.9);opacity:1}
          100%{transform:scale(2.4);opacity:0}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(14px)}
          to  {opacity:1;transform:translateY(0)}
        }
        @keyframes wavebar {
          0%,100%{height:6px}
          50%    {height:18px}
        }

        .cf-label {
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #94a3b8;
        }
        .cf-accent-blue::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#2563eb,#60a5fa);
          border-radius:28px 28px 0 0;
        }
        .cf-accent-sky::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#0ea5e9,#38bdf8);
          border-radius:28px 28px 0 0;
        }
        .cf-shortcut {
          display:inline-flex; align-items:center; gap:8px;
          padding: 10px 20px; border-radius:16px;
          font-size:13px; font-weight:700;
          color:#fff; text-decoration:none;
          background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);
          box-shadow:0 6px 20px rgba(37,99,235,0.30);
          transition:all 0.2s cubic-bezier(0.4,0,0.2,1);
          position:relative; overflow:hidden;
        }
        .cf-shortcut::after {
          content:'';
          position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent 50%);
          border-radius:inherit;
        }
        .cf-shortcut:active { transform:scale(0.97); }
        .cf-camera-bg {
          background: linear-gradient(160deg, #dbeafe 0%, #e0f2fe 50%, #eff6ff 100%);
        }
        .cf-corner {
          position:absolute; width:28px; height:28px;
          border-color: rgba(37,99,235,0.55);
          border-style:solid;
          pointer-events:none;
        }
        .cf-idle-icon {
          width:80px; height:80px; border-radius:24px;
          background:linear-gradient(135deg,#dbeafe,#bfdbfe);
          display:flex; align-items:center; justify-content:center;
          color:#3b82f6;
          box-shadow:0 8px 28px rgba(59,130,246,0.18);
        }
        .cf-start-btn {
          display:inline-flex; align-items:center; gap:10px;
          padding:16px 36px; border-radius:100px;
          font-size:15px; font-weight:700; color:#fff;
          background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);
          box-shadow:0 8px 28px rgba(37,99,235,0.38);
          transition:all 0.2s; cursor:pointer; border:none;
          position:relative; overflow:hidden;
        }
        .cf-start-btn::before {
          content:'';
          position:absolute; top:0; left:-70%; width:45%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);
          transform:skewX(-18deg);
          animation:cfSheen 3s ease-in-out infinite;
        }
        @keyframes cfSheen { 0%,100%{left:-70%} 55%{left:130%} }
        .cf-start-btn:active { transform:scale(0.97); }
        .cf-scanline {
          position:absolute; left:0; right:0; height:2px; pointer-events:none;
          background:linear-gradient(90deg,transparent,rgba(59,130,246,0.9) 50%,transparent);
          box-shadow:0 0 22px rgba(59,130,246,0.7);
          animation:scanline 3s linear infinite;
        }
        .cf-result-box {
          border-radius:20px; min-height:100px;
          display:flex; align-items:center; justify-content:center; padding:24px;
          transition:all 0.5s;
        }
        .cf-result-box.has-result {
          background:linear-gradient(135deg,#eff6ff 0%,#e0f2fe 50%,#f0f9ff 100%);
          border:1.5px solid rgba(96,165,250,0.25);
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .cf-result-box.empty {
          background:#f8fafc;
          border:1.5px solid #f1f5f9;
        }
        .cf-result-text {
          font-size:clamp(28px,5vw,46px);
          font-weight:800; text-align:center; letter-spacing:-0.02em;
          background:linear-gradient(135deg,#1d4ed8 0%,#3b82f6 50%,#0ea5e9 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        .cf-conf-badge {
          padding:4px 12px; border-radius:100px;
          font-size:11px; font-weight:700;
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          border:1px solid rgba(96,165,250,0.3);
          color:#1d4ed8;
        }
        .cf-speak-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:100px;
          font-size:13px; font-weight:700; color:#fff; border:none; cursor:pointer;
          background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);
          box-shadow:0 4px 16px rgba(59,130,246,0.35);
          transition:all 0.2s;
        }
        .cf-speak-btn:disabled { opacity:0.5; }
        .cf-speak-btn:active { transform:scale(0.97); }
        .cf-input-row {
          display:flex; align-items:center; gap:10px;
          background:rgba(241,245,249,0.7);
          border:1.5px solid rgba(148,163,184,0.2);
          border-radius:100px; padding:8px 8px 8px 20px;
        }
        .cf-input-row input {
          flex:1; background:transparent; border:none; outline:none;
          font-size:14px; font-weight:500; color:#1e293b;
        }
        .cf-input-row input::placeholder { color:#94a3b8; }
        .cf-icon-btn {
          width:40px; height:40px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          border:none; cursor:pointer; flex-shrink:0; transition:all 0.2s;
        }
        .cf-icon-btn.mic-idle {
          background:#fff; border:1.5px solid #e2e8f0; color:#64748b;
          box-shadow:0 2px 8px rgba(0,0,0,0.06);
        }
        .cf-icon-btn.mic-idle:hover { border-color:#93c5fd; color:#3b82f6; }
        .cf-icon-btn.mic-active {
          background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff;
          box-shadow:0 4px 16px rgba(239,68,68,0.4);
        }
        .cf-icon-btn.send-btn {
          background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);
          color:#fff; box-shadow:0 4px 14px rgba(59,130,246,0.38);
        }
        .cf-icon-btn.send-btn:disabled { opacity:0.4; }
        .cf-icon-btn:active { transform:scale(0.93); }
        .cf-wave-bar {
          width:4px; border-radius:4px; background:#ef4444;
        }
        .cf-video-panel {
          border-radius:28px; padding:24px;
          position:relative; overflow:hidden;
          background:linear-gradient(135deg,rgba(239,246,255,0.96),rgba(224,242,254,0.96));
          border:1.5px solid rgba(147,197,253,0.35);
          box-shadow:0 12px 48px rgba(37,99,235,0.12);
          animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        .cf-video-panel::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#2563eb,#38bdf8);
          border-radius:28px 28px 0 0;
        }
        .cf-caption-box {
          background:rgba(255,255,255,0.85);
          border:1px solid rgba(147,197,253,0.3);
          border-radius:16px; padding:12px 24px; text-align:center;
        }
        .cf-caption-text {
          font-size:16px; font-weight:700; color:#1d4ed8;
        }
        .cf-video-wrap {
          position:relative; border-radius:18px; overflow:hidden;
          box-shadow:0 12px 40px rgba(37,99,235,0.18);
          max-width:360px; width:100%; background:#0f172a;
        }
        .cf-play-overlay {
          position:absolute; inset:0;
          display:flex; align-items:center; justify-content:center;
          background:rgba(15,23,42,0.28);
          transition:background 0.2s; cursor:pointer;
        }
        .cf-play-overlay:hover { background:rgba(15,23,42,0.15); }
        .cf-play-circle {
          width:64px; height:64px; border-radius:50%;
          background:rgba(255,255,255,0.92);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 6px 24px rgba(0,0,0,0.2);
          color:#1d4ed8;
        }
        .cf-replay-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:100px;
          font-size:13px; font-weight:700; color:#fff; border:none; cursor:pointer;
          background:linear-gradient(135deg,#3b82f6,#1d4ed8);
          box-shadow:0 4px 16px rgba(59,130,246,0.38);
          transition:all 0.2s;
        }
        .cf-replay-btn:active { transform:scale(0.97); }
        .cf-dl-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:100px;
          font-size:13px; font-weight:700; color:#1d4ed8; text-decoration:none;
          background:#eff6ff; border:1.5px solid #bfdbfe;
          transition:all 0.2s;
        }
        .cf-dl-btn:hover { background:#dbeafe; }
        .cf-fallback-box {
          background:rgba(255,255,255,0.85);
          border:1.5px solid rgba(147,197,253,0.3);
          border-radius:18px; padding:24px; text-align:center;
          max-width:360px; width:100%;
        }
        .cf-ext-link {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:100px;
          font-size:13px; font-weight:700; color:#fff; text-decoration:none;
          background:linear-gradient(135deg,#3b82f6,#1d4ed8);
          box-shadow:0 4px 16px rgba(59,130,246,0.38);
          transition:all 0.2s;
        }
        .cf-bubble-sign {
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          border:1px solid rgba(147,197,253,0.3);
          border-radius:18px 18px 18px 4px;
          padding:10px 16px;
          font-size:13px; font-weight:600; color:#1e3a8a;
          max-width:75%;
        }
        .cf-bubble-user {
          background:linear-gradient(135deg,#dbeafe,#bfdbfe);
          border:1px solid rgba(96,165,250,0.3);
          border-radius:18px 18px 4px 18px;
          padding:10px 16px;
          font-size:13px; font-weight:600; color:#1e40af;
          max-width:75%;
        }
        .cf-avatar-sign {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#dbeafe,#bfdbfe);
          display:flex; align-items:center; justify-content:center; color:#3b82f6;
        }
        .cf-avatar-user {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#3b82f6,#1d4ed8);
          display:flex; align-items:center; justify-content:center; color:#fff;
          box-shadow:0 3px 10px rgba(37,99,235,0.28);
        }
        .cf-cam-close-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:7px 14px; border-radius:100px; border:none; cursor:pointer;
          font-size:12px; font-weight:700; color:#fff;
          background:linear-gradient(135deg,#f87171,#ef4444);
          box-shadow:0 4px 14px rgba(239,68,68,0.38);
          transition:all 0.2s;
        }
        .cf-cam-close-btn:active { transform:scale(0.95); }
        .cf-flip-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:7px 14px; border-radius:100px; border:none; cursor:pointer;
          font-size:12px; font-weight:700; color:#1e40af;
          background:rgba(255,255,255,0.88); backdrop-filter:blur(12px);
          border:1px solid rgba(147,197,253,0.5);
          box-shadow:0 2px 10px rgba(0,0,0,0.07);
          transition:all 0.2s;
        }
        .cf-flip-btn:active { transform:scale(0.95); }
        .cf-live-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 12px; border-radius:100px;
          font-size:11px; font-weight:800; letter-spacing:0.08em;
          color:#1e3a8a;
          background:rgba(255,255,255,0.88); backdrop-filter:blur(12px);
          border:1px solid rgba(147,197,253,0.5);
          box-shadow:0 2px 10px rgba(0,0,0,0.07);
        }
        .cf-analyzing-pill {
          display:inline-flex; align-items:center; gap:8px;
          padding:8px 20px; border-radius:100px;
          font-size:12px; font-weight:700; color:#fff;
          background:linear-gradient(135deg,rgba(30,58,138,0.92),rgba(37,99,235,0.92));
          backdrop-filter:blur(12px);
          box-shadow:0 6px 24px rgba(37,99,235,0.45);
          white-space:nowrap;
          animation:floatpill 2s ease-in-out infinite;
        }
        .cf-hands-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 14px; border-radius:100px;
          font-size:11px; font-weight:700; color:#1e40af;
          background:rgba(255,255,255,0.88); backdrop-filter:blur(12px);
          border:1px solid rgba(147,197,253,0.4);
          box-shadow:0 2px 10px rgba(0,0,0,0.06);
          white-space:nowrap;
          animation:floatpill 2.5s ease-in-out infinite;
        }
        .cf-close-panel-btn {
          position:absolute; top:16px; right:16px;
          width:32px; height:32px; border-radius:50%;
          background:rgba(255,255,255,0.85); border:1.5px solid #e2e8f0;
          display:flex; align-items:center; justify-content:center;
          color:#64748b; cursor:pointer; transition:all 0.2s;
          box-shadow:0 2px 8px rgba(0,0,0,0.06);
        }
        .cf-close-panel-btn:hover { color:#1e293b; background:#fff; }
      `}</style>

      <div className="cf-root flex flex-col gap-4 w-full">

        {/* ── SHORTCUT ROW ── */}
        <div className="flex items-center gap-3 flex-wrap" style={{ animation:'cf-up 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>
          <Link href="/dashboard/user/vocab" className="cf-shortcut">
            <BookMarked size={15} />
            คู่มือภาษามือ
          </Link>
        </div>

        {/* ── CAMERA CARD ── */}
        <div className="cf-card" style={{ padding: 10, position:'relative' }}>
          <div
            className="cf-camera-bg relative rounded-[22px] overflow-hidden"
            style={{ aspectRatio: isMobile ? "3/4" : "16/9" }}
          >
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            <canvas
              ref={canvasRef} width={1280} height={720}
              className={`absolute inset-0 w-full h-full rounded-[22px] ${!cameraOn ? "hidden" : ""}`}
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none", objectFit: "cover" }}
            />

            {/* Idle state */}
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <div className="cf-idle-icon"><IconCamera size={36} /></div>
                <button onClick={startCamera} className="cf-start-btn">
                  <IconCamera size={18} />เปิดกล้องเพื่อเริ่มแปลภาษามือ
                </button>
                <p style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>AI จะตรวจจับมือและแปลท่าทางให้อัตโนมัติ</p>
              </div>
            )}

            {/* Camera active overlays */}
            {cameraOn && (
              <>
                <div className="cf-scanline" />
                {[
                  { top:'14px', left:'14px',  borderTop:'3px', borderLeft:'3px',  borderRadius:'10px 0 0 0' },
                  { top:'14px', right:'14px', borderTop:'3px', borderRight:'3px', borderRadius:'0 10px 0 0' },
                  { bottom:'14px', left:'14px',  borderBottom:'3px', borderLeft:'3px',  borderRadius:'0 0 0 10px' },
                  { bottom:'14px', right:'14px', borderBottom:'3px', borderRight:'3px', borderRadius:'0 0 10px 0' },
                ].map((style, i) => (
                  <div key={i} className="cf-corner" style={style as any} />
                ))}

                {isAnalyzing && (
                  <div className="cf-analyzing-pill" style={{ position:'absolute', top:16, left:'50%' }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:'#93c5fd', animation:'pulse 1.2s infinite', display:'inline-block' }} />
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
                    <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', animation:'pulse 1.5s infinite', display:'inline-block', boxShadow:'0 0 6px rgba(16,185,129,0.8)' }} />
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
            {confidence > 0 && (
              <span className="cf-conf-badge">✦ {confidence}% แม่นยำ</span>
            )}
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
                <span style={{
                  position:'absolute', inset:-6, borderRadius:'50%',
                  border:'2px solid rgba(239,68,68,0.4)',
                  animation:'ripple 1s infinite',
                }} />
              )}
              {isRecording ? <IconMicOff size={15} /> : <IconMic size={15} />}
            </button>
            <button
              onClick={() => sendReply(replyText)}
              disabled={!replyText.trim()}
              className="cf-icon-btn send-btn"
            >
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
                    ref={replyVideoRef}
                    src={replyVideoUrl}
                    loop playsInline
                    className="w-full block"
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
                    target="_blank" rel="noopener noreferrer"
                    className="cf-ext-link"
                  >
                    ค้นหาบน th-sl.com →
                  </a>
                </div>
              )}

              {replyVideoUrl && !videoError && (
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
                  <button onClick={handleVideoPlay} className="cf-replay-btn">
                    <IconPlay size={13} />เล่นซ้ำ
                  </button>
                  <a href={replyVideoUrl} download className="cf-dl-btn">
                    ⬇ ดาวน์โหลด
                  </a>
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