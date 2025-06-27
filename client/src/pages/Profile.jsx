import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "../res/styles/UserProfile.css";
import { useBaseUrl } from "../context/BaseUrlContext";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = useBaseUrl();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(`${baseUrl}/api/session/getUser`, {
          method: "GET",
          credentials: "include",
        });

        if (!userResponse.ok) throw new Error("Не вдалося отримати дані");
        const response = await userResponse.json();
        const user = response.userData;
        setUserData(user);

        if (!user.user_id) throw new Error("Не вдалося отримати ID користувача");

        // Отримати замовлення користувача
        const ordersResponse = await fetch(`${baseUrl}/api/order/getOrders?user_id=${user.user_id}`);
        if (!ordersResponse.ok) throw new Error("Не вдалося отримати історію замовлень");
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [baseUrl]);

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p className="text-red-500">Помилка: {error}</p>;

  return (
    <div className="font-montserrat container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Особистий кабінет</h1>
      <Tabs>
        <div className="flex gap-6">
          <TabList className="w-1/4 space-y-2">
            <Tab className="p-3 rounded-lg bg-gray-200 cursor-pointer hover:bg-gray-300">
              Особиста інформація
            </Tab>
            <Tab className="p-3 rounded-lg bg-gray-200 cursor-pointer hover:bg-gray-300">
              Історія покупок
            </Tab>
          </TabList>
          <div className="w-3/4">
            <TabPanel>
              {userData && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Особиста інформація</h2>
                  <p><strong>Ім'я:</strong> {userData.lastname} {userData.username}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Телефон:</strong> {userData.user_number}</p>
                </div>
              )}
            </TabPanel>
            <TabPanel>
              <h2 className="text-xl font-semibold mb-4">Історія покупок</h2>
              {orders.length === 0 ? (
                <p>Немає замовлень.</p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.order_id} className="border rounded-lg p-4 bg-white shadow">
                      <div className="mb-2">
                        <p><strong>ID замовлення:</strong> {order.order_id}</p>
                        <p><strong>Статус:</strong> {order.status}</p>
                        <p><strong>Телефон:</strong> {order.phone}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="border p-3 rounded-lg bg-gray-50">
                            <img src={item.image_url} alt={item.product_name} className="w-full h-32 object-cover mb-2 rounded" />
                            <p className="font-medium">{item.product_name}</p>
                            <p>Кількість: {item.quantity}</p>
                            <p>Ціна: {item.price} грн</p>
                            <p>Колір: {item.color}</p>
                            <p>Розмір: {item.size}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabPanel>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default UserProfile;
