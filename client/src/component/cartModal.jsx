import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchUserData } from "../services/userService";
import { useCart } from "../context/CartContext";
import deleteIcon from "../res/icons/delete.png";
import { useBaseUrl } from "../context/BaseUrlContext";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi"; // Іконка хрестика

const CartModal = ({ isOpen, closeCart }) => {
  const baseUrl = useBaseUrl();

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userData, setUserData] = useState(null);
  const { fetchCartItemCount, loadLocalCartCount } = useCart();

  useEffect(() => {
    if (isOpen) {
      const fetchUser = async () => {
        const data = await fetchUserData(baseUrl);
        setUserData(data);
      };
      fetchUser();
    }
  }, [isOpen]);

  // Окремий useEffect, який слідкує за userData
  useEffect(() => {
    if (userData) {
      fetchCartItems();
      fetchTotalPrice();
    } else if (userData === false) {
      loadLocalCart();
    }
  }, [userData]);

  const loadLocalCart = () => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(localCart);
    setTotalPrice(
      localCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    );
  };

  const fetchCartItems = async () => {
    try {
      if (!userData) return;
      const response = await axios.get(
        `${baseUrl}/api/cart/getCartItems/${userData.user_id}`
      );
      setCartItems(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Якщо бекенд каже, що товарів немає — очищаємо кошик
        setCartItems([]);
      } else {
        console.error("Помилка при отриманні товарів", error);
      }
    }
  };

  const fetchTotalPrice = async () => {
    try {
      if (!userData) return;
      const response = await axios.get(
        `${baseUrl}/api/cart/getTotalPrice/${userData.user_id}`
      );
      setTotalPrice(response.data.totalPrice);
    } catch (error) {
      console.error("Помилка при отриманні загальної суми", error);
    }
  };

  const handleRemoveFromCart = async (cartId, localIndex = null) => {
    if (userData) {
      try {
        await axios.post(`${baseUrl}/api/cart/removeFromCart`, {
          cart_id: cartId,
        });
        fetchCartItems();
        fetchTotalPrice();
        fetchCartItemCount(userData.user_id);
      } catch (error) {
        console.error("Помилка при видаленні товару", error);
      }
    } else {
      let localCart = [...cartItems];
      if (localIndex !== null) {
        localCart.splice(localIndex, 1);
        localStorage.setItem("cart", JSON.stringify(localCart));
        setCartItems(localCart);
        setTotalPrice(
          localCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
        );
        loadLocalCartCount();
      }
    }
  };

  const handleQuantityChange = async (
    cartId,
    quantity,
    amount,
    localIndex = null
  ) => {
    const newQuantity = quantity + amount;
    if (newQuantity < 1) return;

    if (userData) {
      // Серверний кошик
      try {
        await axios.post(`${baseUrl}/api/cart/updateQuantity`, {
          cart_id: cartId,
          quantity: newQuantity,
        });

        fetchCartItems();
        fetchTotalPrice();
        fetchCartItemCount(userData.user_id);
      } catch (error) {
        console.error("Помилка при оновленні кількості", error);
      }
    } else {
      // Локальний кошик
      const updatedCart = [...cartItems];
      updatedCart[localIndex].quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      setTotalPrice(
        updatedCart.reduce((acc, item) => acc + item.price * item.quantity, 0)
      );
      loadLocalCartCount();
    }
  };

  return (
    <>
      {/* Затемнення фону */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeCart}
      ></div>

      {/* Виїзне меню кошика */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Кошик</h2>
          <FiX
            onClick={closeCart}
            size={24}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          />
        </div>

        <div className="p-4 overflow-y-auto max-h-[80vh]">
          {userData === null ? (
            <p>Завантаження даних користувача...</p>
          ) : cartItems.length > 0 ? (
            cartItems.map((item, index) => (
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
                    <p className="text-gray-600">₴{item.price}</p>
                    <div className="text-sm text-gray-500">
                      {item.size && <p>Розмір: {item.size}</p>}
                      {item.color && <p>Колір: {item.color}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() =>
                      userData
                        ? handleQuantityChange(item.cart_id, item.quantity, -1)
                        : handleQuantityChange(null, item.quantity, -1, index)
                    }
                    className="px-2 py-1 bg-gray-300 rounded-full"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      userData
                        ? handleQuantityChange(item.cart_id, item.quantity, +1)
                        : handleQuantityChange(null, item.quantity, +1, index)
                    }
                    className="px-2 py-1 bg-gray-300 rounded-full"
                  >
                    +
                  </button>
                  <img
                    src={deleteIcon}
                    onClick={() =>
                      userData
                        ? handleRemoveFromCart(item.cart_id)
                        : handleRemoveFromCart(null, index)
                    }
                    className="w-7 h-7 cursor-pointer transition duration-300 hover:brightness-50"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10">Кошик порожній</p>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t">
            <p className="text-lg font-semibold">
              Загальна сума: ₴{totalPrice}
            </p>
            <Link
              to="/orderForm"
              onClick={closeCart}
              className="block bg-black text-white text-center px-4 py-2 rounded mt-4 hover:bg-gray-800 transition-colors"
            >
              Оформити замовлення
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartModal;
