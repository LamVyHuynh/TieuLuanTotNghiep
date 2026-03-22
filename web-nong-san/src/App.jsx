import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { publicRoutes } from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";

function renderRoutes(routes) {
  return routes.map((route, index) => {
    // Lấy component từ route.element
    // gán cho Page để dễ sử dụng
    //
    const Page = route.element;

    // kiểm tra router này có router con không
    // Nếu có có nghĩa router này là router cha/ layout route
    if (route.children) {
      // Tạo ra 1 <Route></Route> cha
      // path = {route.path}: ví dụ "/"
      // element =  {<Page />} : ví dụ <UserLayout />
      //  key={`${route.path || "root"}-${index}` - react cần key khi render list
      //  để phân biệt các phần tử với nhau, tránh lỗi khi render lại
      return (
        <Route
          key={`${route.path || "root"}-${index}`}
          path={route.path}
          element={<Page />}
        >
          {/* Gọi lại chính hàm renderRoute
            Nhưng lần này là rrender vào các route con của route hiện tại
        */}
          {/*  Hiểu đơn giản:
          - route cha có con
          - thì render cha trước
          - rồi bảo hàm tự đi xử lí tiếp đám con bên trong
         */}
          {renderRoutes(route.children)}
        </Route>
      );
    }

    // Kiểm tra route này có phải là route mặc định không
    // Nếu có nghĩa là khi truy cập vào path của route cha thì sẽ tự động render route này
    if (route.index) {
      return <Route key={`index-${index}`} index element={<Page />} />;
    }

    // Route bình thường, không có con, không phải route mặc định
    return (
      <Route
        key={`${route.path}-${index}`}
        path={route.path}
        element={<Page />}
      />
    );
  });
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>{renderRoutes(publicRoutes)}</Routes>
    </BrowserRouter>
  );
}

export default App;
