"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, Cpu, Activity, MessageSquare,
  LogOut, Video, Zap, ChevronUp, ChevronDown, Clock, Eye,
} from "lucide-react";

function SideItem({ icon, label, active = false, href }: {
  icon: React.ReactNode; label: string; active?: boolean; href?: string;
}) {
  const content = (
    <div className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${
      active
        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`}>
      {active && <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20 rounded-2xl -z-10" />}
      {icon}
      <span className="hidden lg:block font-semibold">{label}</span>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function StatCard({ title, value, unit, icon, trend, trendValue }: {
  title: string; value: string | number; unit: string;
  icon: React.ReactNode; trend?: "up" | "down"; trendValue?: string;
}) {
  return (
    <div className="relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group border border-slate-100">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300 opacity-10 blur-3xl rounded-full group-hover:scale-150 transition-all duration-700" />
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gradient-to-br from-sky-50 to-blue-50 text-sky-600 rounded-2xl">{icon}</div>
        {trend && trendValue && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
          }`}>
            {trend === "up" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-1 font-medium">{title}</p>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
        <span className="text-sm text-slate-400 mb-0.5">{unit}</span>
      </div>
    </div>
  );
}

interface UserActivity {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  total_translations: number;
  last_active: string | null;
  joined_at: string;
}

// ปรับให้เรียงวันตาม getDay() ของ JavaScript (0 = อาทิตย์)
const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [adminName, setAdminName] = useState("Admin");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalTranslations: 0, accuracy: 99.2, activeUsers: 0, avgResponseTime: 0.4 });
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [chartRaw, setChartRaw] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [chartDays, setChartDays] = useState<string[]>(["", "", "", "", "", "", ""]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  
  // State สำหรับค้นหาผู้ใช้
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("full_name, avatar_url, role").eq("id", user.id).maybeSingle();

      if (profile?.role !== "admin") { router.replace("/dashboard/user"); return; }
      if (profile?.full_name) setAdminName(profile.full_name);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

      // ดึงข้อมูลภาพรวม (Stats) จากฐานข้อมูลจริง
      const { count: totalTranslations } = await supabase
        .from("translations").select("*", { count: "exact", head: true });

      const { count: activeUsers } = await supabase
        .from("profiles").select("*", { count: "exact", head: true }).eq("role", "user");

      // ดึงข้อมูลทำกราฟย้อนหลัง 7 วัน
      const now = new Date();
      const dynamicDays: string[] = [];
      const weekData = await Promise.all(
        Array.from({ length: 7 }, async (_, i) => {
          const d = new Date(now);
          d.setDate(d.getDate() - (6 - i));
          
          dynamicDays.push(DAYS[d.getDay()]); // เก็บชื่อวันให้ตรงกับความเป็นจริง

          const start = new Date(new Date(d).setHours(0, 0, 0, 0)).toISOString();
          const end = new Date(new Date(d).setHours(23, 59, 59, 999)).toISOString();
          const { count } = await supabase.from("translations")
            .select("*", { count: "exact", head: true })
            .gte("created_at", start).lte("created_at", end);
          return count ?? 0;
        })
      );
      
      setChartDays(dynamicDays);
      const maxVal = Math.max(...weekData, 1);
      setChartRaw(weekData);
      setChartData(weekData.map((v) => Math.round((v / maxVal) * 85) + 5));
      setStats({ totalTranslations: totalTranslations ?? 0, accuracy: 99.2, activeUsers: activeUsers ?? 0, avgResponseTime: 0.4 });
      setLoading(false);

      // ดึงข้อมูลผู้ใช้ลงตาราง
      const fetchUsers = async () => {
        setActivityLoading(true);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url, created_at, role")
          .eq("role", "user")
          .order("created_at", { ascending: false })
          .limit(20);

        if (profiles && profiles.length > 0) {
          const activities = await Promise.all(
            profiles.map(async (p) => {
              const { count } = await supabase
                .from("translations").select("*", { count: "exact", head: true }).eq("user_id", p.id);
              const { data: lastTx } = await supabase
                .from("translations").select("created_at").eq("user_id", p.id)
                .order("created_at", { ascending: false }).limit(1).maybeSingle();
              return {
                id: p.id,
                email: p.email,
                full_name: p.full_name,
                avatar_url: p.avatar_url,
                total_translations: count ?? 0,
                last_active: lastTx?.created_at ?? null,
                joined_at: p.created_at,
              } as UserActivity;
            })
          );
          // เรียงตามคนที่แปลเยอะสุดขึ้นก่อน
          activities.sort((a, b) => b.total_translations - a.total_translations);
          setUserActivity(activities);
        } else {
          setUserActivity([]);
        }
        setActivityLoading(false);
      };

      await fetchUsers();
    };

    init();
  }, []); // ลบ useEffect ตัวที่ 2 ที่ซ้ำซ้อนทิ้งไป ให้ทำในครั้งแรกครั้งเดียว

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) : String(n);
  const fmtUnit = (n: number) => n >= 1000 ? "K" : "";

  const fmtRelative = (iso: string | null) => {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ชม. ที่แล้ว`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} วันที่แล้ว`;
    return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

  const isActiveToday = (iso: string | null) =>
    !!iso && Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;

  const maxTx = Math.max(...userActivity.map((u) => u.total_translations), 1);

  // กรองผู้ใช้ด้วยช่องค้นหาแบบ Client-side (รวดเร็วทันใจ)
  const filteredUsers = userActivity.filter(u => 
    searchQuery === "" || 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20 text-slate-800">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col shrink-0 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Video size={20} />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-black tracking-wide">SIGNSPEAK</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SideItem icon={<LayoutDashboard size={20} />} label="แดชบอร์ด" active href="/dashboard/admin" />
          <SideItem icon={<Users size={20} />} label="ผู้ใช้งาน" href="/dashboard/admin/users" />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <Link href="/dashboard/admin/profile">
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition cursor-pointer">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/40" alt="avatar" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-sm font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{adminName}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-rose-400 hover:text-rose-300 px-3 py-2 w-full rounded-xl hover:bg-rose-500/10 transition"
          >
            <LogOut size={18} />
            <span className="hidden lg:block text-sm font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-slate-100/80 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">ภาพรวมระบบ</h2>
            <p className="text-sm text-slate-400">ยินดีต้อนรับ, <span className="font-semibold text-sky-600">{adminName}</span></p>
          </div>
          <Link href="/dashboard/admin/profile">
            <div className="cursor-pointer group">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-400/50 group-hover:ring-sky-500 transition" alt="avatar" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition">
                  {adminName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard title="การแปลทั้งหมด" value={loading ? "—" : fmt(stats.totalTranslations)} unit={loading ? "" : fmtUnit(stats.totalTranslations)} icon={<MessageSquare size={20} />} trend="up" trendValue="+12%" />
            <StatCard title="ความแม่นยำ AI" value={loading ? "—" : stats.accuracy} unit="%" icon={<Zap size={20} />} trend="up" trendValue="+0.3%" />
            <StatCard title="ผู้ใช้งานทั้งหมด" value={loading ? "—" : fmt(stats.activeUsers)} unit={loading ? "" : fmtUnit(stats.activeUsers)} icon={<Users size={20} />} trend="up" trendValue="+5%" />
            <StatCard title="เวลาตอบสนอง" value={loading ? "—" : stats.avgResponseTime} unit="s" icon={<Activity size={20} />} trend="down" trendValue="-0.05s" />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800">สถิติการแปล 7 วันล่าสุด</h3>
                <p className="text-sm text-slate-400">จำนวนครั้งรายวัน</p>
              </div>
              <span className="text-xs bg-sky-50 text-sky-600 font-semibold px-3 py-1.5 rounded-full border border-sky-100">รายสัปดาห์</span>
            </div>
            <div className="h-48 flex items-end gap-3">
              {chartData.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                  <div className="relative w-full">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition whitespace-nowrap pointer-events-none">
                      {chartRaw[i]} ครั้ง
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-sky-400 to-blue-500 rounded-2xl transition-all duration-700 hover:from-sky-300 hover:to-blue-400 cursor-pointer shadow-sm shadow-blue-200"
                      style={{ height: `${Math.max(h * 2, 8)}px` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{chartDays[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Activity Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Eye size={18} className="text-sky-500" />
                  การใช้งานของผู้ใช้
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">ดูข้อมูลจริงแบบ read-only • เรียงตามจำนวนการแปลมากสุด</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยอีเมล หรือชื่อ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all w-full md:w-64"
                  />
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-3 py-2 rounded-xl border border-emerald-100 flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                  Live
                </span>
              </div>
            </div>

            {activityLoading ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">กำลังโหลดข้อมูลผู้ใช้...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center">
                <Users size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400 font-medium">ไม่พบผู้ใช้งาน</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="grid grid-cols-12 px-8 py-3 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-4">ผู้ใช้งาน</div>
                  <div className="col-span-3">การแปล</div>
                  <div className="col-span-2 text-center">ใช้งานล่าสุด</div>
                  <div className="col-span-2 text-center">สมัครเมื่อ</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-slate-50/80">
                  {filteredUsers.map((u, idx) => (
                    <div key={u.id} className="grid grid-cols-12 px-8 py-4 items-center hover:bg-blue-50/30 transition-colors duration-150">
                      
                      {/* Rank */}
                      <div className="col-span-1 text-center">
                        {idx === 0 ? <span className="text-base">🥇</span> : 
                         idx === 1 ? <span className="text-base">🥈</span> : 
                         idx === 2 ? <span className="text-base">🥉</span> : 
                         <span className="text-sm font-bold text-slate-300">{idx + 1}</span>}
                      </div>

                      {/* User */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="relative shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} className="w-9 h-9 rounded-full object-cover" alt="avatar" />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                              style={{ background: `hsl(${(idx * 53 + 200) % 360}, 55%, 58%)` }}
                            >
                              {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          {isActiveToday(u.last_active) && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{u.full_name || u.email || "ไม่ระบุชื่อ"}</p>
                          <p className="text-xs text-slate-300 font-mono">{u.id.slice(0, 8)}…</p>
                        </div>
                      </div>

                      {/* Translations bar */}
                      <div className="col-span-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 w-8 shrink-0">{u.total_translations}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-700"
                              style={{ width: `${Math.max((u.total_translations / maxTx) * 100, 2)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Last active */}
                      <div className="col-span-2 text-center">
                        <span className={`text-xs font-medium flex items-center justify-center gap-1 ${
                          isActiveToday(u.last_active) ? "text-emerald-600" : "text-slate-400"
                        }`}>
                          <Clock size={11} />
                          {fmtRelative(u.last_active)}
                        </span>
                      </div>

                      {/* Joined */}
                      <div className="col-span-2 text-center text-xs text-slate-400 font-medium">
                        {new Date(u.joined_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                      </div>

                    </div>
                  ))}
                </div>

                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400">แสดง {filteredUsers.length} ผู้ใช้</p>
                  <Link href="/dashboard/admin/users">
                    <span className="text-xs text-sky-600 font-semibold hover:text-sky-700 transition">ดูทั้งหมด →</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}