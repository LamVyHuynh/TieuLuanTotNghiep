import { useState, createContext } from "react";
const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity) => {
    // Kiểm tra xem sản phẩm đó đã tồn tại trong giỏ hàng chưa prevItems.find((item) => item.id === product.id)
    // Nếu đã tồn tại thì sẽ dùng map chạy trong prevItem kiểm tra trùng id
    // Vì hàng đã tồn tại trong vỏ, nên chỉ có thể cập nhật số lượng của hàng mà thoi ...item, quantity: item.quantity + quantity
    // Hoặc không thay đổi gì cả hàng vẫn giữ nguyên như lúc mới thêm
    // Nếu chưa tổn tại thì sẽ lấy prevItems của thêm product mới vàng vào giỏ hàng [...prevItems, { ...product, quantity }]
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Tiến hành kiểm tra xem có khác id với nhau không dùng filter để mà lọc
  // Khác thì giữa lại, giống thì bỏ đi
  const removeProductCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id, nextQuantity) => {
    if (nextQuantity <= 0) {
      removeProductCart(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: nextQuantity } : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeProductCart, updateCartQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
