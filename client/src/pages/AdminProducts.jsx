import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useBaseUrl } from "../context/BaseUrlContext";

const AdminProducts = () => {
  const baseUrl = useBaseUrl();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
    images: []
  });
  const [newCategory, setNewCategory] = useState('');

  // Завантаження товарів
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/product/listProduct`);
      setProducts(response.data);
    } catch (error) {
      console.error('Помилка при завантаженні товарів:', error);
    }
  };

  // Завантаження категорій
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/product/getCategoryList`);
      setCategories(response.data);
    } catch (error) {
      console.error('Помилка при завантаженні категорій:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const generateRandomSku = () => {
    const randomSku = Math.random().toString(36).slice(2, 10).toUpperCase();
    setNewProduct({ ...newProduct, sku: randomSku });
  };

  // Додавання нового товару
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('stock', newProduct.stock);
    formData.append('sku', newProduct.sku);
    newProduct.images.forEach(image => formData.append('images', image));

    try {
      const response = await axios.post(`${baseUrl}/api/product/addProduct`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProducts([...products, { ...newProduct, product_id: response.data.productId }]);
      setNewProduct({ name: '', description: '', price: '', stock: '', images: [] });
    } catch (error) {
      console.error('Помилка при додаванні товару:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    console.log("productId:", productId);
    if (window.confirm('Ви впевнені, що хочете видалити цей товар?')) {
      try {
        await axios.delete(`${baseUrl}/api/product/delProduct`, {
          params: { productId }
        });
        setProducts(products.filter(product => product.product_id !== productId));
      } catch (error) {
        console.error('Помилка при видаленні товару:', error);
      }
    }
  };

  const handleFileChange = (e) => {
    setNewProduct({ ...newProduct, images: Array.from(e.target.files) });
  };

  const handleEditCategory = async (categoryId) => {
    const updatedCategory = prompt('Введіть нову назву категорії:');
    if (!updatedCategory) return;

    console.log("categoryId:", categoryId);
    console.log("updatedCategory:", updatedCategory);

    try {
      await axios.put(`${baseUrl}/api/product/updCategory`, {
        categoryId,
        name: updatedCategory
      });
      setCategories(categories.map(category =>
        category.category_id === categoryId ? { ...category, name: updatedCategory } : category
      ));

      fetchCategories();
    } catch (error) {
      console.error('Помилка при оновленні категорії:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    console.log("categoryId:", categoryId);
    if (window.confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      try {
        await axios.delete(`${baseUrl}/api/product/delCategory`, {
          params: { categoryId }
        });
        setCategories(categories.filter(category => category.category_id !== categoryId));
        fetchCategories();
      } catch (error) {
        console.error('Помилка при видаленні категорії:', error);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return;
    try {
      const response = await axios.post(`${baseUrl}/api/product/addCategory`, { name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Помилка при створенні категорії:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Керування товарами</h2>

      <div className="flex mb-6 space-x-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 ${activeTab === 'products' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Товари
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 ${activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Категорії
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <form onSubmit={handleAddProduct} className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Назва товару"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="" disabled>Оберіть категорію</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Опис товару"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              type="number"
              placeholder="Ціна"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
            <input
              type="number"
              placeholder="Кількість на складі"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Артикул"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
              <button
                type="button"
                onClick={generateRandomSku}
                className="bg-gray-200 text-gray-800 p-2 w-64 rounded-md"
              >
                Автогенерація артикула
              </button>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md"
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md">
              Додати товар
            </button>
          </form>

          <h3 className="text-xl font-semibold mb-4">Список товарів</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.product_id} className="bg-white p-4 rounded-lg shadow-md">
                <h4 className="text-lg font-medium">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.description}</p>
                <p className="mt-2 font-bold">{product.price} грн</p>
                <p className="text-sm text-gray-400">Кількість на складі: {product.stock}</p>

                <div className="mt-4">
                  {product.images && product.images.length > 0 ? (
                    product.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-40 object-cover mb-4 rounded-md"
                      />
                    ))
                  ) : (
                    <p>Фото відсутнє</p>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    // onClick={() => handleEditProduct(product.product_id)}
                    className="bg-yellow-500 text-white py-1 px-2 rounded-md"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.product_id)}
                    className="bg-red-500 text-white py-1 px-2 rounded-md"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <form onSubmit={handleAddCategory} className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Назва нової категорії"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md">
              Створити категорію
            </button>
          </form>

          <h3 className="text-xl font-semibold mb-4">Список категорій</h3>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category.category_id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
                <span>{category.name}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      console.log("Передане categoryId:", category.category_id);
                      handleEditCategory(category.category_id)
                    }}
                    className="bg-yellow-500 text-white py-1 px-2 rounded-md"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.category_id)}
                    className="bg-red-500 text-white py-1 px-2 rounded-md"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProducts;
