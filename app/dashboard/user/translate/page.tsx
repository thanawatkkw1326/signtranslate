// ตัวอย่างไฟล์ app/dashboard/user/translate/page.tsx
"use client"
import CameraFeed from "@/components/camera-feed"
import { useState } from "react"

export default function TranslatePage() {
  const [translations, setTranslations] = useState<any[]>([])
  
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-black text-blue-600 mb-6">ระบบแปลภาษามือเรียลไทม์</h1>
      <CameraFeed 
        onTranslation={(newEntry) => setTranslations(prev => [newEntry, ...prev])} 
        recentTranslations={translations} 
      />
    </div>
  )
}