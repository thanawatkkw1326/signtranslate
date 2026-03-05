"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { 
  Users, Search, Mail, Hash, 
  ChevronRight, Filter, Trash2, ArrowLeft, Eye
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: string;
}

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "user")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (u.email?.toLowerCase().includes(searchLower)) ||
      (u.full_name?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
      {/* 1. เพิ่มปุ่มย้อนกลับไปหน้าแดชบอร์ด */}
      <Link 
        href="/dashboard/admin" 
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-500 hover:text-blue-600 font-bold text-sm rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-fit"
      >
        <ArrowLeft size={18} />
        กลับไปหน้าแดชบอร์ด
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-sky-500 p-8 rounded-3xl text-white shadow-lg shadow-blue-500/20">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users size={28} className="text-white" />
            </div>
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-blue-100 mt-2 text-sm font-medium">ตรวจสอบและดูแลข้อมูลสมาชิกทั้งหมดในระบบของคุณ</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex flex-col items-center">
          <span className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">ผู้ใช้ทั้งหมด</span>
          <span className="text-3xl font-black leading-none">{users.length}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-2 pl-4 rounded-full shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <Search className="text-slate-400 shrink-0 hidden md:block" size={20} />
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อ หรือ อีเมลผู้ใช้งาน..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-transparent text-slate-700 focus:outline-none placeholder:text-slate-400 font-medium"
        />
        <button className="w-full md:w-auto px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition flex items-center justify-center gap-2 shrink-0">
          <Filter size={18} />
          ตัวกรอง
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-medium text-sm">กำลังดึงข้อมูลสมาชิก...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Users className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-bold text-lg">ไม่พบรายชื่อผู้ใช้งาน</p>
            <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-widest font-black border-b border-slate-100">
                  <th className="px-8 py-5">ข้อมูลผู้ใช้งาน</th>
                  <th className="px-6 py-5">User ID</th>
                  <th className="px-6 py-5 text-center">วันที่สมัคร</th>
                  <th className="px-6 py-5 text-center">สถานะ</th>
                  <th className="px-8 py-5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-200 transition-all" alt="avatar" />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white font-black text-sm ring-2 ring-transparent group-hover:ring-blue-200 transition-all shadow-sm">
                              {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="min-w-0">
                          <Link href={`/dashboard/admin/users/${u.id}`} className="text-sm font-black text-slate-800 hover:text-blue-600 transition truncate block">
                            {u.full_name || u.email?.split('@')[0] || "Unknown"}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Mail size={12} />
                            <span className="truncate">{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-100/80 px-2.5 py-1.5 rounded-lg w-fit border border-slate-200">
                        <Hash size={12} className="text-slate-400" />
                        {u.id.slice(0, 13)}...
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-sm text-slate-700 font-bold">
                        {new Date(u.created_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {new Date(u.created_at).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })} น.
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-black tracking-wide rounded-full border border-emerald-200/60 shadow-sm">
                          ACTIVE
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                         {/* 2. เปลี่ยนปุ่มดูข้อมูลเป็น Link ไปยังหน้า Profile ของคนนั้น */}
                         <Link 
                           href={`/dashboard/admin/users/${u.id}`}
                           className="flex items-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-xl font-bold text-xs transition-colors"
                         >
                           <Eye size={16} />
                           ดูข้อมูล
                         </Link>
                         <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}