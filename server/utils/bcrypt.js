const bcrypt = require("bcrypt");

const saltRounds = 10; // Кількість раундів для генерації солі

// Функція для хешування пароля
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  console.log('порівняння паролей');
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
