const pool = require("../config/db"); // Підключення до БД

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity, user_id, image_url, size, color, name, price } = req.body;

    if (!product_id || !quantity || !size || !color) {
      return res.status(400).json({ message: "Необхідні дані відсутні" });
    }

    // Якщо user_id відсутній — повертаємо інструкцію зберегти локально
    if (!user_id) {
      return res.status(200).json({
        message: "local",
        item: {
          product_id,
          name,
          price,
          quantity,
          image_url,
          size,
          color,
        },
      });
    }

    // Інакше — зберігаємо в БД
    const [existingCartItem] = await pool.execute(
      `SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?`,
      [user_id, product_id, size, color]
    );

    if (existingCartItem.length > 0) {
      const newQuantity = existingCartItem[0].quantity + quantity;
      await pool.execute(
        `UPDATE cart SET quantity = ? WHERE cart_id = ?`,
        [newQuantity, existingCartItem[0].cart_id]
      );

      return res.status(200).json({
        message: "Кількість товару оновлено",
        newQuantity,
      });
    } else {
      const [result] = await pool.execute(
        `INSERT INTO cart (user_id, product_id, quantity, image_url, size, color) VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, product_id, quantity, image_url, size, color]
      );

      return res.status(201).json({
        message: "Товар додано успішно",
        cartId: result.insertId,
      });
    }
  } catch (error) {
    console.error("Помилка при оновлені кошика:", error);
    res.status(500).json({
      message: "Помилка при оновлені кошика",
      error: error.message,
    });
  }
};



exports.updateQuantity = async (req, res) => {

  try {
    const { cart_id, quantity } = req.body;

    // Перевірка, чи існує товар в кошику
    const [existingCartItem] = await pool.execute(
      `SELECT quantity FROM cart WHERE cart_id = ?`,
      [cart_id]
    );

    if (existingCartItem.length === 0) {
      return res.status(404).json({ message: "Товар не знайдено в кошику" });
    }

    // Оновлюємо кількість товару
    await pool.execute(`UPDATE cart SET quantity = ? WHERE cart_id = ?`, [
      quantity,
      cart_id,
    ]);

    return res
      .status(200)
      .json({ message: "Кількість товару оновлено", quantity });
  } catch (error) {
    console.error("Помилка при оновлені кількості товару:", error);
    res.status(500).json({
      message: "Помилка при оновлені кількості товару",
      error: error.message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { cart_id } = req.body;

    // Перевірка наявності товару в кошику
    const [existingCartItem] = await pool.execute(
      `SELECT cart_id FROM cart WHERE cart_id = ?`,
      [cart_id]
    );

    if (existingCartItem.length === 0) {
      return res.status(404).json({ message: "Товар не знайдено в кошику" });
    }

    // Видалення товару з кошика
    await pool.execute(`DELETE FROM cart WHERE cart_id = ?`, [cart_id]);

    return res.status(200).json({ message: "Товар успішно видалено з кошика" });
  } catch (error) {
    console.error("Помилка при видаленні товару з кошика:", error);
    res.status(500).json({
      message: "Помилка при видаленні товару з кошика",
      error: error.message,
    });
  }
};

exports.getCartItems = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Витягуємо всі записи з кошика для користувача, включаючи назву продукту та ціну
    const [cartItems] = await pool.execute(
      `SELECT product.product_id, cart.cart_id, cart.size, cart.color, cart.quantity, cart.image_url, product.name AS name, product.description, product.sku, product.price 
             FROM cart 
             JOIN product ON cart.product_id = product.product_id
             WHERE cart.user_id = ?`,
      [user_id]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "Кошик порожній" });
    }

    // Додаємо до кожного товару загальну суму (quantity * price)
    const itemsWithTotalPrice = cartItems.map((item) => ({
      ...item,
      totalPrice: (item.quantity * item.price).toFixed(2),
    }));

    return res.status(200).json(itemsWithTotalPrice);
  } catch (error) {
    console.error("Помилка при отриманні товарів з кошика:", error);
    res.status(500).json({
      message: "Помилка при отриманні товарів з кошика",
      error: error.message,
    });
  }
};

exports.getTotalPrice = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Витягуємо загальну суму товарів в кошику
    const [result] = await pool.execute(
      `SELECT SUM(cart.quantity * product.price) AS totalPrice 
             FROM cart 
             JOIN product ON cart.product_id = product.product_id 
             WHERE cart.user_id = ?`,
      [user_id]
    );

    if (result.length === 0 || result[0].totalPrice === null) {
      return res.status(404).json({ message: "Кошик порожній" });
    }
    let totalPrice = result[0]?.totalPrice || 0; // Якщо null/undefined → встановлюємо 0

    // Переконуємось, що totalPrice — число, перед викликом toFixed()
    totalPrice = Number(totalPrice).toFixed(2);
    return res.status(200).json({ totalPrice });
  } catch (error) {
    console.error(
      "Помилка при отриманні загальної суми товарів в кошику:",
      error
    );
    res.status(500).json({
      message: "Помилка при отриманні загальної суми товарів в кошику",
      error: error.message,
    });
  }
};

exports.getCartItemCount = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "Не вказано user_id" });
    }

    const [result] = await pool.execute(
      `SELECT SUM(quantity) AS itemCount FROM cart WHERE user_id = ?`,
      [user_id]
    );

    const itemCount = result[0]?.itemCount || 0;

    res.json({ itemCount });
  } catch (error) {
    console.error("Помилка отримання кількості товарів у кошику:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "Не вказано user_id" });
    }

    await pool.execute(`DELETE FROM cart WHERE user_id = ?`, [user_id]);
    return res.status(200).json({ message: "Кошик успішно очищено" });
  } catch (error) {
    console.error("Помилка очищення кошику:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
};
