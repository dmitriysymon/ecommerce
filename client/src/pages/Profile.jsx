import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "../res/styles/UserProfile.css";
import { useBaseUrl } from "../context/BaseUrlContext";

const statusColors = {
  pending: "bg-yellow-200 text-yellow-800",
  completed: "bg-green-200 text-green-800",
  canceled: "bg-red-200 text-red-800",
};

const OrderHistory = ({ orders }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Історія покупок</h2>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="border p-4 rounded-lg shadow-sm bg-white"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleOrder(order.order_id)}
              >
                <div>
                  <p className="font-bold">Номер замовлення: {order.order_id}</p>
                  <p>Дата: {order.order_date}</p>
                  <p>Сума: {order.total_price} грн</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              {expandedOrder === order.order_id && order.items.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-medium">Товари:</h3>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-4">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p>Кількість: {item.quantity}</p>
                          <p>Ціна: {item.product_price} грн</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Немає історії покупок.</p>
      )}
    </div>
  );
};

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
        setUserData(response.userData);

        const userId = response.userData.user_id;
        if (!userId) throw new Error("Не вдалося отримати ID користувача");

        const ordersResponse = await fetch(
          `${baseUrl}/api/order/getOrders/${userId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!ordersResponse.ok) throw new Error("Помилка отримання історії");
        const ordersData = await ordersResponse.json();

        if (ordersData.orders && Array.isArray(ordersData.orders)) {
          const formattedOrders = ordersData.orders.map((order) => ({
            order_id: order.order_id,
            order_date: new Date(order.order_date).toLocaleDateString(),
            total_price: order.total_price,
            status: order.status,
            items: order.items.map((item) => ({
              product_name: item.product_name,
              product_image: baseUrl + item.product_image,
              quantity: item.quantity,
              product_price: item.product_price,
            })),
          }));
          setOrders(formattedOrders);
        } else {
          throw new Error("Невірна структура історії покупок");
        }
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
    <div className="container mx-auto p-6">
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
              <OrderHistory orders={orders} />
            </TabPanel>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default UserProfile;
