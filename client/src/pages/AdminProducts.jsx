import { useState, useEffect, useRef } from "react";
import ProductTab from "../component/adminTabs/ProductTab";
import CategoryTab from "../component/adminTabs/CategoryTab";
import MainCategoryTab from "../component/adminTabs/MainCategoryTab";
import OrdersTab from "../component/adminTabs/OrdersTab";
import { fetchUserData } from "../services/userService";
import { useBaseUrl } from "../context/BaseUrlContext";

const AdminProducts = () => {
  const baseUrl = useBaseUrl();
  const [activeTab, setActiveTab] = useState("orders");
  const scrollRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchUserData(baseUrl);
        setUserData(data);
      } catch (error) {
        console.error("Помилка при отриманні даних користувача:", error);
        setUserData(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [baseUrl]);

  // Поки завантажуються дані користувача - показуємо спінер або повідомлення
  if (loadingUser) {
    return (
      <div className="container font-montserrat mx-auto p-4 mt-12">
        <p>Завантаження даних користувача...</p>
      </div>
    );
  }

  // Якщо userData відсутній або root !== 1 - заборона доступу
  if (!userData || userData.root !== 1) {
    return (
      <div className="container font-montserrat mx-auto p-4 mt-12 text-center text-red-600">
        <h2 className="text-2xl mb-4">Доступ заборонено</h2>
        <p>У вас немає прав для перегляду цієї сторінки.</p>
      </div>
    );
  }

  // Якщо все ок - показуємо адмін панель
  return (
    <div className="container font-montserrat mx-auto p-4 mt-12">
      <h2 className="text-2xl text-left mb-4">ADMIN PANEL</h2>
      <div className="relative flex items-center mb-6">
        {/* Контейнер для вкладок з горизонтальним скролом */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth no-scrollbar pl-2 pr-2 sm:pl-0 sm:pr-0"
          style={{ scrollbarWidth: "none" /* Firefox */ }}
        >
          <button
            onClick={() => setActiveTab("orders")}
            className={`inline-block px-4 py-2 mr-2 rounded whitespace-nowrap ${
              activeTab === "orders" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Замовлення
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`inline-block px-4 py-2 mr-2 rounded whitespace-nowrap ${
              activeTab === "products" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Товари
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`inline-block px-4 py-2 mr-2 rounded whitespace-nowrap ${
              activeTab === "categories" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Категорії
          </button>
          <button
            onClick={() => setActiveTab("mainCategories")}
            className={`inline-block px-4 py-2 mr-2 rounded whitespace-nowrap ${
              activeTab === "mainCategories" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Головні Категорії
          </button>
        </div>
      </div>

      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "products" && <ProductTab />}
      {activeTab === "categories" && <CategoryTab />}
      {activeTab === "mainCategories" && <MainCategoryTab />}
    </div>
  );
};

export default AdminProducts;
