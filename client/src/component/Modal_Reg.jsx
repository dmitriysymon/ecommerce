import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Google_Icon from "../res/icons/google.png";
import Facebook_Icon from "../res/icons/facebook.png";
import "../App.css";
import { useBaseUrl } from "../context/BaseUrlContext";

const ModalReg = ({ isOpen, setIsOpen, switchToAuth }) => {
  const baseUrl = useBaseUrl();
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Паролі не співпадають!");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/register/reg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.status === 201) {
        setIsOpen(false);
      }
    } catch (error) {
      setMessage("Помилка сервера");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setIsOpen(false)}
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4">Реєстрація</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Ваше ім'я"
                className="w-full p-2 border rounded mb-2"
                onChange={handleChange}
              />
              <input
                type="text"
                name="lastname"
                placeholder="Ваше призвіще"
                className="w-full p-2 border rounded mb-2"
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 border rounded mb-2"
                onChange={handleChange}
              />
              <input
                type="number"
                name="phone"
                placeholder="Номер телефону"
                className="no-spinner w-full p-2 border rounded mb-2"
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                className="w-full p-2 border rounded mb-2"
                onChange={handleChange}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Повторіть пароль"
                className="w-full p-2 border rounded mb-4"
                onChange={handleChange}
              />

              <button
                type="submit"
                className="bg-black text-white w-full py-2 rounded hover:bg-gray-800 transition mb-2"
              >
                Зареєструватися
              </button>
            </form>

            {message && <p className="text-red-500 text-sm mt-2">{message}</p>}

            <div className="flex items-center mb-4">
              <hr className="flex-grow border-gray-300" />
              <span className="px-2 text-gray-500">або</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button
              type="button"
              className="w-full flex items-center bg-gray-50 justify-start px-4 py-2 h-10 border rounded hover:bg-gray-100 transition mb-2"
            >
              <img
                src={Google_Icon}
                alt="Google"
                className="w-5 h-5 mr-11 ml-1"
              />
              Продовжити в Google
            </button>

            <button
              type="button"
              className="w-full flex items-center bg-blue-600 text-white justify-start px-4 py-2 h-11 border rounded hover:bg-blue-700 transition"
            >
              <img
                src={Facebook_Icon}
                alt="Facebook"
                className="w-7 h-7 mr-10"
              />
              Продовжити в Facebook
            </button>

            <p className="text-sm mt-4 text-center">
              Вже маєте акаунт?{" "}
              <span
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={switchToAuth}
              >
                Увійдіть
              </span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalReg;
