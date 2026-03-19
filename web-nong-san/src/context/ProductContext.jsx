import { useState, createContext } from "react";
import { products } from "../database/data";
const ProductContext = createContext();
const ProductProvider = ({ children }) => {
  {
    const [productList] = useState(products);
    return (
      <ProductContext.Provider value={{ productList }}>
        {children}
      </ProductContext.Provider>
    );
  }
};

export { ProductContext, ProductProvider };
