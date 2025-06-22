const pool = require('../config/db'); // Підключення до бази даних

// Контролер для отримання даних користувача
const getUserData = async (req, res) => {
    if (req.session && req.session.userId) {
      try {
        const [userResult] = await pool.execute('SELECT * FROM user WHERE user_id = ?', [req.session.userId]);
  
        if (userResult.length === 0) {
          return res.status(404).json({ message: 'Користувача не знайдено' });
        }
  
        const user = userResult[0];
  
  
        // Повертаємо користувача і історію покупок
        res.status(200).json({
          userData: user
        });
      } catch (error) {
        console.error('Помилка при отриманні користувача:', error);
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
      }
    } else {
      res.status(401).json({ message: 'Сесія не знайдена або неактивна' });
    }
  };
  
module.exports = { getUserData };
