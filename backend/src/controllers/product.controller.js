const {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  getProductById,
} = require("../services/product.service");

// Đổi lại tên hàm import cho đúng với file utils của mày nhé
const { encodeId, decodeId } = require("../utils/hashid.util");
const { uploadToSupabase } = require("../utils/uploadHelper");

// Import thư viện xlsx để xử lý file Excel
const xlsx = require("xlsx");

const addProduct = async (req, res) => {
  try {
    const productData = req.body;

    const file = req.file; // Lấy file ảnh từ request
    if (file) {
      // Nếu có file ảnh, gọi hàm uploadToSupabase để tải ảnh lên Supabase
      const imageUrl = await uploadToSupabase(file, "products");
      productData.image_url = imageUrl; // Gán URL ảnh vào productData
    }

    // 1. Validate dữ liệu bắt buộc
    if (!productData.name || !productData.price || !productData.id_category) {
      return res.status(400).json({
        message:
          "Thiếu thông tin rồi! Phải có tên, giá, danh mục và cửa hàng nhé!",
      });
    }

    // LƯU Ý: Nếu lúc thêm, React gửi id_category là chuỗi Hash, thì mày phải decodeId(productData.id_category) ở đây.
    // Tạm thời tao giữ nguyên ép kiểu số cho mày:
    const cleanProductData = {
      ...productData,
      id_category:
        typeof productData.id_category === "string"
          ? decodeId(productData.id_category) || productData.id_category
          : productData.id_category,
      price: parseFloat(productData.price),
      discount_price: productData.discount_price
        ? parseFloat(productData.discount_price)
        : null,
      stock_quantity: parseInt(productData.stock_quantity) || 0,
      calories: parseInt(productData.calories) || 0,
      protein: parseFloat(productData.protein) || 0,
      carbs: parseFloat(productData.carbs) || 0,
      fat: parseFloat(productData.fat) || 0,
    };

    // 3. Gọi service để lưu vào DB (nhận về ID thật)
    const newProductId = await createProduct(cleanProductData);

    // 4. MÃ HOÁ ID TRƯỚC KHI TRẢ VỀ CHO REACT
    res.status(201).json({
      message:
        "Thêm sản phẩm thành công! Database đã nhận đủ chỉ số dinh dưỡng.",
      productId: encodeId(newProductId), // Encode chỗ này!
    });
  } catch (error) {
    console.error("Lỗi thêm sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi server rồi ba ơi!",
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts(); // Trả về mảng chứa id thật

    // BỌC THÉP CHIỀU RA: Mã hoá toàn bộ id_product (và id_category)
    const safeProducts = products.map((item) => ({
      ...item,
      id_product: encodeId(item.id_product),
      id_category: encodeId(item.id_category),
    }));

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công!",
      products: safeProducts, // Trả mảng đã mã hoá về
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách món!", error: error.message });
  }
};

// Xoá sản phẩm
const deleteSanPham = async (req, res) => {
  try {
    const productId = decodeId(req.params.id); // DỊCH CHIỀU VÀO TỪ URL
    if (!productId)
      return res.status(400).json({ message: "ID không hợp lệ!" });

    const success = await deleteProduct(productId);
    if (success) {
      res.status(200).json({
        message: "Xoá sản phẩm thành công!",
        deletedProductId: req.params.id, // Trả về lại cái ID chuỗi để UI biết đường xoá
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm để xoá!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi xoá sản phẩm!", error: error.message });
  }
};

const updateInfoProduct = async (req, res) => {
  try {
    const productId = decodeId(req.params.id); // DỊCH CHIỀU VÀO TỪ URL

    if (req.file) {
      // Nếu có file ảnh, gọi hàm uploadToSupabase để tải ảnh lên Supabase
      const imageUrl = await uploadToSupabase(req.file, "products");
      req.body.image_url = imageUrl; // Gán URL ảnh vào productData
    }
    if (!productId)
      return res.status(400).json({ message: "ID không hợp lệ!" });

    const productData = req.body;

    // LƯU Ý: Decode id_category nếu client gửi lên chữ
    const safeUpdateData = { ...productData };
    if (typeof safeUpdateData.id_category === "string") {
      safeUpdateData.id_category =
        decodeId(safeUpdateData.id_category) || safeUpdateData.id_category;
    }

    const success = await updateProduct(productId, safeUpdateData);
    if (success) {
      res.status(200).json({
        message: "Cập nhật sản phẩm thành công!",
        data: { id_product: req.params.id, ...productData }, // Trả về ID chuỗi cho React
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật!" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật sản phẩm!",
      error: error.message,
    });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const realProductID = decodeId(req.params.id); // DỊCH CHIỀU VÀO TỪ URL

    if (!realProductID) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    const product = await getProductById(realProductID);

    if (product) {
      // BỌC THÉP CHIỀU RA: Mã hoá ID trước khi gửi cho FrontEnd
      const safeProduct = {
        ...product,
        id_product: encodeId(product.id_product),
        id_category: encodeId(product.id_category),
      };

      res.status(200).json({
        message: "Lấy chi tiết sản phẩm thành công!",
        product: safeProduct,
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết sản phẩm!",
      error: error.message,
    });
  }
};

/// Hàm import từ file Excel
const importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn một file Excel hoặc CSV!" });
    }

    let workbook;

    // Kiểm tra xem multer đang lưu file ở đâu (RAM hay Ổ cứng)
    if (req.file.buffer) {
      workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    } else if (req.file.path) {
      workbook = xlsx.readFile(req.file.path);
    } else {
      return res
        .status(400)
        .json({ message: "Định dạng file tải lên không hợp lệ!" });
    }

    const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      return res.status(400).json({ message: "File của bạn đang trống rỗng!" });
    }

    let successCount = 0;
    let errorCount = 0;

    // Lặp qua từng dòng dữ liệu trong file Excel
    for (const row of sheetData) {
      try {
        // 1. Lấy dữ liệu cột "Danh mục" (Bây giờ nó có dạng: "Salad - [ID: 1]")
        const rawCategoryStr = row["Danh mục"];
        let realCategoryId = null;

        if (rawCategoryStr && typeof rawCategoryStr === "string") {
          // Mổ chuỗi: Tìm đoạn chữ nằm trong [ID: ...]
          const match = rawCategoryStr.match(/\[ID:\s*(.+)\]/);
          if (match && match[1]) {
            const extractedId = match[1].trim(); // Lấy được số 1 (hoặc mã nr4PkzEo)
            realCategoryId = decodeId(extractedId) || extractedId;
          } else {
            // Lỡ người dùng tự gõ tay đúng mỗi cái ID
            realCategoryId = decodeId(rawCategoryStr) || rawCategoryStr;
          }
        } else {
          realCategoryId = rawCategoryStr;
        }

        // 2. Map dữ liệu chuẩn bị lưu
        const productData = {
          name: row["Tên món ăn"],
          id_category: realCategoryId, // 👈 Gắn ID vừa mổ được vào đây
          price: parseFloat(row["Giá gốc"]) || 0,
          discount_price: parseFloat(row["Giá giảm"]) || null,
          unit: row["Đơn vị"] || "phần",
          stock_quantity: parseInt(row["Tồn kho"]) || 0,
          calories: parseInt(row["Calo"]) || 0,
          protein: parseFloat(row["Đạm"]) || 0,
          carbs: parseFloat(row["Carb"]) || 0,
          fat: parseFloat(row["Béo"]) || 0,
          description: row["Mô tả"] || "",
          image_url: "",
        };

        // Bỏ qua nếu thiếu trường bắt buộc
        if (
          !productData.name ||
          !productData.price ||
          !productData.id_category
        ) {
          errorCount++;
          continue;
        }

        await createProduct(productData);
        successCount++;
      } catch (error) {
        console.error("Lỗi dòng:", row, error.message);
        errorCount++;
      }
    }

    res.status(200).json({
      message: `Import hoàn tất! Thành công: ${successCount} món. Lỗi/Bỏ qua: ${errorCount} món.`,
    });
  } catch (error) {
    console.error("Lỗi import file:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi đọc file!", error: error.message });
  }
};

module.exports = {
  addProduct,
  getProducts,
  deleteSanPham,
  updateInfoProduct,
  getProductDetail,
  importProducts,
};
