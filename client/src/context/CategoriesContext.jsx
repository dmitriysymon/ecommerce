import React, { createContext, useState, useContext } from 'react';

// Створення контексту
const CategoriesContext = createContext();

// Створення провайдера контексту
export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchCategories = async (baseUrl) => {
    try {
      const response = await fetch(`${baseUrl}/api/categories`, { method: "GET" });
      const data = await response.json();
      setCategories(data); // Оновлюємо категорії
    } catch (error) {
      console.error("Помилка при отриманні категорій:", error);
    }
  };

  return (
    <CategoriesContext.Provider value={{ categories, setCategories, isMenuOpen, setIsMenuOpen, fetchCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
};

// Хук для доступу до контексту
export const useCategories = () => {
  return useContext(CategoriesContext);
};
