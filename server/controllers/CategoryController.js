const pool = require('../config/db'); // Підключення до БД
const path = require('path');

exports.addCategory = async (req, res) => {
  console.log('Запит на додавання категорії отримано');
  try {
    // Отримуємо дані товару з req.body
    const { name } = req.body;

    console.log('Отримані дані:', { name });

    // Вставляємо товар у таблицю products
    const [result] = await pool.execute(
      `INSERT INTO category (name) VALUES (?)`,
      [name]
    );

    const categoryId = result.insertId; // Отримуємо id нового товару
    console.log(`Категорію успішно додано, ID: ${categoryId}`);

    res.status(201).json({ message: 'Категорію додано успішно', categoryId });
    console.log('Категорію успішно додано');
  } catch (error) {
    console.error('Помилка при додаванні категорії:', error);
    res.status(500).json({ message: 'Помилка при додаванні категорії', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
    console.log('Запит на видалення категорії отримано');
    try {
      const { categoryId } = req.query;
      console.log('Отриманий ID категорії:', categoryId);
  
      const [result] = await pool.execute(
        `DELETE FROM category WHERE category_id = ?`,
        [categoryId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Категорію не знайдено' });
      }
  
      console.log(`Категорію успішно видалено, ID: ${categoryId}`);
      res.status(200).json({ message: 'Категорію видалено успішно' });
    } catch (error) {
      console.error('Помилка при видаленні категорії:', error);
      res.status(500).json({ message: 'Помилка при видаленні категорії', error: error.message });
    }
  };
  
  exports.updateCategory = async (req, res) => {
    console.log('Запит на оновлення категорії отримано');
    try {
      const { categoryId } = req.body;
      const { name } = req.body;
      console.log('Отримані дані:', { categoryId, name });
  
      const [result] = await pool.execute(
        `UPDATE category SET name = ? WHERE category_id = ?`,
        [name, categoryId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Категорію не знайдено' });
      }
  
      console.log(`Категорію успішно оновлено, ID: ${categoryId}`);
      res.status(200).json({ message: 'Категорію оновлено успішно' });
    } catch (error) {
      console.error('Помилка при оновленні категорії:', error);
      res.status(500).json({ message: 'Помилка при оновленні категорії', error: error.message });
    }
  };

  exports.getAllCategories = async (req, res) => {
  console.log('Запит на отримання списку категорій');
  try {
    const [categories] = await pool.execute(`SELECT category_id, name FROM category`);
    console.log('Список категорій отримано успішно');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Помилка при отриманні списку категорій:', error);
    res.status(500).json({ message: 'Помилка при отриманні списку категорій', error: error.message });
  }
};
  
