const register = async (req, res) => {
  try {
    // lệnh throw này dùng để thử lỗi, nếu gặp  thì tất cả những câu lệnh phía dưới nó đều không chạy
    //  Nó sẽ dừng lại ngay lập tức và chuyển qua catch để xử lý lỗi
    // throw new Error("This is a test error");

    res.status(201).json({
      message: "Register successful",
      data: req.body,
    });
  } catch (error) {
    res.status(500).json({
      messagse: "Server error",
      error: error.message,
    });
  }
};
module.exports = { register };
