const express = require("express");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const { sendTelegramMessage, sendTelegramFile } = require("../utils/telegram");
const axios = require("axios");

const router = express.Router();

router.post("/send-order", async (req, res) => {
  try {
    console.log("Отримано замовлення:", req.body);

    const {
      name,
      lastname,
      phone,
      email,
      novaPoshtaBranch,
      cartItems,
      totalPrice,
    } = req.body;

    if (
      !name ||
      !lastname ||
      !phone ||
      !email ||
      !novaPoshtaBranch ||
      !cartItems.length
    ) {
      console.error("❌ Помилка: Не всі обов'язкові поля заповнені", req.body);
      return res.status(400).json({ error: "Будь ласка, заповніть усі поля" });
    }

    // Формування текстового повідомлення
    const orderMessage = `
🛒 *Нове замовлення!* 🛒

👤 *Ім'я:* ${name} ${lastname}
📞 *Телефон:* ${phone}
✉️ *Email:* ${email}
🏤*Нова Пошта:* ${novaPoshtaBranch}

📦 *Замовлені товари:*
${cartItems
  .map(
    (item, index) => `${index + 1}. ${item.name} (x${item.quantity}) - ₴${
      item.price * item.quantity
    }
    Опис: ${item.description}
    Арт: ${item.sku}`
  )
  .join("\n")}

💰 *Загальна сума:* ₴${totalPrice}
    `;

    console.log("📤 Відправка повідомлення в Telegram...");
    await sendTelegramMessage(orderMessage);

    // Генерація PDF
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `order_${Date.now()}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const fontPath = path.join(__dirname, "..", "fonts", "DejaVuSans.ttf");
    doc.font(fontPath);

    doc.fontSize(20).text("Замовлення", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Ім'я: ${name} ${lastname}`);
    doc.text(`Телефон: ${phone}`);
    doc.text(`Email: ${email}`);
    doc.text(`Нова Пошта: ${novaPoshtaBranch}`);
    doc.moveDown();
    doc.text("📦 Замовлені товари:");
    let yPosition = doc.y; // Отримуємо поточну позицію курсора
    
    for (const [index, item] of cartItems.entries()) {
      // Додаємо текст товару
      doc.text(`${index + 1}. ${item.name} (x${item.quantity}) - ₴${item.price * item.quantity}`);
      doc.text(`   Опис: ${item.description}`);
      doc.text(`   Артикул: ${item.sku}`);
    
      // Якщо є зображення, то додаємо його
      if (item.image_url) {
        try {
          const imageResponse = await axios({ url: item.image_url, responseType: "arraybuffer" });
          const imagePath = path.join(__dirname, `temp_image_${index}.jpg`);
          fs.writeFileSync(imagePath, imageResponse.data);
    
          // Розраховуємо нову позицію для зображення, щоб уникнути накладення
          const imageWidth = 100;  // Розмір зображення
          const imageHeight = 100;
          
          // Встановлюємо координати для зображення
          doc.image(imagePath, {
            fit: [imageWidth, imageHeight],
            align: 'right',
            valign: 'top',
            x: 450, // Координати X для зображення
            y: yPosition + 10 // Додаємо відступ, щоб не накладати на текст
          });
    
          // Оновлюємо позицію після вставки зображення
          yPosition = doc.y;
    
          // Видаляємо тимчасовий файл зображення
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error(`⚠️ Не вдалося завантажити зображення для ${item.name}:`, error.message);
        }
      }
    
      doc.moveDown();  // Додаємо відступ після товару для уникнення накладення
    }
    
    doc.text(`💰 Загальна сума: ₴${totalPrice}`);
    doc.end();

    stream.on("finish", async () => {
      console.log("📄 PDF-файл створено:", filePath);

      // Відправка PDF у Telegram
      await sendTelegramFile(filePath);

      // Видалення PDF після відправки
      fs.unlink(filePath, (err) => {
        if (err) console.error("❌ Помилка при видаленні PDF:", err);
        else console.log("🗑️ PDF-файл видалено");
      });

      res.json({ success: true, message: "Замовлення відправлено в Telegram" });
    });
  } catch (error) {
    console.error("❌ Помилка при обробці замовлення:", error);
    res.status(500).json({ error: "Помилка при надсиланні замовлення" });
  }
});

module.exports = router;
