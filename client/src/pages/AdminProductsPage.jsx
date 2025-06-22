import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-custom-alert";
import { useBaseUrl } from "../context/BaseUrlContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AdminProductPage = () => {
  const baseUrl = useBaseUrl();
  const { id } = useParams();
  const { state } = useLocation();  
  const navigate = useNavigate();

  const product = state?.product; // Отримуємо дані про товар із `state`

  if (!product) {
    return <div className="text-center text-xl mt-20">Товар не знайдено</div>;
  }

  // Стани для редагування товару
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [currentImage, setCurrentImage] = useState(0);
  const [newImage, setNewImage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleAddImage = () => {
    if (newImage.trim()) {
      setEditedProduct({
        ...editedProduct,
        images: [...editedProduct.images, newImage],
      });
      setNewImage("");
    }
  };

  const handleRemoveImage = (index) => {
    setEditedProduct({
      ...editedProduct,
      images: editedProduct.images.filter((_, i) => i !== index),
    });
  };

  const handleUpdateProduct = async () => {
    try {
      await axios.put(`${baseUrl}/api/product/update/${id}`, editedProduct);
      toast.success("Товар оновлено!");
    } catch (error) {
      console.error("Помилка оновлення товару:", error);
      toast.error("Не вдалося оновити товар");
    }
  };

  const handleDeleteProduct = async () => {
    if (window.confirm("Ви впевнені, що хочете видалити цей товар?")) {
      try {
        await axios.delete(`${baseUrl}/api/product/delete/${id}`);
        toast.success("Товар видалено!");
        navigate("/admin/products");
      } catch (error) {
        console.error("Помилка видалення товару:", error);
        toast.error("Не вдалося видалити товар");
      }
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20 max-w-6xl">
      <h1 className="text-3xl font-semibold mb-6">Редагування товару</h1>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Галерея фото */}
        <div className="relative flex items-center">
          <div className="flex flex-col space-y-2">
            {editedProduct.images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt="thumb"
                  className={`w-20 h-20 object-cover rounded-sm cursor-pointer border-b-2 ${
                    currentImage === index ? "border-black" : "border-none"
                  }`}
                  onClick={() => setCurrentImage(index)}
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="relative ml-4">
            <img
              src={editedProduct.images[currentImage]}
              alt="main"
              className="w-[450px] h-[600px] object-cover rounded-lg shadow-lg"
            />

            <button
              onClick={() => setCurrentImage((prev) => (prev === 0 ? editedProduct.images.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => setCurrentImage((prev) => (prev === editedProduct.images.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Форма редагування */}
        <div className="space-y-4">
          <label className="block">
            <span className="font-semibold">Назва товару:</span>
            <input type="text" name="name" value={editedProduct.name} onChange={handleChange} className="w-full p-2 border rounded" />
          </label>

          <label className="block">
            <span className="font-semibold">Опис:</span>
            <textarea name="description" value={editedProduct.description} onChange={handleChange} className="w-full p-2 border rounded"></textarea>
          </label>

          <label className="block">
            <span className="font-semibold">Категорія:</span>
            <input type="text" name="category_name" value={editedProduct.category_name} onChange={handleChange} className="w-full p-2 border rounded" />
          </label>

          <label className="block">
            <span className="font-semibold">Артикул:</span>
            <input type="text" name="sku" value={editedProduct.sku} onChange={handleChange} className="w-full p-2 border rounded" />
          </label>

          <label className="block">
            <span className="font-semibold">Ціна (₴):</span>
            <input type="number" name="price" value={editedProduct.price} onChange={handleChange} className="w-full p-2 border rounded" />
          </label>

          {/* Додавання нового фото */}
          <div className="flex space-x-2">
            <input type="text" value={newImage} onChange={(e) => setNewImage(e.target.value)} className="w-full p-2 border rounded" placeholder="URL зображення" />
            <button onClick={handleAddImage} className="bg-green-500 text-white px-4 py-2 rounded">Додати</button>
          </div>

          {/* Кнопки дій */}
          <button onClick={handleUpdateProduct} className="w-full bg-blue-500 text-white py-3 rounded-lg">Оновити товар</button>
          <button onClick={handleDeleteProduct} className="w-full bg-red-500 text-white py-3 rounded-lg">Видалити товар</button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductPage;
