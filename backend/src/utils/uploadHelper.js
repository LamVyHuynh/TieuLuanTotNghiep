// ===== TỰ ĐỘNG HOÁ VIỆC ĐƯA ẢNH LÊN SUPABASE KHI NGƯỜI DÙNG CẬP NHẬT ẢNH ĐẠI DIỆN =====
// Đầu tiên Kết nối với supabaseCLient
// file supabaseClient.js đã được tạo ra để kết nối với supabase
const supabase = require("../config/supabaseClient");

// Import thư viện path để xử lý đường dẫn
const path = require("path");

const uploadToSupabase = async (file, folderName) => {
  // Tạo nên tên gốc của file với thời gian hiện tại để tránh trùng lặp
  const ext = path.extname(file.originalname); // Lấy đuôi mở rộng của file gốc
  // Tạo tên file mới với định dạng: folderName-timestamp-random.ext
  const fileName = `${folderName}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const filePath = `${folderName}/${fileName}`; // Đường dẫn lưu trữ trong Supabase

  // Tải dữ liệu từ RAM lên kho chứa 'images' của Supabase
  const { data, error } = await supabase.storage
    .from("images")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false, // Không ghi đè nếu file đã tồn tại
    });

  if (error) {
    throw new Error(`Lỗi khi tải ảnh lên Supabase: ${error.message}`);
  }

  // 3. Lấy đường link công khai để có thể hiển thị trên web
  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);
  return publicUrlData.publicUrl;
};

module.exports = { uploadToSupabase };
