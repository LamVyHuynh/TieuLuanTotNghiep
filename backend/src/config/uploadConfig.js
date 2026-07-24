// Import thư viện multer để xử lý upload file
// Chuyên dụng để xử lí dữ liệu multipart/form-data(định dạng mà trình duyệt dùng để gửi file ảnh/video lên server)
//không có thì. nodejs không thể tải ảnh lên được
const multer = require("multer");

//xử lí đường dẫn
const path = require("path");

// công cụ cho phép nodejs tương tác với ổ cứng của máy tính (như tạo thư mục, xóa file, đọc file,...)
const fs = require("fs");

// Bước 1: Khai báo thư mục lưu trữ và tự động tạo nếu chưa có
// đi lùi ra khỏi thư mục 'src/config' và vào thư mục 'public/uploads'
const uploadDir = path.join(__dirname, "../../public/uploads/avatars");

// Kiểm tra thư mục có tồn tại hay không, nếu chưa có thì tạo mới
if (!fs.existsSync(uploadDir)) {
  // nếu chưa có thì tự động tạo thư mục. recursive: true tạo cả thư mục cha nếu chưa có
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Bước 2: Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
  // 2.1 Nơi cất file
  // destination: dùng để xác định thư mục nơi file tải lên sẽ được lưu trữ trên ổ đĩa máy chủ.
  destination: function (req, file, cb) {
    // cb là callback function, multer sẽ gọi hàm này để xác định nơi lưu file
    cb(null, uploadDir); // báo cho multer biết là lưu file vào uploadDir ở trên
  },

  // 2.2 Quy tắc đặt tên file
  filename: function (req, file, cb) {
    // lấy đuôi mở rộng của file gốc là .jpg, .png, ...
    const ext = path.extname(file.originalname);

    // Tạo một mã nguồn ngẫu nhiên kết hợp với thời gian hiện tại (Date.now()) để tránh trùng tên file khi upload
    // Mục đich: Đảm bảo tên là là duy nhất, tránh ghi đè lên file cũ
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Đặt tên mới cho file. Ví dụ: avatar-1690000000-123456.jpg
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

// Bước 3: Khởi tạo cỗ máy multer với cấu hình lưu trữ ở trên
const upload = multer({
  storage: storage,
  // (Bảo mật ) giới hạn kích thước file upload tối đâ là 5MB (5 * 1024 * 1024 bytes)
  limits: { fileSize: 5 * 1024 * 1024 },
  // (Bảo mật) chỉ cho phép upload các định dạng file ảnh phổ biến
});

// Xuất cỗ máy upload đẻ các file khác có thể sử dụng để upload ảnh
module.exports = upload;
