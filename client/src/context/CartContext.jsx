import React, { createContext, useState, useContext, useEffect } from "react";
import { useBaseUrl } from "./BaseUrlContext";


// Створення контексту
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const baseUrl = useBaseUrl();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Функція для оновлення кількості товарів в кошику
  const updateCartItemCount = (newCount) => {
    setCartItemCount(newCount);
  };

  // Завантаження кількості товарів з API
  const fetchCartItemCount = async (userId) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/cart/getCartItemCount/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        updateCartItemCount(data.itemCount);
        console.log("Кількість товарів в кошику:", data.itemCount);
      }
    } catch (error) {
      updateCartItemCount(0);
      console.log("Помилка при отриманні кількості товарів в кошику:", error);
    }
  };

  // Завантаження кількості товарів з localStorage
  const loadLocalCartCount = () => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartItemCount(localCart.reduce((acc, item) => acc + item.quantity, 0));
  };

  // Викликаємо loadLocalCartCount при першому рендері
  useEffect(() => {
    loadLocalCartCount();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItemCount,
        updateCartItemCount,
        fetchCartItemCount,
        loadLocalCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
