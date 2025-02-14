import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

const ProductPage = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const product = state?.product;

  if (!product) {
    return <div className="text-center text-xl mt-20">Товар не знайдено</div>;
  }

  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  return (
    <div className="container mx-auto p-6 mt-20 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Галерея фото */}
        <div className="relative flex flex-col items-center">
          <div className="w-full max-w-lg">
            <img
              src={product.images[currentImage]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="flex space-x-2 mt-4">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="thumb"
                className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                  currentImage === index ? "border-black" : "border-gray-300"
                }`}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Інформація про товар */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl text-gray-700 font-semibold">₴{product.price}</p>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <p className="text-gray-600 leading-relaxed">{product.category_name}</p>
          <p className="text-sm text-gray-500">Артикул: {product.sku}</p>

          {/* Вибір кількості */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-xl"
            >
              -
            </button>
            <span className="text-xl font-semibold">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-xl"
            >
              +
            </button>
          </div>

          {/* Кнопка Купити */}
          <button className="w-full py-3 bg-black text-white text-lg rounded-lg hover:bg-gray-800 transition">
            Купити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;