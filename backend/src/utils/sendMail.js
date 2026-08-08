const nodemailer = require("nodemailer");

// Cấu hình transporter để gửi email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm gửi email
const sendMail = async (toEmail, subject, textContext, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"HealthyGO Shop" <${process.env.EMAIL_USER}>`, // Tên người gửi
      to: toEmail, // Email người nhận
      subject: subject, // Tiêu đề thư
      text: textContext, // Nội dung dạng chữ thô (phòng hờ)
      html: htmlContent, // Nội dung dạng giao diện HTML cho đẹp
    });
    console.log("Đã gửi email thành công tới: " + toEmail);
    return info;
  } catch (error) {
    console.error("Lỗi khi gửi email: ", error);
    throw new Error("Không thể gửi email lúc này.");
  }
};

module.exports = { sendMail };
