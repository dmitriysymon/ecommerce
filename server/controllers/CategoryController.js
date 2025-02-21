const pool = require("../config/db"); // Підключення до БД
const path = require("path");

exports.addCategory = async (req, res) => {
  console.log("Запит на додавання категорії отримано");
  try {
    console.log("Отримані дані:", req.body);
    // Отримуємо дані товару з req.body
    const { name, MainCategory } = req.body;

    console.log("Отримані дані:", name, ", ", MainCategory);
    // Вставляємо товар у таблицю products
    const [result] = await pool.execute(
      `INSERT INTO category (name, main_category_id) VALUES (?,?)`,
      [name, MainCategory]
    );

    const categoryId = result.insertId; // Отримуємо id нового товару
    console.log(`Категорію успішно додано, ID: ${categoryId}`);

    res.status(201).json({ message: "Категорію додано успішно", categoryId });
    console.log("Категорію успішно додано");
  } catch (error) {
    console.error("Помилка при додаванні категорії:", error);
    res.status(500).json({
      message: "Помилка при додаванні категорії",
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  console.log("Запит на видалення категорії отримано");
  try {
    const { categoryId } = req.query;
    console.log("Отриманий ID катddddегорії:", categoryId);

    const [result] = await pool.execute(
      `DELETE FROM category WHERE category_id = ?`,
      [categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Категорію не знайдено" });
    }

    console.log(`Категорію успішно видалено, ID: ${categoryId}`);
    res.status(200).json({ message: "Категорію видалено успішно" });
  } catch (error) {
    console.error("Помилка при видаленні категорії:", error);
    res.status(500).json({
      message: "Помилка при видаленні категорії",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  console.log("Запит на оновлення категорії отримано");
  try {
    const { categoryId } = req.body;
    const { name } = req.body;
    console.log("Отримані дані:", { categoryId, name });

    const [result] = await pool.execute(
      `UPDATE category SET name = ? WHERE category_id = ?`,
      [name, categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Категорію не знайдено" });
    }

    console.log(`Категорію успішно оновлено, ID: ${categoryId}`);
    res.status(200).json({ message: "Категорію оновлено успішно" });
  } catch (error) {
    console.error("Помилка при оновленні категорії:", error);
    res.status(500).json({
      message: "Помилка при оновленні категорії",
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  console.log("Запит на отримання списку категорій");
  try {
    const [categories] =
      await pool.execute(`SELECT category.category_id, category.name, main_category.name AS main_category_name
        FROM category
        JOIN main_category ON category.main_category_id = main_category.main_category_id`);
    console.log("Список категорій отримано успішно");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Помилка при отриманні списку категорій:", error);
    res.status(500).json({
      message: "Помилка при отриманні списку категорій",
      error: error.message,
    });
  }
};

exports.addMainCategory = async (req, res) => {
  console.log("Запит на додавання категорії отримано");
  try {
    // Отримуємо дані товару з req.body
    const { name } = req.body;

    console.log("Отримані дані:", { name });

    // Вставляємо товар у таблицю products
    const [result] = await pool.execute(
      `INSERT INTO main_category (name) VALUES (?)`,
      [name]
    );

    const categoryId = result.insertId; // Отримуємо id нового товару
    console.log(`Категорію успішно додано, ID: ${categoryId}`);

    res.status(201).json({ message: "Категорію додано успішно", categoryId });
    console.log("Категорію успішно додано");
  } catch (error) {
    console.error("Помилка при додаванні категорії:", error);
    res.status(500).json({
      message: "Помилка при додаванні категорії",
      error: error.message,
    });
  }
};

exports.deleteMainCategory = async (req, res) => {
  console.log("Запит на видалення категорії отримано");
  try {
    console.log("Отримано:", req.query);
    const { mainCategoryId } = req.query;
    console.log("Отриманий ID категорії:", mainCategoryId);

    const [result] = await pool.execute(
      `DELETE FROM main_category WHERE main_category_id = ?`,
      [mainCategoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Категорію не знайдено" });
    }

    console.log(`Категорію успішно видалено, ID: ${mainCategoryId}`);
    res.status(200).json({ message: "Категорію видалено успішно" });
  } catch (error) {
    console.error("Помилка при видаленні категорії:", error);
    res.status(500).json({
      message: "Помилка при видаленні категорії",
      error: error.message,
    });
  }
};

exports.updateMainCategory = async (req, res) => {
  console.log("Запит на оновлення категорії отримано");
  try {
    const { categoryId } = req.body;
    const { name } = req.body;
    console.log("Отримані дані:", { categoryId, name });

    const [result] = await pool.execute(
      `UPDATE main_category SET name = ? WHERE main_category_id = ?`,
      [name, categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Категорію не знайдено" });
    }

    console.log(`Категорію успішно оновлено, ID: ${categoryId}`);
    res.status(200).json({ message: "Категорію оновлено успішно" });
  } catch (error) {
    console.error("Помилка при оновленні категорії:", error);
    res.status(500).json({
      message: "Помилка при оновленні категорії",
      error: error.message,
    });
  }
};

exports.getAllMainCategories = async (req, res) => {
  console.log("Запит на отримання списку категорій");
  try {
    const [categories] = await pool.execute(
      `SELECT main_category_id, name FROM main_category`
    );
    console.log("Список категорій отримано успішно");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Помилка при отриманні списку категорій:", error);
    res.status(500).json({
      message: "Помилка при отриманні списку категорій",
      error: error.message,
    });
  }
};


exports.getCategoriesMenu = async (req, res) => {
  try {
      // Отримуємо всі головні категорії
      const [mainCategories] = await pool.execute(
          "SELECT main_category_id, name FROM main_category"
      );

      // Якщо немає головних категорій
      if (mainCategories.length === 0) {
          return res.status(404).json({ message: "Головні категорії не знайдено" });
      }

      // Масив для збереження категорій для кожної головної категорії
      const categoriesByMainCategory = [];

      // Проходимо по всіх головних категоріях і шукаємо їх підкатегорії
      for (const mainCategory of mainCategories) {
          // Отримуємо підкатегорії для кожної головної категорії
          const [subCategories] = await pool.execute(
              "SELECT category_id, name FROM category WHERE main_category_id = ?",
              [mainCategory.main_category_id]
          );

          // Додаємо підкатегорії до списку
          categoriesByMainCategory.push({
              main_category: mainCategory.name,
              categories: subCategories
          });

          // Встановлюємо заголовок для кожної головної категорії (без недопустимих символів)
          const headerName = `Main-Category-${mainCategory.main_category_id}`;
          const headerValue = encodeURIComponent(mainCategory.name); // кодуємо назву категорії для безпечного використання в заголовку
          res.setHeader(headerName, headerValue);
      }

      // Відправляємо відповідь
      res.json(categoriesByMainCategory);

  } catch (error) {
      console.error("Помилка при отриманні категорій:", error);
      res.status(500).json({ message: "Виникла помилка на сервері" });
  }
};


