const pool = require("../config/db");
const config = require('../../config/serverConfig')

const serverUrl = config.imageURL;

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

  const connection = await pool.getConnection(); // для транзакції

  try {
    await connection.beginTransaction();

    // 1. Вставити замовлення
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total_price, phone, status) VALUES (?, ?, ?, ?)",
      [user_id || null, totalPrice, phone, status]
    );

    const orderId = orderResult.insertId;

    const orderItemsValues = [];

    // 2. Для кожного товару знайти variant_id
    for (const item of cartItems) {
      const [variantRows] = await connection.query(
        `SELECT id FROM product_variants 
         WHERE size = ? AND color = ? AND product_id = ? LIMIT 1`,
        [item.size, item.color, item.product_id]
      );

      if (variantRows.length === 0) {
        throw new Error(
          `Не знайдено варіацію товару: size=${item.size}, color=${item.color}, product_id=${item.product_id}`
        );
      }

      const variant_id = variantRows[0].id;

      orderItemsValues.push([orderId, variant_id, item.quantity, item.price]);
    }

    // 3. Вставити order_items
    const orderItemsQuery = `
      INSERT INTO order_items (order_id, variant_id, quantity, price)
      VALUES ?
    `;
    await connection.query(orderItemsQuery, [orderItemsValues]);

    await connection.commit();

    res.status(201).json({ success: true, orderId });
  } catch (error) {
    console.error("Помилка при створенні замовлення:", error);
    await connection.rollback();
    res.status(500).json({ success: false, message: "Помилка сервера." });
  } finally {
    connection.release();
  }
};

exports.updateStatus = async (req, res) => {
  const { order_id, status } = req.body;
  const allowedStatuses = ['pending','paid','shipped','delivered','canceled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Недопустимий статус" });
  }

  try {
    await pool.query(
      "UPDATE orders SET status = ? WHERE order_id = ?",
      [status, order_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};


exports.getOrders = async (req, res) => {
  try {
    const { user_id, status, search_query } = req.query;

    const whereClauses = [];
    const values = [];

    // user_id як точна відповідність
    if (user_id) {
      whereClauses.push("o.user_id = ?");
      values.push(user_id);
    }

    // статус замовлення (pending, shipped і т.д.)
    if (status) {
      whereClauses.push("o.status = ?");
      values.push(status);
    }

    // пошук по phone або order_id
    if (search_query) {
      whereClauses.push("(o.phone LIKE ? OR o.order_id = ?)");
      values.push(`%${search_query}%`, search_query);
    }

    // Формуємо SQL-запит
    let orderQuery = `
      SELECT 
        o.order_id,
        o.user_id,
        o.status,
        o.phone,
        u.username AS user_name
      FROM orders o
      LEFT JOIN user u ON o.user_id = u.user_id
    `;

    if (whereClauses.length > 0) {
      orderQuery += ` WHERE ` + whereClauses.join(" AND ");
    }

    const [orders] = await pool.query(orderQuery, values);
    const orderIds = orders.map((order) => order.order_id);

    if (orderIds.length === 0) return res.json([]);

    // Отримуємо order_items
    const [items] = await pool.query(
      `
      SELECT 
        oi.order_id,
        p.name AS product_name,
        oi.quantity,
        oi.price,
        pv.color,
        pv.size,
        (
          SELECT image_url
          FROM product_images
          WHERE product_id = pv.product_id AND color = pv.color
          ORDER BY image_id ASC
          LIMIT 1
        ) AS image_url
      FROM order_items oi
      JOIN product_variants pv ON oi.variant_id = pv.id
      JOIN product p ON pv.product_id = p.product_id
      WHERE oi.order_id IN (?)
    `,
      [orderIds]
    );

    // Групуємо товари по замовленнях
    const itemsMap = {};
    for (const item of items) {
      if (!itemsMap[item.order_id]) {
        itemsMap[item.order_id] = [];
      }
      itemsMap[item.order_id].push({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        size: item.size,
        image_url: serverUrl + item.image_url,
      });
    }

    // Додаємо товари до замовлень
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsMap[order.order_id] || [],
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error("Помилка при отриманні замовлень:", error);
    res.status(500).json({ success: false, message: "Помилка сервера." });
  }
};
