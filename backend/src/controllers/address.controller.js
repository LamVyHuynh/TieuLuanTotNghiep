const {
  getDefaultAddress,
  getAllAddresses,
  addAddress,
  deleteAddress,
  getAllAddressesForAdmin,
} = require("../services/address.service");

// 1. IMPORT MÁY DỊCH MÃ
const { encodeId, decodeId } = require("../../utils/hashid.util");
const { get } = require("../routes/address.routes");

async function getDefaultAddressUser(req, res) {
  try {
    // Lấy id usser từ token đã được xác thực (ID thật)
    const userId = req.user.id;

    const defaultAddress = await getDefaultAddress(userId);

    if (defaultAddress) {
      // BỌC THÉP CHIỀU RA: Mã hoá id_address
      const safeAddress = {
        ...defaultAddress,
        id_address: encodeId(defaultAddress.id_address),
      };

      res.status(200).json({ success: true, data: safeAddress });
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
    const addresses = await getAllAddresses(userId);

    // BỌC THÉP CHIỀU RA: Mã hoá toàn bộ danh sách địa chỉ
    const safeAddresses = addresses.map((addr) => ({
      ...addr,
      id_address: encodeId(addr.id_address),
    }));

    res.status(200).json({ success: true, data: safeAddresses });
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

    const newAddressId = await addAddress(userId, addressData); // Trả về ID thật

    // BỌC THÉP CHIỀU RA: Mã hoá ID vừa thêm mới
    res
      .status(201)
      .json({ success: true, data: { id: encodeId(newAddressId) } });
  } catch (error) {
    console.error("Lỗi thêm địa chỉ mới:", error);
    res.status(500).json({ message: "Lỗi server khi thêm địa chỉ" });
  }
}

// Hàm xoá địa chỉ vào controller
const deleteAddressUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // GIẢI MÃ CHIỀU VÀO TỪ URL (Chữ -> Số)
    const realAddressId = decodeId(req.params.id);

    if (!realAddressId) {
      return res
        .status(400)
        .json({ success: false, message: "ID địa chỉ không hợp lệ" });
    }

    const isDeleted = await deleteAddress(realAddressId, userId);

    if (isDeleted) {
      res.status(200).json({ success: true, message: "Địa chỉ đã được xoá" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy địa chỉ để xoá" });
    }
  } catch (error) {
    console.error("Lỗi xoá địa chỉ:", error);
    res.status(500).json({ message: "Lỗi server khi xoá địa chỉ" });
  }
};

// Trang admin: lấy tất cả địa chỉ của tất cả người dùng
async function getAdminAllAddresses(req, res) {
  try {
    const addresses = await getAllAddressesForAdmin();

    const safeAddresses = addresses.map((addr) => ({
      ...addr,
      id_address: encodeId(addr.id_address),
      user_id: encodeId(addr.user_id),
    }));
    res.status(200).json({ success: true, data: safeAddresses });
  } catch (error) {
    console.error("Lỗi lấy tất cả địa chỉ cho admin:", error);

    res.status(500).json({ message: "Lỗi server khi lấy địa chỉ" });
  }
}
module.exports = {
  getDefaultAddressUser,
  getAllAddressesUser,
  addAddressUser,
  deleteAddressUser,
  getAdminAllAddresses,
};
