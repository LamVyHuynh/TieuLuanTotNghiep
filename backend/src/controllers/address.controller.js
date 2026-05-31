const {
  getDefaultAddress,
  getAllAddresses,
  addAddress,
} = require("../services/address.service");

async function getDefaultAddressUser(req, res) {
  try {
    // Lấy id usser từ token đã được xác thực
    const userId = req.user.id;

    const defaultAddress = await getDefaultAddress(userId);

    if (defaultAddress) {
      res.status(200).json({ success: true, data: defaultAddress });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy địa chỉ mặc định" });
    }
  } catch (error) {
    console.error("Lỗi lấy địa chỉ mặc định:", error);
    res.status(500).json({ message: "Lỗi server khi lấy địa chỉ" });
  }
}

// Hàm lấy tất cả địa chỉ của người dùng
async function getAllAddressesUser(req, res) {
  try {
    const userId = req.user.id;
    const address = await getAllAddresses(userId);
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    console.error("Lỗi lấy tất cả địa chỉ:", error);
    res.status(500).json({ message: "Lỗi server khi lấy địa chỉ" });
  }
}

// Hàm thêm mới địa chỉ cho người dùng
async function addAddressUser(req, res) {
  try {
    const userId = req.user.id;

    const addressData = req.body;

    const newAddressId = await addAddress(userId, addressData);
    res.status(201).json({ success: true, data: { id: newAddressId } });
  } catch (error) {
    console.error("Lỗi thêm địa chỉ mới:", error);
    res.status(500).json({ message: "Lỗi server khi thêm địa chỉ" });
  }
}
module.exports = {
  getDefaultAddressUser,
  getAllAddressesUser,
  addAddressUser,
};
