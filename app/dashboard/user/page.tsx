"use client"; // บรรทัดที่ 1 ต้องเป็นอันนี้เท่านั้น ห้ามมีอะไรอยู่ข้างบน

import { useRouter } from "next/navigation";
import { 
  User, Bell, Camera, ChevronRight, Activity, 
  ShieldCheck, Clock, Award, Settings, LogOut 
} from "lucide-react";

export default function UserProfileDashboard() {
  const router = useRouter(); // ตัวช่วยในการเปลี่ยนหน้า

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 pb-16">
    
    {/* ===== HEADER ===== */}
    <div className="relative bg-gradient-to-br from-blue-600 to-slate-900 h-72 rounded-b-[3rem] px-8 pt-10 text-white overflow-hidden">
      
      {/* Glass overlay glow */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>

      <div className="relative z-10 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          โปรไฟล์ผู้ใช้
        </h1>

        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition">
          <Bell className="opacity-90" size={20} />
        </div>
      </div>

      {/* Decorative futuristic glow */}
      <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>
    </div>

    <div className="max-w-md mx-auto px-6 -mt-28 space-y-8">
      
      {/* ===== PROFILE CARD ===== */}
      <div className="relative bg-white/70 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[2.5rem] p-6 flex items-center gap-5 transition hover:shadow-blue-200/40">
        
        {/* Avatar */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
          <User size={36} className="text-slate-400" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            ธนกฤต มณีรัตน์
          </h2>
          <span className="mt-1 inline-block text-[11px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold tracking-wide">
            เลเวล 5
          </span>
        </div>
      </div>

      {/* ===== AI TRANSLATOR BUTTON ===== */}
      <button
        onClick={() => router.push("/dashboard/user/translate")}
        className="group relative w-full overflow-hidden rounded-[2.5rem] p-[1px] bg-gradient-to-r from-blue-500 to-slate-900 transition hover:scale-[1.02]"
      >
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-6 flex items-center justify-between border border-white/10">
          
          <div className="flex items-center gap-4">
            
            {/* AI Camera Icon Box */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
              <Camera size={26} className="text-white" />

              {/* Scanner animation line */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute w-full h-[2px] bg-white/40 animate-pulse top-1/2"></div>
              </div>
            </div>

            <div className="text-left">
              <p className="font-bold text-white text-base tracking-wide">
                เครื่องมือแปลภาษามือ
              </p>
              <p className="text-xs text-slate-400">
                เริ่มต้นใช้งาน AI Scanner
              </p>
            </div>
          </div>

          <ChevronRight 
            size={22} 
            className="text-slate-500 group-hover:translate-x-1 transition-transform" 
          />
        </div>
      </button>

      {/* ===== STATS SECTION ===== */}
      <div className="grid grid-cols-2 gap-5">
        
        {/* Translations */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-lg hover:shadow-blue-100 transition">
          <Activity className="text-blue-500 mb-3" size={22} />
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            แปลแล้ว
          </p>
          <p className="text-2xl font-extrabold text-slate-800">
            1,240 ครั้ง
          </p>
        </div>

        {/* Accuracy */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-lg hover:shadow-emerald-100 transition">
          <ShieldCheck className="text-emerald-500 mb-3" size={22} />
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            ความแม่นยำ
          </p>
          <p className="text-2xl font-extrabold text-slate-800">
            98.4%
          </p>
        </div>
      </div>
{/* ===== LOGOUT BUTTON ===== */}
<button
  onClick={() => router.push("/login")}
  className="group relative w-full overflow-hidden rounded-[2.5rem] p-[1px] bg-gradient-to-r from-red-500/80 to-rose-600/80 mt-6 transition hover:scale-[1.02]"
>
  <div className="flex items-center justify-between bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] px-6 py-5 shadow-lg hover:bg-white/90 transition-all duration-300">
    
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md group-hover:scale-110 transition">
        <LogOut size={22} className="text-white" />
      </div>

      <div className="text-left">
        <p className="font-bold text-slate-800 tracking-wide">
          ออกจากระบบ
        </p>
        <p className="text-xs text-slate-500">
          ลงชื่อออกจากบัญชีผู้ใช้
        </p>
      </div>
    </div>

    <ChevronRight
      size={20}
      className="text-slate-400 group-hover:translate-x-1 transition-transform"
    />
  </div>
</button>
    </div>
  </div>
);

}