import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchUserData } from "../services/userService";
import { useCart } from "../context/CartContext";
import deleteIcon from "../res/icons/delete.png";
import { useBaseUrl } from "../context/BaseUrlContext";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi"; // Імпортуємо іконку хрестика

const CartModal = ({ isOpen, closeCart }) => {
  const baseUrl = useBaseUrl();

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const { fetchCartItemCount, loadLocalCartCount } = useCart();

  // Функція для отримання даних користувача
  useEffect(() => {
    if (isOpen) {
      const fetchUser = async () => {
        const data = await fetchUserData(baseUrl);
        setUserData(data); // Встановлюємо отримані дані або false
      };
      fetchUser();
    }
  }, [isOpen]);

  useEffect(() => {
    if (userData) {
      fetchCartItems();
      fetchTotalPrice();
    } else {
      loadLocalCart();
    }
  }, [userData]);

  const loadLocalCart = () => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(localCart);
    setTotalPrice(
      localCart
        .reduce((acc, item) => acc + item.price * item.quantity, 0)
        .toFixed(2)
    );
  };

  const fetchCartItems = async () => {
    try {
      console.log("Запит на отримання товарів з кошика...");
      if (!userData) {
        console.log(
          "Користувач не знайдений, пропускаємо запит на отримання товарів."
        );
        return;
      }
      const response = await axios.get(
        `${baseUrl}/api/cart/getCartItems/${userData.user_id}`
      );
      console.log("Товари з кошика отримано:", response.data);
      setCartItems(response.data);
    } catch (error) {
      console.error("Помилка при отриманні товарів з кошика", error);
    }
  };

  const fetchTotalPrice = async () => {
    try {
      console.log("Запит на отримання загальної суми кошика...");
      if (!userData) {
        console.log(
          "Користувач не знайдений, пропускаємо запит на отримання суми."
        );
        return;
      }
      const response = await axios.get(
        `${baseUrl}/api/cart/getTotalPrice/${userData.user_id}`
      );
      console.log("Загальна сума кошика отримана:", response.data);
      setTotalPrice(response.data.totalPrice);
    } catch (error) {
      console.error("Помилка при отриманні загальної суми", error);
    }
  };

  // Видалення товару з кошика
  const handleRemoveFromCart = async (cartId) => {
    try {
      console.log(`Запит на видалення товару з кошика, cartId: ${cartId}`);
      await axios.post(`${baseUrl}/api/cart/removeFromCart`, {
        cart_id: cartId,
      });
      console.log("Товар видалено. Оновлюємо товари і загальну суму...");
      fetchCartItems(); // Оновлення списку товарів після видалення
      fetchTotalPrice(); // Оновлення загальної суми
      fetchCartItemCount(userData.user_id);
      if (cartItems.length === 1) {
        setCartItems([]); // Очистити кошик, якщо він порожній
      }
    } catch (error) {
      console.error("Помилка при видаленні товару з кошика", error);
    }
  };

  const handleQuantityChange = async (cartId, quantity, amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity < 1) return; // Мінімальна кількість = 1

    try {
      console.log(
        `Оновлення кількості товару: cartId=${cartId}, нова кількість=${newQuantity}`
      );

      await axios.post(`${baseUrl}/api/cart/updateQuantity`, {
        cart_id: cartId,
        quantity: newQuantity,
      });

      // Після оновлення - отримуємо актуальні дані
      fetchCartItems();
      fetchTotalPrice();
      fetchCartItemCount(userData.user_id);
    } catch (error) {
      console.error("Помилка при оновленні кількості", error);
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg w-96 relative">
          <FiX
            onClick={closeCart} // Закриття картки при натисканні на хрестик
            size={24}
            className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700"
          />
          <h2 className="text-2xl font-semibold mb-4">Кошик</h2>

          {userData === null ? (
            <p>Завантаження даних користувача...</p>
          ) : userData === false ? (
            <div>
              {cartItems.length > 0 ? (
                <div>
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover mr-4"
                        />
                        <div>
                          <p>{item.product_name}</p>
                          <p className="text-gray-600">Ціна: ₴{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>Кількість: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 text-xl font-semibold">
                    <p>Загальна сума: ₴{totalPrice}</p>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Link
                      to="/orderForm"
                      onClick={closeCart}
                      className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Оформити замовлення
                    </Link>
                  </div>
                </div>
              ) : (
                <p>Ваш кошик порожній</p>
              )}
            </div>
          ) : (
            <div>
              {cartItems.length > 0 ? (
                <div>
                  {cartItems.map((item) => (
                    <div
                      key={item.cart_id}
                      className="flex items-center justify-between mb-4"
                    >
                      <div className="flex items-center">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover mr-4"
                        />
                        <div>
                          <p>{item.name}</p>
                          <p className="text-gray-600">Ціна: ₴{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.cart_id,
                              item.quantity,
                              -1
                            )
                          }
                          className="px-2 py-1 bg-gray-300 rounded-full"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.cart_id,
                              item.quantity,
                              +1
                            )
                          }
                          className="px-2 py-1 bg-gray-300 rounded-full"
                        >
                          +
                        </button>
                        <img
                          src={deleteIcon}
                          onClick={() => handleRemoveFromCart(item.cart_id)}
                          className="w-7 h-7 cursor-pointer transition duration-300 hover:brightness-50"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 text-xl font-semibold">
                    <p>Загальна сума: ₴{totalPrice}</p>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Link
                      to="/orderForm"
                      onClick={closeCart}
                      className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Оформити замовлення
                    </Link>
                  </div>
                </div>
              ) : (
                <p>Ваш кошик порожній</p>
              )}
            </div>
          )}

        </div>
      </div>
    )
  );
};

export default CartModal;
