const pool = require('../config/db'); // Підключаємо базу
const { hashPassword } = require('../utils/bcrypt');

const reg = async (req, res) => {
  const { name, lastname, email, phone, password } = req.body;

  if (!email || !password || !lastname || !name || !phone) {
    return res.status(400).json({ message: "Всі поля обов'язкові" });
  }

  try {
    const [existingUser] = await pool.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Користувач з таким email вже існує' });
    }

    const hashedPassword = await hashPassword(password);

    await pool.execute('INSERT INTO user (username, lastname, email, user_number, password) VALUES (?, ?, ?, ?, ?)', [name, lastname, email, phone, hashedPassword]);

    res.status(201).json({ message: 'Користувача успішно зареєстровано' });

  } catch (error) {
    console.error('Помилка при реєстрації:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

module.exports = { reg };
