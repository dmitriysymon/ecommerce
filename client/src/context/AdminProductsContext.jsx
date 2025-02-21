// src/context/ApiContext.js
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useBaseUrl } from './BaseUrlContext';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const baseUrl = useBaseUrl();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

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

  // Додавання нового товару
  const addProduct = async (newProduct) => {
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
    } catch (error) {
      console.error('Помилка при додаванні товару:', error);
    }
  };

  // Видалення товару
  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${baseUrl}/api/product/delProduct`, { params: { productId } });
      setProducts(products.filter(product => product.product_id !== productId));
    } catch (error) {
      console.error('Помилка при видаленні товару:', error);
    }
  };

  // Оновлення категорії
  const updateCategory = async (categoryId, updatedCategoryName) => {
    try {
      await axios.put(`${baseUrl}/api/product/updCategory`, {
        categoryId,
        name: updatedCategoryName
      });
      setCategories(categories.map(category =>
        category.category_id === categoryId ? { ...category, name: updatedCategoryName } : category
      ));
      fetchCategories(); // Оновлення списку категорій
    } catch (error) {
      console.error('Помилка при оновленні категорії:', error);
    }
  };

  // Видалення категорії
  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${baseUrl}/api/product/delCategory`, { params: { categoryId } });
      setCategories(categories.filter(category => category.category_id !== categoryId));
      fetchCategories(); // Оновлення списку категорій
    } catch (error) {
      console.error('Помилка при видаленні категорії:', error);
    }
  };

  // Додавання нової категорії
  const addCategory = async (newCategory) => {
    try {
      const response = await axios.post(`${baseUrl}/api/product/addCategory`, { name: newCategory });
      setCategories([...categories, response.data]);
    } catch (error) {
      console.error('Помилка при створенні категорії:', error);
    }
  };

  return (
    <ApiContext.Provider value={{
      products,
      categories,
      fetchProducts,
      fetchCategories,
      addProduct,
      deleteProduct,
      updateCategory,
      deleteCategory,
      addCategory
    }}>
      {children}
    </ApiContext.Provider>
  );
};
