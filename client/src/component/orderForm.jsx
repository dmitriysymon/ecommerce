import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBaseUrl } from "../context/BaseUrlContext";
import { useLocation, useParams } from "react-router-dom";

export const CheckoutPage = () => {
  const baseUrl = useBaseUrl();
  const { state } = useLocation();
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderData, setOrderData] = useState({
    name: "",
    phone: "",
    address: "",
    novaPoshtaBranch: "",
  });

  // Отримуємо дані користувача
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/session/getUser`, {
          withCredentials: true,
        });
        setUserData(response.data.userData || false);
      } catch (error) {
        setUserData(false);
      }
    };
    fetchUser();
  }, [baseUrl]);

  // Отримуємо товари в кошику
  useEffect(() => {
    if (userData) {
      fetchCartItems();
    } else {
      loadLocalCart();
    }
  }, [userData]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/cart/getCartItems/${userData.user_id}`
      );
      setCartItems(response.data);
    } catch (error) {
      console.error("Помилка при отриманні товарів", error);
    }
  };

  const loadLocalCart = () => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(localCart);
    setTotalPrice(
      localCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    );
  };

  const handleInputChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Замовлення відправлено:", orderData, cartItems);
    // Тут можна додати логіку відправлення замовлення в БД і Телеграм
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Оформлення замовлення</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={orderData.name}
          onChange={handleInputChange}
          placeholder="Ім'я"
          required
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="tel"
          name="phone"
          value={orderData.phone}
          onChange={handleInputChange}
          placeholder="Телефон"
          required
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="text"
          name="novaPoshtaBranch"
          value={orderData.novaPoshtaBranch}
          onChange={handleInputChange}
          placeholder="Відділення Нової Пошти"
          required
          className="w-full p-2 border rounded mb-3"
        />
        <h3 className="text-xl font-semibold mb-3">Ваше замовлення</h3>
        {cartItems.map((item, index) => (
          <div key={index} className="flex justify-between p-2 border-b">
            <span>
              {item.product_name} (x{item.quantity})
            </span>
            <span>₴{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="font-semibold text-xl mt-3">
          Загальна сума: ₴{totalPrice}
        </div>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
        >
          Підтвердити замовлення
        </button>
      </form>
    </div>
  );
};
