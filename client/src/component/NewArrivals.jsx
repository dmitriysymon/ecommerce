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

  const [itemsToShow, setItemsToShow] = useState(
    window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : 5
  );

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

  // 🟢 Додаємо підтримку свайпу
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX - touchEndX;
    const swipeThreshold = 50; // Мінімальна відстань свайпу

    if (swipeDistance > swipeThreshold) {
      handleNext(); // Свайп вліво (вперед)
    } else if (swipeDistance < -swipeThreshold) {
      handlePrev(); // Свайп вправо (назад)
    }
  };

  return (
    <section className="font-montserrat relative w-full mx-auto py-8">
      <h2 className="text-3xl font-normal mb-6 text-center">Новинки</h2>

      {/* Контейнер товарів */}
      <div
        className="overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsToShow}%)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.product_id}
              className={`flex-none w-1/2 sm:w-1/3 lg:w-1/5 p-4 cursor-pointer transform transition-transform duration-300 hover:scale-105`}
              onClick={() =>
                navigate(`/product/${product.product_id}`, {
                  state: { product },
                })
              }
            >
              <div className="bg-transparent border-spacing-2 overflow-hidden rounded-md">
                <div className="aspect-[4/5] w-full overflow-hidden bg-white">
                  <img
                    src={product.images[0] || "https://placehold.co/400x500"}
                    alt={product.name}
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 sm:p-4">
                  <p className="text-lg text-gray-800">{product.name}</p>
                  <p className="text-gray-800 font-medium">
                    {product.price} UAH
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки для прокручування */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 px-6 z-5 hidden sm:block">
        <button onClick={handlePrev} className="bg-transparent">
          <img
            draggable="false"
            src={arrow_l}
            alt="left-pointer"
            className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 hover:opacity-100 transition-opacity duration-300"
          />
        </button>
      </div>

      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 px-6 z-5 hidden sm:block">
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
