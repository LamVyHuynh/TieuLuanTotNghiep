1. Backend + Database trước

Vì auth, order, shopper fee, meal plan đều cần data model chuẩn.

2. Auth (register/login/JWT) ngay sau đó

Vì personalization, lịch ăn tuần, lịch sử đơn đều gắn user identity.

3. Nối frontend vào API + refactor code

Bỏ mock data, tách service layer, xử lý loading/error chuẩn.

4. Mobile responsive cleanup

Fix layout chính (header, home grid, checkout) để demo trên điện thoại không vỡ.

5. AI advisor + advanced feature

Làm sau khi flow mua hàng chạy end-to-end ổn định.

Nếu mày muốn đi nhanh để có bản demo chấm đồ án, tao khuyên roadmap 2 tuần đầu:

- Tuần 1: DB schema + API sản phẩm/giỏ hàng/đơn hàng + auth cơ bản.

- Tuần 2: Nối React vào API + sửa mobile 3 màn quan trọng (Home, Cart, Checkout) + fix lint đỏ.
