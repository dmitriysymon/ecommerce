const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data"); // Додаємо form-data

const TELEGRAM_BOT_TOKEN = "7522528604:AAHqRon5Yd8mE9bnHLmj3saWnXQtAjEB1Z8"; // Замініть на токен вашого бота
const TELEGRAM_CHAT_ID = "540573059"; // Замініть на chat_id отримувача

const sendTelegramMessage = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    });
    console.log("✅ Повідомлення успішно надіслано в Telegram");
  } catch (error) {
    console.error("❌ Помилка надсилання повідомлення в Telegram", error.response?.data || error);
  }
};

const sendTelegramFile = async (filePath) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;

  try {
    const formData = new FormData();
    formData.append("chat_id", TELEGRAM_CHAT_ID);
    formData.append("document", fs.createReadStream(filePath));

    const headers = formData.getHeaders(); // Отримуємо заголовки

    await axios.post(url, formData, { headers });

    console.log("✅ PDF-файл успішно надіслано в Telegram");
  } catch (error) {
    console.error("❌ Помилка надсилання PDF у Telegram", error.response?.data || error);
  }
};

module.exports = { sendTelegramMessage, sendTelegramFile };
