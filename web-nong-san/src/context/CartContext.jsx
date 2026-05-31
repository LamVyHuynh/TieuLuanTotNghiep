import { useState, createContext, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // 1. DÙNG useCallback BỌC HÀM NÀY LẠI
  const fetchCart = useCallback(async () => {
    // Check xem thẻ token có tồn tại không
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setCartItems([]); // Nếu không có token, đặt giỏ hàng rỗng // Đéo gọi API nữa
      return;
    }

    try {
      // Gọi API để lấy giỏ hàng của người dùng
      const res = await axiosClient.get("/cart");
      // gắn data trả về từ backend vào state
      setCartItems(res.data.cartItems || []);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      // Nếu lỗi cho giỏ hàng rỗng
      setCartItems([]);
    }
  }, []);
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

  const updateCartQuantity = async (id_product, newQuantity) => {
    if (newQuantity < 1) return; // Không cho cập nhật số lượng nhỏ hơn 1

    try {
      await axiosClient.put("/cart/update-cart", {
        id_product: id_product,
        newQuantity: newQuantity,
      });
      fetchCart(); // Cập nhật lại giỏ hàng sau khi thay đổi số lượng
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật số lượng sản phẩm trong giỏ hàng:",
        error,
      );
    }
  };

  const removeProductCart = async (id) => {
    try {
      await axiosClient.delete(`/cart/remove/${id}`);
      fetchCart(); // Cập nhật lại giỏ hàng sau khi xóa sản phẩm
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        setCartItems,
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
