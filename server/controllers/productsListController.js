const db = require("../config/db");

// Отримання всіх товарів разом із фото
const getProducts = async (req, res) => {
  try {
    const [products] = await db.query(`SELECT 
    p.product_id,
    p.name,
    p.description,
    p.price,
    p.stock,
    p.created_at,
    p.updated_at,
    p.sku,
    c.name AS category_name
    FROM product p
    JOIN category c ON p.category_id = c.category_id;`);
    const [images] = await db.query("SELECT * FROM product_images");

    // Групуємо фото по product_id
    const imageMap = {};
    images.forEach((img) => {
      if (!imageMap[img.product_id]) {
        imageMap[img.product_id] = [];
      }
      imageMap[img.product_id].push(`http://localhost:5000${img.image_url}`);
    });

    // Додаємо масив фото до кожного товару
    const updatedProducts = products.map((product) => ({
      ...product,
      images: imageMap[product.product_id] || [], // Якщо фото немає, повертаємо порожній масив
    }));

    res.json(updatedProducts);
  } catch (err) {
    console.error("Помилка при отриманні товарів або фото:", err);
    return res.status(500).json({ message: "Помилка сервера" });
  }
};

module.exports = { getProducts };
