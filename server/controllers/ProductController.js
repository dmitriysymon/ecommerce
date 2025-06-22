const pool = require("../config/db"); // Підключення до БД
const path = require("path");

exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, sku, sex, category } = req.body;
    // variants приймаємо у вигляді JSON-рядка, розпарсимо
    let variants = [];
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch {
        console.warn("Не вдалося розпарсити variants");
      }
    }

    // Додаємо товар
    const [result] = await pool.execute(
      `INSERT INTO product (name, description, price, sku, sex, category_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, sku, sex, category]
    );

    const productId = result.insertId;

    // Додаємо варіації (розміри + кольори)
    if (Array.isArray(variants)) {
      for (const [index, variant] of variants.entries()) {
        const { size, color, stock } = variant;

        try {
          await pool.execute(
            `INSERT INTO product_variants (product_id, size, color, quantity, sku)
             VALUES (?, ?, ?, ?, ?)`,
            [productId, size || null, color || null, stock || 0, sku || null]
          );
        } catch (err) {
          console.error(
            `❌ Помилка при додаванні варіанту #${index + 1}:`,
            err.message
          );
        }
      }
    } else {
      console.warn("⚠️ 'variants' не є масивом. Пропущено вставку варіацій.");
    }

    // Додаємо фото (якщо є)
    const files = req.files;
    const colors = req.body.imageColors;

    const colorArray = Array.isArray(colors) ? colors : [colors];

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const color = colorArray[i]; // Прив'язаний колір

        const imageUrl = `/uploads/${file.filename}`;

        await pool.execute(
          `INSERT INTO product_images (product_id, image_url, color) VALUES (?, ?, ?)`,
          [productId, imageUrl, color]
        );
      }
    }

    res
      .status(201)
      .json({ message: "Товар та варіації додано успішно", productId });
  } catch (error) {
    console.error("Помилка при додаванні товару:", error);
    res
      .status(500)
      .json({ message: "Помилка при додаванні товару", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.query;

    const [result] = await pool.execute(
      `DELETE FROM product WHERE product_id = ?`,
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Товар не знайдено" });
    }

    res.status(200).json({ message: "Товар видалено успішно" });
  } catch (error) {
    console.error("Помилка при видаленні товару:", error);
    res
      .status(500)
      .json({ message: "Помилка при видаленні товару", error: error.message });
  }
};

exports.getProductsBy = async (req, res) => {
  try {
    const { search } = req.query;

    // Підзапит, що вибирає по одному зображенню з мінімальним image_id для кожного товару
    const imageSubquery = `
      SELECT pi.product_id, pi.image_url, pi.color
      FROM product_images pi
      INNER JOIN (
        SELECT product_id, MIN(image_id) AS min_image_id
        FROM product_images
        GROUP BY product_id
      ) AS first_images ON pi.product_id = first_images.product_id AND pi.image_id = first_images.min_image_id
    `;

    let query = `
      SELECT p.*, pi.image_url, pi.color
      FROM product p
      LEFT JOIN (${imageSubquery}) pi ON pi.product_id = p.product_id
    `;

    const params = [];

    if (search) {
      query += ` WHERE p.name LIKE ? OR p.sku LIKE ?`;
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch);
    }

    const [rows] = await pool.execute(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Помилка при отриманні продуктів:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};
