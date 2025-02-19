import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import arrow_l from "../assets/arrow_l.svg";
import arrow_r from "../assets/arrow_r.svg";
import { useBaseUrl } from "../context/BaseUrlContext";

const NewArrivals = () => {
  const baseUrl = useBaseUrl();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const itemsToShow = window.innerWidth < 768 ? 3 : 5;

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/product/listProduct`);
      const data = await response.json();
      const sortedProducts = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setProducts(sortedProducts);
    } catch (error) {
      console.error("Помилка при отриманні продуктів:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - itemsToShow : prevIndex
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsToShow < products.length
        ? prevIndex + itemsToShow
        : prevIndex
    );
  };

  return (
    <section className="relative max-w-screen-2xl mx-auto py-8 px-6">
      <h2 className="text-3xl font-semibold mb-6 text-center">Новинки</h2>

      {/* Контейнер товарів */}
      <div className="overflow-hidden relative">
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsToShow}%)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.product_id}
              className="flex-none w-[calc(100%/5)] sm:w-[calc(100%/3)] md:w-[calc(20%)] lg:w-[calc(20%)] p-2 cursor-pointer transform transition-transform duration-300 hover:scale-105"
              onClick={() =>
                navigate(`/product/${product.product_id}`, {
                  state: { product },
                })
              }
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={product.images[0] || "https://placehold.co/300x300"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <div className="p-2 sm:p-4">
                  <p className="text-lg font-semibold">{product.name}</p>
                  <p className="text-gray-500">{product.price} грн</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки для прокручування */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 px-6 z-5">
        <button onClick={handlePrev} className="bg-transparent">
          <img
            draggable="false"
            src={arrow_l}
            alt="left-pointer"
            className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 hover:opacity-100 transition-opacity duration-300"
          />
        </button>
      </div>

      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 px-6 z-5">
        <button onClick={handleNext} className="bg-transparent">
          <img
            draggable="false"
            src={arrow_r}
            alt="right-pointer"
            className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 hover:opacity-100 transition-opacity duration-300"
          />
        </button>
      </div>
    </section>
  );
};

export default NewArrivals;
