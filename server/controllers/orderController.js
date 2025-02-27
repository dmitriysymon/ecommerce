const pool = require("../config/db");

exports.createOrder = async (req, res) => {
  console.log(req.body);
  const {
    user_id,
    cartItems,
    totalPrice,
    phone,
    status = "pending",
  } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Кошик порожній." });
  }

  try {
    // Вставка нового замовлення в таблицю orders
    const [orderResult] = await pool.query(
      "INSERT INTO orders (user_id, total_price, phone, status) VALUES (?, ?, ?, ?)",
      [user_id || null, totalPrice, phone, status]
    );

    const orderId = orderResult.insertId;

    // Формуємо масив значень для вставки в order_items, включаючи image_url
    const orderItemsValues = [];

    for (const item of cartItems) {
      // Отримуємо перше зображення для продукту з таблиці product_images
      const [imageResult] = await pool.query(
        "SELECT image_url FROM product_images WHERE product_id = ? LIMIT 1",
        [item.product_id]
      );

      // Якщо зображення знайдено, то беремо його, якщо ні, ставимо null
      const imageUrl = imageResult.length > 0 ? imageResult[0].image_url : null;

      // Додаємо елемент до масиву для вставки
      orderItemsValues.push([
        orderId,
        item.product_id,
        item.quantity,
        item.price,
        imageUrl,  // Додаємо image_url
      ]);
    }

    // Вставка товарів в таблицю order_items
    const orderItemsQuery =
      "INSERT INTO order_items (order_id, product_id, quantity, price, image_url) VALUES ?";

    await pool.query(orderItemsQuery, [orderItemsValues]);

    res.status(201).json({ success: true, orderId });
  } catch (error) {
    console.error("Помилка при створенні замовлення:", error);
    res.status(500).json({ success: false, message: "Помилка сервера." });
  }
};


exports.getUserOrders = async (req, res) => {
  const { user_id } = req.params; // Отримуємо user_id з параметрів запиту

  if (!user_id) {
    return res.status(400).json({ success: false, message: "Не зазначено user_id." });
  }

  try {
    // Отримуємо всі замовлення для користувача
    const ordersQuery = `
      SELECT 
        order_id,
        total_price,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS order_date
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC;
    `;
    
    // Виконання запиту для отримання замовлень
    const [orders] = await pool.query(ordersQuery, [user_id]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: "Замовлення не знайдено для цього користувача." });
    }

    // Для кожного замовлення додаємо товари
    for (let order of orders) {
      // Отримуємо всі товари для поточного замовлення
      const orderItemsQuery = `
        SELECT 
          oi.quantity,
          oi.product_id,
          oi.price AS product_price,
          p.name AS product_name,
          oi.image_url AS product_image
        FROM order_items oi
        JOIN product p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `;
      
      // Виконання запиту для отримання товарів для поточного замовлення
      const [orderItems] = await pool.query(orderItemsQuery, [order.order_id]);

      // Додаємо товари до замовлення
      order.items = orderItems;
    }

    // Повертаємо результат
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Помилка при отриманні замовлень:', error);
    res.status(500).json({ success: false, message: 'Помилка сервера.' });
  }
};

