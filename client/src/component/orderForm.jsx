import React, { useState, useEffect } from "react";
import { useNovaPoshta } from "../services/novaposhta";
import axios from "axios";
import { useBaseUrl } from "../context/BaseUrlContext";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import debounce from "lodash.debounce"; // Імпорт дебаунсінгу
import { useCart } from "../context/CartContext";
import { toast } from "react-custom-alert";

export const CheckoutPage = () => {
  const baseUrl = useBaseUrl();
  const { state } = useLocation();
  const apiKey = "4308a61be59b3baa8155882c7baad178"; // Замініть на свій ключ API Нової Пошти
  const { fetchCartItemCount, loadLocalCartCount } = useCart();

  const { cities, warehouses, setSelectedCityRef, selectedCityRef } =
    useNovaPoshta(apiKey);

  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderData, setOrderData] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    novaPoshtaBranch: "",
  });
  const [novaPoshtaName, setNovaPoshtaName] = useState({
    cityName: "",
    branchName: "",
  });
  const [cityInput, setCityInput] = useState(""); // Додано для введення міста
  const [cityOptions, setCityOptions] = useState([]); // Стан для відображення опцій

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

  useEffect(() => {
    if (userData) {
      setOrderData({
        name: userData.username || "",
        lastname: userData.lastname || "",
        phone: userData.user_number || "",
        email: userData.email || "",
      });
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
      const response1 = await axios.get(
        `${baseUrl}/api/cart/getTotalPrice/${userData.user_id}`
      );
      setTotalPrice(response1.data.totalPrice);
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

  // Дебаунсінг для введеного тексту міста
  const debouncedCityInputChange = debounce((inputValue) => {
    setCityInput(inputValue);
  }, 300); // Затримка в 300мс після останнього введеного символу

  const handleCityInputChange = (inputValue) => {
    debouncedCityInputChange(inputValue);
  };

  useEffect(() => {
    setOrderData((prevOrderData) => ({
      ...prevOrderData,
      novaPoshtaBranch: `${novaPoshtaName.cityName}, ${novaPoshtaName.branchName}`,
    }));
  }, [novaPoshtaName]); // Спрацьовує при зміні novaPoshtaName

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(orderData.novaPoshtaBranch)

    try {
      const response = await axios.post(`${baseUrl}/api/order/createOrder`, {
        user_id: userData.user_id,
        cartItems: cartItems,
        totalPrice: totalPrice,
        phone: orderData.phone,
      });
      const responseTg = await axios.post(
        `${baseUrl}/api/telegram/send-order`,
        {
          ...orderData,
          cartItems,
          totalPrice,
        }
      );

      if (responseTg.data.success && response.data.success) {
        toast.success("Замовлення успішно оформлено!");
      } else {
        toast.error("Не вдалось оформити замовлення");
      }

      axios.post(`${baseUrl}/api/cart/clearCart/${userData.user_id}`);
    } catch (error) {
      console.error("Помилка:", error);
    }
    fetchCartItemCount(userData.user_id);
    console.log("Кошик очищено");
  };

  // Логіка для отримання результатів пошуку по всьому списку міст з сортуванням
  useEffect(() => {
    const filteredCities = cities
      .filter((city) =>
        city.Description.toLowerCase().includes(cityInput.toLowerCase())
      )
      // Сортуємо за найбільшою схожістю до введеного тексту
      .sort((a, b) => {
        const similarityA = a.Description.toLowerCase().indexOf(
          cityInput.toLowerCase()
        );
        const similarityB = b.Description.toLowerCase().indexOf(
          cityInput.toLowerCase()
        );
        return similarityA - similarityB; // Міста, що більше схожі, з'являться першими
      });

    // Обмежуємо до 50 елементів
    setCityOptions(
      filteredCities.slice(0, 50).map((city) => ({
        value: city.Ref,
        label: city.Description,
      }))
    );
  }, [cityInput, cities]);

  const warehouseOptions = warehouses.map((warehouse) => ({
    value: warehouse.Ref,
    label: warehouse.Description,
  }));

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
          type="text"
          name="lastname"
          value={orderData.lastname}
          onChange={handleInputChange}
          placeholder="Прізвище"
          required
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="email"
          name="email"
          value={orderData.email}
          onChange={handleInputChange}
          placeholder="Електронна адреса"
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
        {/* Вибір міста */}
        <Select
          name="city"
          options={cityOptions}
          onInputChange={handleCityInputChange} // Викликаємо метод для обробки введеного тексту
          onChange={(selectedOption) => {
            setSelectedCityRef(selectedOption.value);
            setNovaPoshtaName({
              ...novaPoshtaName,
              cityName: selectedOption.label,
            });
          }}
          required
          placeholder="Оберіть місто"
          className="mb-3"
          menuPortalTarget={document.body} // Рендеринг меню поза компонентом
          menuPosition="absolute" // Фіксоване меню
          menuPlacement="bottom"
        />

        {/* Вибір відділення */}
        <Select
          name="novaPoshtaBranch"
          options={warehouseOptions}
          value={warehouseOptions.find(
            (option) => option.value === orderData.novaPoshtaBranch
          )}
          onChange={(selectedOption) =>{
            setNovaPoshtaName({
              ...novaPoshtaName,
              branchName: selectedOption.label,
            });
          }}
          required
          placeholder="Оберіть відділення"
          className="mb-3"
          menuPortalTarget={document.body} // Рендеринг меню поза компонентом
          menuPosition="absolute" // Фіксоване меню
          menuPlacement="bottom"
        />

        <h3 className="text-xl font-semibold mb-3">Ваше замовлення</h3>
        {cartItems.map((item, index) => (
          <div key={index} className="flex justify-between p-2 border-b">
            <span>
              <img
                src={item.image_url}
                alt={item.name}
                className="w-12 h-12 object-cover mr-4"
              />
              {item.name} (x{item.quantity})
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
