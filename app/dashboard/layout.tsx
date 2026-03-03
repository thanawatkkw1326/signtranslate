"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import React, { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // ใช้ useEffect เพื่อเช็กว่า Component พร้อมทำงานบน Browser หรือยัง (ป้องกัน Hydration Error)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-900 font-sans">
      {/* --- CLEAN LAYOUT ---
          ลบ Floating Bottom Nav และ Header ออกถาวรแล้ว
          เพื่อให้แต่ละหน้า (Page) แสดงผลดีไซน์ของตัวเองได้เต็มที่
      */}

      <main className="relative">
        {children}
      </main>

      {/* พื้นหลังแบบจางๆ เพื่อความสวยงามของภาพรวม */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      </div>
    </div>
  );
}