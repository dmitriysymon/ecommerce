const pool = require('../config/db'); // Підключення до БД
const path = require('path');

exports.addProduct = async (req, res) => {
  console.log('Запит на додавання товару отримано');
  try {
    // Отримуємо дані товару з req.body
    const { name, description, price, stock, sku, category } = req.body;

    console.log('Отримані дані товару:', { name, description, price, stock, sku, category});

    // Вставляємо товар у таблицю products
    const [result] = await pool.execute(
      `INSERT INTO product (name, description, price, stock, sku, category_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock, sku, category]
    );

    const productId = result.insertId; // Отримуємо id нового товару
    console.log(`Товар успішно додано, ID: ${productId}`);

    // Обробка завантажених файлів (якщо є)
    const files = req.files;
    if (files && files.length > 0) {
      console.log(`Завантажено ${files.length} файл(ів)`);

      for (const file of files) {
        // Формуємо URL для фото. Припускаємо, що папку uploads експортуємо як статичну.
        const imageUrl = `/uploads/${file.filename}`;
        console.log(`Завантажено зображення: ${imageUrl}`);

        await pool.execute(
          `INSERT INTO product_images (product_id, image_url) VALUES (?, ?)`,
          [productId, imageUrl]
        );
      }
    } else {
      console.log('Файли не були завантажені');
    }

    res.status(201).json({ message: 'Товар додано успішно', productId });
    console.log('Товар успішно додано');
  } catch (error) {
    console.error('Помилка при додаванні товару:', error);
    res.status(500).json({ message: 'Помилка при додаванні товару', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  console.log('Запит на видалення товару отримано');
  try {
    const { productId } = req.query;
    console.log('Отриманий ID товару:', productId);

    const [result] = await pool.execute(
      `DELETE FROM product WHERE product_id = ?`,
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }

    console.log(`Товар успішно видалено, ID: ${productId}`);
    res.status(200).json({ message: 'Товар видалено успішно' });
  } catch (error) {
    console.error('Помилка при видаленні товару:', error);
    res.status(500).json({ message: 'Помилка при видаленні товару', error: error.message });
  }
};
