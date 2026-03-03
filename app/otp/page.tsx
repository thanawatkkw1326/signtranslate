"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const supabase = createClient();

export default function Verify() {
  const router = useRouter();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorAnim, setErrorAnim] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("verifyEmail");
    if (!saved) {
      router.push("/register");
    } else {
      setEmail(saved);
    }
  }, [router]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeParam?: string) => {
    const code = codeParam || otp.join("");
    if (code.length !== 6) return;

    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setErrorAnim(true);
      setErrorMsg("รหัส OTP ไม่ถูกต้อง");
      setTimeout(() => setErrorAnim(false), 500);
      setLoading(false);
      return;
    }

    localStorage.removeItem("verifyEmail");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 px-4">
      <motion.div
        animate={errorAnim ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center"
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-800">ยืนยันตัวตน</h2>

        <p className="text-sm mb-6 text-gray-600">
          กรอกรหัส OTP ที่ส่งไปยัง <br />
          <span className="font-semibold text-blue-600">{email}</span>
        </p>

        <div className="flex justify-center gap-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              // @ts-ignore
              // @ts-ignore
ref={(el: any) => { if (el) inputs.current[index] = el; }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="w-12 h-14 text-xl text-center border rounded-xl focus:ring-4 focus:ring-blue-400 transition outline-none text-black"
            />
          ))}
        </div>

        {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

        <button
          onClick={() => handleVerify()}
          disabled={loading}
          className="w-full py-3 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:scale-105 transition"
        >
          {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
        </button>
      </motion.div>
    </div>
  );
}