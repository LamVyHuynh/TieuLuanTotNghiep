const express = require("express");
const router = express.Router();
const {
  getDefaultAddressUser,
  getAllAddressesUser,
  addAddressUser,
} = require("../controllers/address.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Route để lấy địa chỉ mặc định
router.get("/default", authenticateToken, getDefaultAddressUser);

// ĐỔI LẠI THÀNH DẤU "/" ĐỂ BÊN REACT GỌI get("/addresses") LÀ NÓ ĂN NGAY
router.get("/", authenticateToken, getAllAddressesUser);

// Route để thêm mới địa chỉ
router.post("/add-address", authenticateToken, addAddressUser);

module.exports = router;
