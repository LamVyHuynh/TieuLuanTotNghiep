import { createContext, useState } from "react";

const CheckoutContext = createContext();

const CheckoutProvider = ({ children }) => {
  const [checkoutList, setCheckoutList] = useState([]);

  const addToPayment = (products) => {
    // Nếu nó không phải là một mảng thì, gán cho nó mảng
    if (!Array.isArray(products)) {
      setCheckoutList([products]);
    } else {
      // Lưu ý: Checkout thường chỉ là 1 danh sách tạm thời
      // hoặc chỉ là 1 sản phẩm đang chờ thanh toán
      setCheckoutList(products);
    }
  };

  const clearCheckout = () => setCheckoutList([]);

  return (
    <CheckoutContext.Provider
      value={{ checkoutList, addToPayment, clearCheckout }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export { CheckoutContext, CheckoutProvider };
