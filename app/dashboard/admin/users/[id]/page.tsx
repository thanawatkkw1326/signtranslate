"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { 
  ArrowLeft, User, Mail, Calendar, Hash, 
  Activity, Languages, Clock, ShieldCheck 
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: string;
}

interface TranslationHistory {
  id: string;
  input_text: string;
  output_text: string;
  created_at: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const supabase = createClient();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [translations, setTranslations] = useState<TranslationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);

    // 1. ดึงข้อมูล Profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profileError && profileData) {
      setUser(profileData);
    }

    // 2. ดึงประวัติการแปล (ดึงมา 50 รายการล่าสุด)
    const { data: translationData, error: transError } = await supabase
      .from("translations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!transError && translationData) {
      setTranslations(translationData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">ไม่พบข้อมูลผู้ใช้งาน</h2>
        <Link href="/dashboard/admin/users" className="text-blue-600 hover:underline mt-4 inline-block">
          กลับไปหน้ารายชื่อ
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* ปุ่มย้อนกลับ */}
      <Link 
        href="/dashboard/admin/users" 
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-500 hover:text-blue-600 font-bold text-sm rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-fit"
      >
        <ArrowLeft size={18} />
        กลับไปหน้ารายชื่อผู้ใช้
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* คอลัมน์ซ้าย: ข้อมูลส่วนตัว */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card: Profile */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-sky-400"></div>
            
            <div className="relative mt-8 mb-4">
              {user.avatar_url ? (
                <img src={user.avatar_url} className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white shadow-md" alt="avatar" />
              ) : (
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-3xl border-4 border-white shadow-md">
                  {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-1 right-1/2 translate-x-10 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center">
                 <ShieldCheck size={12} className="text-white" />
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-800">
              {user.full_name || user.email?.split('@')[0] || "Unknown User"}
            </h2>
            <p className="text-sm font-medium text-slate-500 bg-slate-100 inline-block px-3 py-1 rounded-full mt-2">
              Role: {user.role.toUpperCase()}
            </p>

            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Mail size={16} /></div>
                <div>
                  <p className="text-slate-400 text-xs font-bold">อีเมล</p>
                  <p className="text-slate-700 font-medium truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Hash size={16} /></div>
                <div>
                  <p className="text-slate-400 text-xs font-bold">User ID</p>
                  <p className="text-slate-700 font-mono text-xs">{user.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={16} /></div>
                <div>
                  <p className="text-slate-400 text-xs font-bold">วันที่สมัครสมาชิก</p>
                  <p className="text-slate-700 font-medium">
                    {new Date(user.created_at).toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ประวัติการใช้งาน */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card: Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Languages size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-400">จำนวนการแปลทั้งหมด</p>
                <p className="text-2xl font-black text-slate-800">{translations.length} <span className="text-base font-medium text-slate-500">ครั้ง</span></p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Activity size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-400">สถานะการใช้งาน</p>
                <p className="text-xl font-black text-emerald-600">Active</p>
              </div>
            </div>
          </div>

          {/* Card: History Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                ประวัติการแปลล่าสุด
              </h3>
            </div>
            
            <div className="overflow-y-auto flex-1 p-0">
              {translations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <Languages size={32} className="text-slate-200" />
                  <p>ยังไม่มีประวัติการแปลภาษา</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                    <tr className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">ข้อความต้นฉบับ</th>
                      <th className="px-6 py-4">ผลลัพธ์การแปล</th>
                      <th className="px-6 py-4 text-right">เวลาที่แปล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {translations.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-700 max-w-[200px] truncate" title={t.input_text}>
                            {t.input_text}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-blue-600 font-medium max-w-[200px] truncate" title={t.output_text}>
                            {t.output_text}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-slate-400">
                            {new Date(t.created_at).toLocaleString("th-TH", { 
                              day: 'numeric', month: 'short', 
                              hour: '2-digit', minute: '2-digit' 
                            })} น.
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}