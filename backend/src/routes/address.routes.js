const express = require("express");
const router = express.Router();
const {
  getDefaultAddressUser,
  getAllAddressesUser,
  addAddressUser,
  deleteAddressUser,
  getAdminAllAddresses,
  updateAddressForAdminController,
  deleteAddressForAdminController,
} = require("../controllers/address.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Route để lấy địa chỉ mặc định
router.get("/default", authenticateToken, getDefaultAddressUser);

// ĐỔI LẠI THÀNH DẤU "/" ĐỂ BÊN REACT GỌI get("/addresses") LÀ NÓ ĂN NGAY
router.get("/", authenticateToken, getAllAddressesUser);

// Route để thêm mới địa chỉ
router.post("/add-address", authenticateToken, addAddressUser);

// Route để xoá địa chỉ
router.delete("/:id", authenticateToken, deleteAddressUser);

// Route admin: lấy tất cả địa chỉ của tất cả người dùng
router.get("/admin/users-addresses", authenticateToken, getAdminAllAddresses);

router.put("/admin/:id", authenticateToken, updateAddressForAdminController);
router.delete("/admin/:id", authenticateToken, deleteAddressForAdminController);

module.exports = router;
