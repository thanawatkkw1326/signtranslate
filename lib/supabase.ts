import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ต้องมีคำว่า export const เพื่อให้ไฟล์อื่นเรียกใช้ได้
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);