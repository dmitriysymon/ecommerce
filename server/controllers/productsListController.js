const db = require("../config/db");

const serverUrl = "http://localhost:5000";

// Отримання всіх товарів разом із фото
const getProducts = async (req, res) => {
  try {
    const { sex, category, min_price, max_price } = req.query;

    const parseCommaSeparatedArray = (arr) => {
      if (!arr) return [];
      if (Array.isArray(arr)) {
        return arr.flatMap((item) =>
          item
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }
      return arr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    };

    const colors = parseCommaSeparatedArray(req.query.color);
    const sizes = parseCommaSeparatedArray(req.query.size);

    const filters = [];
    const values = [];

    let joins = `
      FROM product p
      JOIN category c ON p.category_id = c.category_id
    `;

    // Потрібен join з variants для фільтрації
    const filterByVariants = colors.length > 0 || sizes.length > 0;
    if (filterByVariants) {
      joins += ` JOIN product_variants v ON p.product_id = v.product_id `;
    }

    if (sex) {
      filters.push(`p.sex = ?`);
      values.push(sex);
    }

    if (category) {
      filters.push(`c.name = ?`);
      values.push(category);
    }

    if (min_price) {
      filters.push(`p.price >= ?`);
      values.push(min_price);
    }

    if (max_price) {
      filters.push(`p.price <= ?`);
      values.push(max_price);
    }

    if (colors.length > 0) {
      filters.push(`v.color IN (${colors.map(() => "?").join(",")})`);
      values.push(...colors);
    }

    if (sizes.length > 0) {
      filters.push(`v.size IN (${sizes.map(() => "?").join(",")})`);
      values.push(...sizes);
    }

    let sql = `
      SELECT DISTINCT p.product_id, p.name, p.description, p.price, p.stock,
                      p.created_at, p.updated_at, p.sku, p.sex,
                      c.name AS category_name
      ${joins}
    `;

    if (filters.length > 0) {
      sql += " WHERE " + filters.join(" AND ");
    }

    filters.push(`p.is_deleted = 0`);

    const [products] = await db.query(sql, values);

    const [images] = await db.query("SELECT * FROM product_images");
    const [variants] = await db.query(
      "SELECT product_id, color, size FROM product_variants"
    );

    // Створимо мапу варіантів та фото
    const imageMap = {};
    images.forEach(({ product_id, color, image_url }) => {
      const key = `${product_id}-${color}`;
      if (!imageMap[key]) imageMap[key] = [];
      imageMap[key].push(`${serverUrl}${image_url}`);
    });

    const variantsMap = {};
    variants.forEach(({ product_id, color, size }) => {
      const key = `${product_id}-${color}`;
      if (!variantsMap[key]) {
        variantsMap[key] = { product_id, color, sizes: new Set() };
      }
      if (size) variantsMap[key].sizes.add(size);
    });

    const colorMap = {};
    variants.forEach(({ product_id, color }) => {
      if (!colorMap[product_id]) {
        colorMap[product_id] = new Set();
      }
      colorMap[product_id].add(color);
    });

    const finalProducts = [];

    for (const product of products) {
      const relevantKeys = Object.keys(variantsMap).filter((key) => {
        const [pId, color] = key.split("-");
        if (parseInt(pId) !== product.product_id) return false;

        const entry = variantsMap[key];
        const sizeMatch =
          sizes.length === 0 ||
          Array.from(entry.sizes).some((s) => sizes.includes(s));
        const colorMatch = colors.length === 0 || colors.includes(color);

        return sizeMatch && colorMatch;
      });

      for (const key of relevantKeys) {
        const entry = variantsMap[key];
        finalProducts.push({
          ...product,
          color: entry.color,
          sizes: Array.from(entry.sizes),
          images: imageMap[key] || [],
          colors: Array.from(colorMap[product.product_id] || []),
        });
      }
    }

    res.json(finalProducts);
  } catch (err) {
    console.error("Помилка при отриманні товарів:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getTopSellers = async (req, res) => {
  try {
    const sql = `
      SELECT p.product_id, p.name, p.description, p.price, p.stock,
             p.created_at, p.updated_at, p.sku, p.sex,
             c.name AS category_name,
             SUM(oi.quantity) AS total_sold
      FROM order_items oi
JOIN product_variants pv ON oi.variant_id = pv.id
JOIN product p ON pv.product_id = p.product_id AND p.is_deleted = 0
      JOIN category c ON p.category_id = c.category_id
      GROUP BY p.product_id
      ORDER BY total_sold DESC
      LIMIT 20
    `;
    const [products] = await db.query(sql);

    const [images] = await db.query("SELECT * FROM product_images");
    const [variants] = await db.query(
      "SELECT product_id, color, size FROM product_variants"
    );

    const result = enrichProducts(products, images, variants);
    res.json(result);
  } catch (err) {
    console.error("Помилка при отриманні топ продажів:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getNewArrivals = async (req, res) => {
  try {
    const sql = `
      SELECT p.product_id, p.name, p.description, p.price, p.stock, 
             p.created_at, p.updated_at, p.sku, p.sex, 
             c.name AS category_name
      FROM product p
JOIN category c ON p.category_id = c.category_id
WHERE p.is_deleted = 0
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
    const [products] = await db.query(sql);

    const [images] = await db.query("SELECT * FROM product_images");
    const [variants] = await db.query(
      "SELECT product_id, color, size FROM product_variants"
    );

    // далі - аналогічна обробка як у getProducts:
    const result = enrichProducts(products, images, variants);
    res.json(result);
  } catch (err) {
    console.error("Помилка при отриманні новинок:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getSimilarProducts = async (req, res) => {
  try {
    const { product_id } = req.params;

    const [[product]] = await db.query(
      `SELECT category_id, sex FROM product WHERE product_id = ?`,
      [product_id]
    );

    if (!product) return res.status(404).json({ message: "Товар не знайдено" });

    const sql = `
      SELECT p.product_id, p.name, p.description, p.price, p.stock,
             p.created_at, p.updated_at, p.sku, p.sex,
             c.name AS category_name
      FROM product p
JOIN category c ON p.category_id = c.category_id
WHERE p.category_id = ? AND p.sex = ? AND p.product_id != ? AND p.is_deleted = 0
      ORDER BY RAND()
      LIMIT 12
    `;

    const [products] = await db.query(sql, [
      product.category_id,
      product.sex,
      product_id,
    ]);

    const [images] = await db.query("SELECT * FROM product_images");
    const [variants] = await db.query(
      "SELECT product_id, color, size FROM product_variants"
    );

    const result = enrichProducts(products, images, variants);
    res.json(result);
  } catch (err) {
    console.error("Помилка при отриманні схожих товарів:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

const getProductByIdAndColor = async (req, res) => {
  try {
    const { id } = req.params;
    const color = req.query.color;

    // Отримуємо основну інформацію про товар за id
    const [products] = await db.query(
      `
        SELECT 
          p.product_id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.created_at,
          p.updated_at,
          p.sku,
          p.sex,
          c.name AS category_name
        FROM product p
        JOIN category c ON p.category_id = c.category_id
        WHERE p.product_id = ? AND p.is_deleted = 0;
      `,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "Товар не знайдено" });
    }

    const product = products[0];

    // Отримуємо варіанти товару (всі кольори, і розміри для потрібного кольору)
    const [variants] = await db.query(
      `
        SELECT color, size
        FROM product_variants
        WHERE product_id = ?;
      `,
      [id]
    );

    // Збираємо всі унікальні кольори для цього товару
    const allColors = new Set();
    // Збираємо розміри тільки для вибраного кольору
    const sizesForColor = new Set();

    variants.forEach(({ color: variantColor, size }) => {
      allColors.add(variantColor);
      if (variantColor === color) {
        sizesForColor.add(size);
      }
    });

    if (!allColors.has(color)) {
      return res
        .status(404)
        .json({ message: "Кольорова варіація не знайдена" });
    }

    // Отримуємо фото для цього товару і кольору
    const [images] = await db.query(
      `
        SELECT image_url
        FROM product_images
        WHERE product_id = ? AND color = ?;
      `,
      [id, color]
    );

    const imageUrls = images.map((img) => `${serverUrl}${img.image_url}`);

    // Формуємо відповідь
    const result = {
      ...product,
      color,
      sizes: Array.from(sizesForColor),
      images: imageUrls,
      colors: Array.from(allColors),
    };

    res.json(result);
  } catch (err) {
    console.error("Помилка при отриманні товару:", err);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

function enrichProducts(products, images, variants) {
  const imageMap = {};
  images.forEach(({ product_id, color, image_url }) => {
    const key = `${product_id}-${color}`;
    if (!imageMap[key]) imageMap[key] = [];
    imageMap[key].push(`${serverUrl}${image_url}`);
  });

  const variantsMap = {};
  variants.forEach(({ product_id, color, size }) => {
    const key = `${product_id}-${color}`;
    if (!variantsMap[key]) variantsMap[key] = { color, sizes: new Set() };
    variantsMap[key].sizes.add(size);
  });

  const colorMap = {};
  variants.forEach(({ product_id, color }) => {
    if (!colorMap[product_id]) colorMap[product_id] = new Set();
    colorMap[product_id].add(color);
  });

  const final = [];

  for (const product of products) {
    const keys = Object.keys(variantsMap).filter((key) =>
      key.startsWith(`${product.product_id}-`)
    );

    for (const key of keys) {
      const { color, sizes } = variantsMap[key];
      final.push({
        ...product,
        color,
        sizes: Array.from(sizes),
        colors: Array.from(colorMap[product.product_id] || []),
        images: imageMap[key] || [],
      });
    }
  }

  return final;
}

module.exports = {
  getProducts,
  getProductByIdAndColor,
  getNewArrivals,
  getSimilarProducts,
  getTopSellers,
};
