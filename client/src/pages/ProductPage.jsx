import React, { useState, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-custom-alert';
import { useCart } from "../context/CartContext";
import { useBaseUrl } from "../context/BaseUrlContext";

const ProductPage = () => {
  const baseUrl = useBaseUrl();
  const { state } = useLocation();
  const { id } = useParams();
  const product = state?.product;
  const { fetchCartItemCount, loadLocalCartCount } = useCart();

  if (!product) {
    return <div className="text-center text-xl mt-20">Товар не знайдено</div>;
  }

  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/session/getUser`, {
        method: "GET",
        credentials: "include",
      });
  
      if (response.ok) {
        const data = await response.json();
        const user_id = data.userData?.user_id;
  
        if (user_id) {
          // Якщо користувач авторизований, додаємо товар в БД
          const image_url = product.images[0];
          console.log('Шлях до фото', image_url)
          await axios.post(`${baseUrl}/api/cart/addToCart`, {
            product_id: product.product_id,
            quantity,
            user_id,
            image_url,
          });
          toast.success("Товар додано до кошика!");
          fetchCartItemCount(user_id);
        } else {
          addToLocalCart(product, quantity);
        }
      } else {
        addToLocalCart(product, quantity);
      }
    } catch (error) {
      console.log("Помилка отримання користувача", error);
      addToLocalCart(product, quantity);
    }
  };
  
  // Функція для додавання товару в localStorage
  const addToLocalCart = (product, quantity) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    const existingItem = cart.find((item) => item.product_id === product.product_id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const image_url = product.images[0];
      cart.push({ ...product, quantity, image_url });
    }

    loadLocalCartCount();
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Товар додано до кошика (локально)!");
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
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <p className="text-gray-600 leading-relaxed">
            {product.category_name}
          </p>
          <p className="text-sm text-gray-500">Артикул: {product.sku}</p>

          {/* Вибір кількості та ціна */}
          <div className="flex items-center justify-between">
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
            <p className="flex-1 text-center mr-28 text-2xl text-gray-700 font-semibold">
              ₴{(product.price * quantity).toFixed(2)}
            </p>
          </div>

          {/* Кнопка Купити */}
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-black text-white text-lg rounded-lg hover:bg-gray-800 transition"
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
