import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("priceAsc");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categories = ["Усі", "Електроніка", "Одяг", "Меблі"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/product/listProduct"
        );
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Помилка завантаження продуктів:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sortedProducts = [...products].sort((a, b) =>
    sortOption === "priceAsc" ? a.price - b.price : b.price - a.price
  );

  const filteredProducts = sortedProducts.filter((product) =>
    selectedCategory === "" || selectedCategory === "Усі"
      ? true
      : product.category === selectedCategory
  );

  if (loading) return <div>Завантаження...</div>;

  return (
    <section className="max-w-screen-2xl mx-auto py-20">
      <div className="flex gap-8">
        {/* Фільтр */}
        <div className="w-1/4 bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Фільтр</h3>
          <div className="mb-4">
            <label htmlFor="category" className="block mb-2">Категорія</label>
            <select
              id="category"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Сітка товарів */}
        <div className="w-3/4">
          {/* Сортування */}
          <div className="flex items-center mb-6 space-x-4">
            <div className="text-lg font-semibold">Сортування:</div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="priceAsc">Ціна (за зростанням)</option>
              <option value="priceDesc">Ціна (за спаданням)</option>
            </select>
          </div>

          {/* Сітка товарів */}
          <div className="grid grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
                onClick={() => navigate(`/product/${product.product_id}`, { state: { product } })}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4"
                  />
                ) : (
                  <div className="w-full h-48 flex justify-center items-center text-gray-500 mb-4">
                    Фото відсутнє
                  </div>
                )}
                <p className="text-xl font-semibold">{product.name}</p>
                <p className="text-gray-500">{product.price} грн</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
