"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
  Video,
} from "lucide-react";

type AlertType = "success" | "error" | null;

function Alert({ type, message }: { type: AlertType; message: string }) {
  if (!type) return null;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium ${
        type === "success"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
          : "bg-rose-50 text-rose-600 border border-rose-100"
      }`}
    >
      {type === "success" && <Check size={16} />}
      {message}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-600 mb-2 block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-slate-800"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function UserSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameAlert, setNameAlert] = useState<{ type: AlertType; msg: string }>({ type: null, msg: "" });

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwAlert, setPwAlert] = useState<{ type: AlertType; msg: string }>({ type: null, msg: "" });

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarAlert, setAvatarAlert] = useState<{ type: AlertType; msg: string }>({ type: null, msg: "" });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      setUserId(user.id);
      const name = profile?.full_name ?? "";
      setUserName(name);
      setNewName(name);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
      setLoading(false);
    };
    init();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile || !userId) return;
    setAvatarLoading(true);
    setAvatarAlert({ type: null, msg: "" });
    try {
      const ext = avatarFile.name.split(".").pop();
      const path = `avatars/${userId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", userId);
      if (updateError) throw updateError;

      setAvatarUrl(urlData.publicUrl);
      setAvatarFile(null);
      setAvatarAlert({ type: "success", msg: "บันทึกรูปโปรไฟล์เรียบร้อย" });
    } catch (err: any) {
      setAvatarAlert({ type: "error", msg: err.message ?? "เกิดข้อผิดพลาด" });
    }
    setAvatarLoading(false);
  };

  const handleSaveName = async () => {
    if (!userId || !newName.trim()) return;
    setNameLoading(true);
    setNameAlert({ type: null, msg: "" });
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: newName.trim() })
      .eq("id", userId);
    if (error) {
      setNameAlert({ type: "error", msg: error.message });
    } else {
      setUserName(newName.trim());
      setNameAlert({ type: "success", msg: "บันทึกชื่อเรียบร้อย" });
    }
    setNameLoading(false);
  };

  const handleChangePassword = async () => {
    if (!newPw || !confirmPw) return;
    if (newPw !== confirmPw) { setPwAlert({ type: "error", msg: "รหัสผ่านใหม่ไม่ตรงกัน" }); return; }
    if (newPw.length < 6) { setPwAlert({ type: "error", msg: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }); return; }
    setPwLoading(true);
    setPwAlert({ type: null, msg: "" });
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      setPwAlert({ type: "error", msg: error.message });
    } else {
      setPwAlert({ type: "success", msg: "เปลี่ยนรหัสผ่านเรียบร้อย" });
      setNewPw(""); setConfirmPw("");
    }
    setPwLoading(false);
  };

  const displayAvatar = avatarPreview ?? avatarUrl;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-slate-100/80 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard/user">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-600">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Video size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">ตั้งค่าบัญชี</h1>
            <p className="text-xs text-slate-400">ผู้ใช้งาน: <span className="font-semibold text-sky-600">{userName}</span></p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Avatar */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
            <Camera size={18} className="text-sky-500" /> รูปโปรไฟล์
          </h2>
          <div className="flex flex-col items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              {displayAvatar ? (
                <img src={displayAvatar} className="w-28 h-28 rounded-full object-cover ring-4 ring-sky-100" alt="avatar" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-4xl font-black text-white ring-4 ring-sky-100">
                  {userName.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="text-sm text-slate-400 text-center">คลิกที่รูปเพื่อเลือกภาพใหม่<br />(JPG, PNG, WebP ขนาดไม่เกิน 5MB)</p>
            <Alert type={avatarAlert.type} message={avatarAlert.msg} />
            {avatarFile && (
              <button
                onClick={handleSaveAvatar}
                disabled={avatarLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-sky-400 hover:to-blue-500 transition disabled:opacity-60 shadow-lg shadow-blue-200"
              >
                {avatarLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                บันทึกรูปภาพ
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
            <User size={18} className="text-sky-500" /> แก้ไขชื่อผู้ใช้
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 block">ชื่อที่แสดง</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="กรอกชื่อของคุณ"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-slate-800 font-medium"
              />
            </div>
            <Alert type={nameAlert.type} message={nameAlert.msg} />
            <button
              onClick={handleSaveName}
              disabled={nameLoading || !newName.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-sky-400 hover:to-blue-500 transition disabled:opacity-60 shadow-lg shadow-blue-200"
            >
              {nameLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              บันทึกชื่อ
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h2 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
            <Lock size={18} className="text-sky-500" /> เปลี่ยนรหัสผ่าน
          </h2>
          <div className="space-y-4">
            <PasswordField label="รหัสผ่านใหม่" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(!showNew)} />
            <PasswordField label="ยืนยันรหัสผ่านใหม่" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
            <Alert type={pwAlert.type} message={pwAlert.msg} />
            <button
              onClick={handleChangePassword}
              disabled={pwLoading || !newPw || !confirmPw}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-sky-400 hover:to-blue-500 transition disabled:opacity-60 shadow-lg shadow-blue-200"
            >
              {pwLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}