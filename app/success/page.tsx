"use client";
import Link from "next/link";

export default function Success(){
  return(
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          🎉 ยินดีด้วย!
        </h1>
        <p className="mb-6">สมัครสมาชิกสำเร็จแล้ว</p>

        <Link href="/login"
          className="w-full inline-block py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
          กลับเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}