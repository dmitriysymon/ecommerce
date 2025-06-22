import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-custom-alert";
import { useCart } from "../context/CartContext";
import { useBaseUrl } from "../context/BaseUrlContext";
import arrow_l from "../assets/arrow_l.svg";
import arrow_r from "../assets/arrow_r.svg";
import pointer_d from "../assets/pointer_d.svg";
import { useSwipeable } from "react-swipeable";
import LikeToo from "../component/LikeToo";

const ProductPage = () => {
  const baseUrl = useBaseUrl();
  const { id, color } = useParams();
  const navigate = useNavigate();

  const { fetchCartItemCount, loadLocalCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState();

  const [activeTab, setActiveTab] = useState(null);

  const toggleTab = (tab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [maxSize, setMaxSize] = useState({ width: 0, height: 0 });

  // Запит на сервер при зміні id або color
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // Тут color передається у форматі #00ffff, але в URL треба кодувати #
        const encodedColor = encodeURIComponent(color || "");

        const response = await axios.get(
          `${baseUrl}/api/product/getProductById/${id}?color=${encodedColor}`
        );

        if (response.data) {
          setProduct(response.data);
          // Встановлюємо вибраний колір із параметра або з продукту (перший)
          setSelectedColor(
            color || (response.data.colors ? response.data.colors[0] : null)
          );
          setSelectedSize("");
          setCurrentImage(0);
          setQuantity(1);
        } else {
          setError("Товар не знайдено");
          setProduct(null);
        }
      } catch (err) {
        setError("Помилка завантаження товару");
        setProduct(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, color, baseUrl]);

  // Підрахунок максимального розміру картинки після завантаження продукту
  useEffect(() => {
    if (!product || !product.images) return;

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
          img.onerror = () => resolve(); // щоб не зависало
        });
      });

      await Promise.all(promises);
      setMaxSize({ width: maxWidth, height: maxHeight });
    };

    loadImageSizes();
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, color]);

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Будь ласка, оберіть розмір");
      return;
    }

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
            size: selectedSize,
            color: selectedColor,
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
      (item) =>
        item.product_id === product.product_id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const image_url = product.images[0];
      cart.push({
        ...product,
        quantity,
        image_url,
        size: selectedSize,
        color: selectedColor,
      });
    }

    loadLocalCartCount();
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Товар додано до кошика (локально)!");
  };

  const handlePrevImage = () => {
    if (!product) return;
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!product) return;
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNextImage(),
    onSwipedRight: () => handlePrevImage(),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  });

  const handleColorSelect = (colorOption) => {
    setSelectedColor(colorOption);
    navigate(
      `/product/${product.product_id}/${encodeURIComponent(colorOption)}`
    );
  };

  if (loading) {
    return (
      <div className="text-center text-xl mt-20">Завантаження товару...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-xl mt-20 text-red-600">{error}</div>
    );
  }

  if (!product) {
    return <div className="text-center text-xl mt-20">Товар не знайдено</div>;
  }

  return (
    <div className="font-montserrat tracking-wide container mx-auto p-4 sm:p-6 mt-20 sm:mt-20">
      <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* ЗОБРАЖЕННЯ */}
        <div className="order-1 md:order-1 relative flex items-center justify-center">
          <div className="flex flex-col space-y-2 hidden md:flex">
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

          <div className="flex flex-col sm:ml-4">
            <div
              {...handlers}
              className="relative w-full flex justify-center"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <img
                draggable={false}
                src={product.images[currentImage]}
                alt={product.name}
                className="aspect-[2/3] w-full md:max-w-[400pt] object-cover"
              />

              {/* Стрілки */}
              {hovered && (
                <>
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 px-3 z-10">
                    <button onClick={handlePrevImage}>
                      <img
                        src={arrow_l}
                        alt="left"
                        className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 hover:opacity-100"
                      />
                    </button>
                  </div>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <img
                      src={arrow_r}
                      alt="right"
                      className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 hover:opacity-100"
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ІНФОРМАЦІЯ ПРО ТОВАР */}
        <div className="order-2 w-full md:order-2 mt-2 md:mt-16">
          <div className="sticky top-24 space-y-6">
            <h1 className="text-2xl sm:text-4xl text-left">{product.name}</h1>
            <p className="text-2xl text-left sm:text-left">
              {product.price} UAH
            </p>
            <p className="text-sm text-gray-500 text-left">
              Артикул: {product.sku}
            </p>

            {/* Кольори */}
            {product.colors && product.colors[0] !== "default" && (
              <div className="mb-4 flex flex-col items-start">
                <p className="text-sm text-gray-700 mb-2">Колір:</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((colorOption) => (
                    <button
                      key={colorOption}
                      onClick={() => handleColorSelect(colorOption)}
                      className={`w-8 h-8 rounded-sm opacity-70 border cursor-pointer transition ${
                        selectedColor === colorOption
                          ? "ring-2 ring-black"
                          : "border-gray-400"
                      }`}
                      style={{ backgroundColor: colorOption }}
                      title={colorOption}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Розміри */}
            <div className="mb-4">
              <div className="flex items-center space-x-1 mb-2">
                <p className="text-sm text-gray-700">Розмір:</p>
                <p className="text-sm text-gray-700">
                  {selectedSize ? selectedSize.toUpperCase() : "Оберіть розмір"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 border rounded-sm flex items-center justify-center cursor-pointer transition ${
                      selectedSize === size
                        ? "border-black font-bold"
                        : "border-gray-400"
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Кількість + Ціна */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <p className="text-md text-center sm:text-left text-gray-700">
                  Кількість:
                </p>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 bg-gray-200 rounded-full text-xl"
                >
                  -
                </button>
                <span className="text-xl font-semibold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 bg-gray-200 rounded-full text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Кнопка "Додати" */}
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-black text-white text-lg rounded-md hover:bg-gray-800 transition"
            >
              Додати - {(product.price * quantity).toFixed(2)} UAH
            </button>
          </div>
        </div>

        {/* ОПИС І СКЛАД */}
        <div className="order-3 md:col-span-2 w-full 2xl:max-w-[540px] xl:max-w-[500px] md:max-w-[400px] md:ml-16 xl:ml-[90px] 2xl:ml-[140px]">
          <div className="w-full">
            {/* Опис */}
            <button
              onClick={() => toggleTab("description")}
              className="w-full flex justify-between items-center px-1 py-3 text-gray-800 text-left hover:text-black focus:outline-none"
            >
              <span>Опис</span>
              <img
                src={pointer_d}
                alt="arrow"
                className={`h-5 w-5 transition-transform opacity-50 duration-300 ${
                  activeTab === "description" ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`px-4 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                activeTab === "description" ? "max-h-[500px] py-3" : "max-h-0"
              }`}
            >
              <p className="text-gray-700">
                {product.description || "Опис товару відсутній."}
              </p>
            </div>

            {/* Склад і догляд */}
            <button
              onClick={() => toggleTab("care")}
              className="w-full flex justify-between items-center text-gray-800 px-1 py-3 text-left hover:text-black focus:outline-none"
            >
              <span>Склад і догляд</span>
              <img
                src={pointer_d}
                alt="arrow"
                className={`h-5 w-5 transition-transform opacity-50 duration-300 ${
                  activeTab === "care" ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`px-4 overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                activeTab === "care" ? "max-h-[500px] py-3" : "max-h-0"
              }`}
            >
              <p className="text-gray-700">
                {product.care || "Інформація відсутня."}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* LIKE + INFO */}
      <div className="order-4 md:order-4 xl:ml-10 2xl:ml-24 w-full mt-10 md:mt-6">
        <LikeToo product={product} />
      </div>
    </div>
  );
};

export default ProductPage;
