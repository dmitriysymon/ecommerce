import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../res/styles/UserProfile.css'; // Наш кастомний CSS

// Компонент для особистої інформації
const PersonalInfo = ({ userData }) => {
  return (
    <div>
      <h2>Особиста інформація</h2>
      <p><strong>Ім'я:</strong> {userData.username}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Телефон:</strong> {userData.user_number}</p>
    </div>
  );
};

// Компонент для історії покупок
const OrderHistory = ({ orders }) => {
  return (
    <div>
      <h2>Історія покупок</h2>
      {orders && orders.length > 0 ? (
        <ul>
          {orders.map((order, index) => (
            <li key={index}>
              <p><strong>Номер замовлення:</strong> {order.orderNumber}</p>
              <p><strong>Дата:</strong> {order.date}</p>
              <p><strong>Сума:</strong> {order.totalPrice}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Немає історії покупок.</p>
      )}
    </div>
  );
};

// Основний компонент кабінету
const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]); // Якщо історія покупок потрібна
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/session/getUser', {
          method: 'GET',
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error('Не вдалося отримати дані користувача');
        }
  
        const data = await response.json();
  
        // Очікуємо, що сервер повертає об'єкт з полями userData та orders
        setUserData(data.userData);
        setOrders(data.orders || []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  if (loading) {
    return <p>Завантаження...</p>;
  }

  if (error) {
    return <p>Помилка: {error}</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Особистий кабінет</h1>
      <Tabs>
        <div className="vertical-tabs">
          <TabList className="vertical-tab-list">
            <Tab>Особиста інформація</Tab>
            <Tab>Історія покупок</Tab>
          </TabList>
          <div className="vertical-tab-panel">
            <TabPanel>
              {userData && <PersonalInfo userData={userData} />}
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
