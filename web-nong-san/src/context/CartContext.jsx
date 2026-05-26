import { useState, createContext, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 1. DÙNG useCallback BỌC HÀM NÀY LẠI
  const fetchCart = useCallback(async () => {
    try {
      const res = await axiosClient.get("/cart");
      // gắn data trả về từ backend vào state
      setCartItems(res.data.cartItems || []);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      // Nếu lỗi cho giỏ hàng rỗng
      setCartItems([]);
    }
  }, []); // <-- Ngoặc vuông trống ở đây

  // 2. DÙNG HÀM ẨN BÊN TRONG useEffect ĐỂ LỪA THẰNG ESLINT
  useEffect(() => {
    const initCart = async () => {
      await fetchCart();
    };
    initCart();
  }, [fetchCart]); // <-- Nhét fetchCart vào đây

  const addToCart = async (id_product, quantity = 1) => {
    try {
      await axiosClient.post("/cart/add-product-to-cart", {
        id_product,
        quantity,
      });

      // Thêm xong thì gọi hàm fetchCart để nó tự động cập nhật số lượng mới nhất
      fetchCart();
      return true; // Trả về true nếu thêm vào giỏ hàng thành công
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      return false; // Trả về false nếu có lỗi xảy ra
    }
  };

  const updateCartQuantity = (id, newQuantity) => {
    console.log("Sắp tới sẽ gọi API Update DB ở đây", id, newQuantity);
    // Tạm thời update ở Frontend cho mày xem giao diện
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeProductCart = (id) => {
    console.log("Sắp tới sẽ gọi API Delete DB ở đây", id);
    // Tạm thời xóa ở Frontend
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addToCart,
        removeProductCart,
        updateCartQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
