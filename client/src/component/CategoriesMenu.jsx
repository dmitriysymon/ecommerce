import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBaseUrl } from "../context/BaseUrlContext";

const CategoriesMenu = ({ setCategoriesMenuOpen }) => {
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const baseUrl = useBaseUrl();

  useEffect(() => {
    if (isVisible) {
      fetch(`${baseUrl}/api/product/getCategoriesMenu`)
        .then((response) => response.json())
        .then((data) => setCategories(data))
        .catch((error) =>
          console.error("Помилка завантаження категорій:", error)
        );
    }
  }, [isVisible, baseUrl]);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => {
          setCategoriesMenuOpen(true); // Використовуємо setCategoriesMenuOpen
          setIsVisible(true);
        }}
        onMouseLeave={() => setIsVisible(false)}
        className="text-white bg-blue-500 px-4 py-2 rounded"
      >
        Категорії
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="absolute top-full left-0 mt-2 w-96 bg-white border rounded shadow-lg p-4 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
          >
            <div className="grid grid-cols-3 gap-4">
              {categories.map((categoryGroup, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-lg mb-2">
                    {categoryGroup.main_category}
                  </h3>
                  <ul>
                    {categoryGroup.categories.map((subCategory) => (
                      <li key={subCategory.category_id}>{subCategory.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesMenu;
