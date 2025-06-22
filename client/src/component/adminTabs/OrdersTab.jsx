import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseUrl } from "../../context/BaseUrlContext";

const statusColors = {
  pending: "bg-yellow-300 text-yellow-900",
  paid: "bg-green-300 text-green-900",
  shipped: "bg-blue-300 text-blue-900",
  delivered: "bg-purple-300 text-purple-900",
  canceled: "bg-red-300 text-red-900",
};

const OrdersTab = () => {
  const baseUrl = useBaseUrl();
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({}); // { orderId: true/false }

  // Отримання замовлень
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (userId) params.user_id = userId;
      if (status) params.status = status;
      if (searchQuery) params.search_query = searchQuery;

      const res = await axios.get(`${baseUrl}/api/order/getOrders`, { params });
      setOrders(res.data);
    } catch (err) {
      console.error("Помилка при завантаженні замовлень:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Переключення відображення товарів у замовленні
  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Зміна статусу і PATCH-запит на бек
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`${baseUrl}/api/order/updateStatus`, {
        order_id: orderId,
        status: newStatus,
      });
      // Оновлюємо локальний стан замовлень
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Помилка при оновленні статусу:", error);
      alert("Не вдалося оновити статус");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="container mx-auto p-4 font-montserrat">
      <h2 className="text-2xl font-semibold mb-4">Список замовлень</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-4 items-end mb-6"
      >
        <div>
          <label className="block text-sm font-medium">Статус</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-1 rounded w-40"
          >
            <option value="">Усі</option>
            <option value="pending">Очікує</option>
            <option value="paid">Оплачено</option>
            <option value="shipped">Відправлено</option>
            <option value="delivered">Доставлено</option>
            <option value="canceled">Скасовано</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Пошук</label>
          <input
            type="text"
            placeholder="Номер замовлення або телефон"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1 rounded w-64"
          />
        </div>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Знайти
        </button>
      </form>

      {loading ? (
        <p>Завантаження...</p>
      ) : orders.length === 0 ? (
        <p>Замовлень не знайдено.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="border border-gray-300 p-4 rounded-lg relative"
            >
              {/* Статус кольоровий праворуч зверху */}
              <div
                className={`absolute top-3 right-5 px-3 py-1 rounded-2xl text-xs font-semibold cursor-pointer select-none ${
                  statusColors[order.status]
                }`}
              >
                <select
                  className="bg-transparent appearance-none cursor-pointer outline-none text-sm font-semibold text-center"
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.order_id, e.target.value)
                  }
                  title="Змінити статус"
                >
                  <option value="pending">Очікує</option>
                  <option value="paid">Оплачено</option>
                  <option value="shipped">Відправлено</option>
                  <option value="delivered">Доставлено</option>
                  <option value="canceled">Скасовано</option>
                </select>
              </div>

              <div className="text-left">
                <div
                  className="cursor-pointer"
                  onClick={() => toggleExpand(order.order_id)}
                >
                  <span className="font-semibold">Замовлення: </span>{" "}
                  {"№" + order.order_id}
                </div>
                <div>
                  {order.user_name || "Гість"} (ID: {order.user_id || "—"})
                </div>
                <div>
                  <span className="font-semibold">Телефон:</span> {order.phone}
                </div>
              </div>
              {/* Кнопка показати/сховати деталі */}
              <button
                onClick={() => toggleExpand(order.order_id)}
                className="mt-3 text-blue-600 underline hover:no-underline"
                type="button"
              >
                {expandedOrders[order.order_id]
                  ? "Сховати товари"
                  : "Показати товари"}
              </button>

              {/* Деталі товарів */}
              <div
                className={`mt-4 overflow-hidden transition-all duration-300 ${
                  expandedOrders[order.order_id] ? "max-h-[2000px]" : "max-h-0"
                }`}
              >
                {order.items && order.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded p-2 flex gap-2"
                      >
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div>Кількість: {item.quantity}</div>
                          <div>Ціна: {item.price} грн</div>
                          <div>Розмір: {item.size}</div>
                          <div>Колір: {item.color}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-gray-500">Товари відсутні</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
