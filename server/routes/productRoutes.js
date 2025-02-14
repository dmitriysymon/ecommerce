const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/ProductController');
const productListController = require('../controllers/productsListController');
const categoryController = require('../controllers/CategoryController');

// Налаштування Multer для збереження файлів у папку "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Завантаження файлу в папку uploads');
    cb(null, 'uploads/'); // Переконайтеся, що ця папка існує
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log(`Файл отримано: ${file.originalname}, нове ім’я файлу: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ storage });

router.post('/addProduct', upload.array('images'), (req, res, next) => {
  console.log('Запит на додавання товару отримано на маршруті');
  next(); 
}, productController.addProduct);

router.delete('/delProduct',(req, res, next) =>{
  console.log("Отриманий запит:", req.query);
  next();
}, productController.deleteProduct);

router.get('/listProduct', (req, res, next) => {
  console.log('Запит на отримання списку товарів');
  next();
}, productListController.getProducts);   






router.post('/addCategory', categoryController.addCategory);

router.delete('/delCategory',(req, res, next) =>{
  console.log("Отриманий запит:", req.query);
  next();
}, categoryController.deleteCategory);

router.put('/updCategory', (req, res, next) => {
  console.log("Отриманий запит:", req.body);
  const { categoryId, name } = req.body;
  if (!categoryId || !name) {
    return res.status(400).json({ error: 'Не вказано categoryId або name' });
  }
  next();
}, categoryController.updateCategory);

router.get('/getCategoryList', categoryController.getAllCategories);

module.exports = router;
