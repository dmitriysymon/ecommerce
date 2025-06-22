const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const sessionConfig = require('./config/sessionConfig');
const authRoutes = require('./routes/authRoutes');
const regRoutes = require('./routes/regRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const telegramRoutes = require('./routes/telegramRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(sessionConfig);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Використання маршрутів
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/register', regRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/order',orderRoutes);


app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(middleware.route.path, Object.keys(middleware.route.methods));
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((nestedMiddleware) => {
      if (nestedMiddleware.route) {
        console.log(nestedMiddleware.route.path, Object.keys(nestedMiddleware.route.methods));
      }
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, 'localhost', () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
