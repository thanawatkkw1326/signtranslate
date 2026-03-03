import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // ✅ ต้องเติม await หน้า cookies() สำหรับ Next.js 15+
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            // ✅ cookieStore ที่ await มาแล้วจะใช้ .set() ได้ปกติ
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // ข้าม Error กรณีเรียกใช้ใน Server Component ที่แก้ไข cookie ไม่ได้
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // ข้าม Error
          }
        },
      },
    }
  );
}