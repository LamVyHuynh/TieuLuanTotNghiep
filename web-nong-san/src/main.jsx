import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ProductProvider } from "./context/ProductContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { CheckoutProvider } from "./context/CheckoutContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// 🚀 1. IMPORT THƯ VIỆN GOOGLE OAUTH
import { GoogleOAuthProvider } from "@react-oauth/google";

// 🚀 2. LẤY MÃ CLIENT ID TỪ FILE .env CỦA FRONTEND
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 🚀 3. BỌC <GoogleOAuthProvider> Ở VỊ TRÍ NGOÀI CÙNG HOẶC BAO NGOÀI APP */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ProductProvider>
        <CartProvider>
          <CheckoutProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </CheckoutProvider>
        </CartProvider>
      </ProductProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
