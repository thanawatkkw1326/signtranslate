"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function RegisterSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        <Image
          src="/logo.png"
          alt="SIGN TRANSLATE"
          width={90}
          height={90}
          className="mx-auto mb-4"
        />

        <h1 className="text-2xl font-bold text-green-600 mb-3">
          สมัครสมาชิกสำเร็จ 🎉
        </h1>

        <p className="text-slate-600 mb-6">
          บัญชีของคุณได้รับการยืนยันเรียบร้อยแล้ว
        </p>

        <Link
          href="/login"
          className="inline-block w-full py-3 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold"
        >
          กลับเข้าสู่ระบบ
        </Link>
      </motion.div>
    </div>
  );
}