const pool = require('../config/db'); // Підключаємо базу
const { comparePassword } = require('../utils/bcrypt');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Всі поля обов'язкові" });
  }

  try {
    const [userResult] = await pool.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (userResult.length === 0) {
      return res.status(401).json({ message: `Користувача ${email} не знайдено` });
    }

    const user = userResult[0];

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Невірний пароль' });
    }

    req.session.userId = user.user_id;
    req.session.email = user.email;

    res.status(200).json({ message: 'Авторизація успішна' });
    console.log('Авторизація успішна')

  } catch (error) {
    console.error('Помилка при авторизації:', error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
};

module.exports = { login };
