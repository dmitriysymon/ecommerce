import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-custom-alert";
import { useCart } from "../context/CartContext";
import { useBaseUrl } from "../context/BaseUrlContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import arrow_l from "../assets/arrow_l.svg";
import arrow_r from "../assets/arrow_r.svg";

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
  const [hovered, setHovered] = useState(false);
  const [maxSize, setMaxSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const loadImageSizes = async () => {
      let maxWidth = 0;
      let maxHeight = 0;

      const promises = product.images.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            if (img.width > maxWidth) maxWidth = img.width;
            if (img.height > maxHeight) maxHeight = img.height;
            resolve();
          };
        });
      });

      await Promise.all(promises);
      setMaxSize({ width: maxWidth, height: maxHeight });
    };

    loadImageSizes();
  }, [product.images]);

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
          const image_url = product.images[0];
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

  const addToLocalCart = (product, quantity) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find(
      (item) => item.product_id === product.product_id
    );

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

  const handlePrevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="font-montserrat tracking-wide container mx-auto p-6 mt-20 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Галерея фото */}
        <div className="relative flex items-center">
          {/* Список мініатюр фото */}
          <div className="flex flex-col space-y-2">
            {product.images.map((img, index) => (
              <img
                draggable={false}
                key={index}
                src={img}
                alt="thumb"
                className={`w-20 h-20 object-cover rounded-sm cursor-pointer border-b-2 ${
                  currentImage === index ? "border-black" : "border-none"
                }`}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>

          {/* Головне фото */}
          <div
            className="relative ml-4"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <img
              draggable={false}
              src={product.images[currentImage]}
              alt={product.name}
              className="w-[450px] h-[600px] object-cover rounded-lg shadow-lg"
            />

            {/* Стрілки для навігації */}
            {hovered && (
              <>
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 px-3 z-5 hidden sm:block">
                  <button onClick={handlePrevImage} className="bg-transparent">
                    <img
                      draggable="false"
                      src={arrow_l}
                      alt="left-pointer"
                      className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 hover:opacity-100 transition-opacity duration-300"
                    />
                  </button>
                </div>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Інформація про товар */}
        <div className="space-y-6">
          <h1 className="text-4xl font">{product.name}</h1>
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
            <p className="flex-1 text-center mr-28 text-2xl text-black font-medium">
              {product.price} UAH
            </p>
          </div>

          {/* Кнопка Купити */}
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-black text-white text-lg rounded-lg hover:bg-gray-800 transition"
          >
            Додати ₴{(product.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
