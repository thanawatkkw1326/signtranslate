"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/update-password",
    });

    if (error) {
      setMessage("❌ เกิดข้อผิดพลาด กรุณาลองใหม่");
    } else {
      setMessage("✅ ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบอีเมล");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-blue-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-800">
            ลืมรหัสผ่าน
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            กรอกอีเมลของคุณเพื่อรับลิงก์ตั้งรหัสใหม่
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition"
          >
            {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
          </motion.button>
        </form>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6 text-sm text-blue-700"
          >
            {message}
          </motion.p>
        )}

        <div className="text-center mt-8 text-sm text-gray-600">
          <Link
            href="/login"
            className="text-green-600 font-semibold hover:underline"
          >
            ← กลับไปเข้าสู่ระบบ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}