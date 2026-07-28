// Kết nối với thư viện Supabase
const { createClient } = require("@supabase/supabase-js");

// Lấy URL và Key từ biến môi trường
const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseURL || !supabaseKey) {
  console.error(
    "Supabase URL hoặc Key chưa được cấu hình trong biến môi trường(file .env).",
  );
}

// Khởi tạo máy khách để kết nối với đám mây
const supabase = createClient(supabaseURL, supabaseKey);

module.exports = supabase;
