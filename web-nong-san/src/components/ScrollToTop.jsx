// Dùng để chạy đoạn code khi nó có sự thay đổi
//  nắm bắt được sự thay đổi của URL, khi URL thay đổi thì sẽ chạy đoạn code bên trong useEffect
import { useEffect } from "react";

// Lấy thông tin từ URL hiện tại, cho biết đang ở đâu
// pathname không phải là nguyên cái URL mà nó là  phần sau URL
// ví dụ URL là http://localhost:3000/order thì pathname sẽ là /order
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const pathname = useLocation().pathname;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default ScrollToTop;
