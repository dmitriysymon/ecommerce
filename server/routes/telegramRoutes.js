const express = require("express");
const { sendTelegramMessage } = require("../utils/telegram")
const router = express.Router();

router.post("/send-order", async (req, res) => {
  try {
    console.log("Отримано замовлення:", req.body);

    const { name, lastname, phone, email, address, novaPoshtaBranch, cartItems, totalPrice } = req.body;

    if (!name || !lastname || !phone || !email || !novaPoshtaBranch || !cartItems.length) {
      console.error("❌ Помилка: Не всі обов'язкові поля заповнені", req.body);
      return res.status(400).json({ error: "Будь ласка, заповніть усі поля" });
    }

    const orderMessage = `
🛒 *Нове замовлення!* 🛒

👤 *Ім'я:* ${name} ${lastname}
📞 *Телефон:* ${phone}
✉️ *Email:* ${email}
🏠 *Адреса:* ${address || "Не вказано"}
🏤 *Нова Пошта:* ${novaPoshtaBranch}

📦 *Замовлені товари:*
${cartItems.map((item, index) => `${index + 1}. ${item.product_name} (x${item.quantity}) - ₴${item.price * item.quantity}`).join("\n")}

💰 *Загальна сума:* ₴${totalPrice}
    `;

    console.log("📤 Відправка повідомлення в Telegram...");
    await sendTelegramMessage(orderMessage);

    res.json({ success: true, message: "Замовлення відправлено в Telegram" });
  } catch (error) {
    console.error("❌ Помилка при обробці замовлення:", error);
    res.status(500).json({ error: "Помилка при надсиланні замовлення" });
  }
});

module.exports = router; // ✅ Правильний експорт
