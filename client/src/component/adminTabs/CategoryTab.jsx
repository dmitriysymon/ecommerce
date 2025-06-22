import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useBaseUrl } from "../../context/BaseUrlContext";

const CategoryTab = () => {
  const baseUrl = useBaseUrl();
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    mainCategory: "",
  });
  const [newMainCategory, setNewMainCategory] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/product/getCategoryList`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Помилка при завантаженні категорій:", error);
    }
  };

  const fetchMainCategories = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/product/getMainCategoryList`
      );
      setMainCategories(response.data);
    } catch (error) {
      console.error("Помилка при завантаженні головних категорій:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMainCategories();
  }, []);

  const handleEditCategory = async (categoryId) => {
    const updatedCategory = prompt("Введіть нову назву категорії:");
    if (!updatedCategory) return;

    try {
      await axios.put(`${baseUrl}/api/product/updCategory`, {
        categoryId,
        name: updatedCategory,
      });
      setCategories(
        categories.map((category) =>
          category.category_id === categoryId
            ? { ...category, name: updatedCategory }
            : category
        )
      );
    } catch (error) {
      console.error("Помилка при оновленні категорії:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю категорію?")) {
      try {
        await axios.delete(`${baseUrl}/api/product/delCategory`, {
          params: { categoryId },
        });
        setCategories(
          categories.filter((category) => category.category_id !== categoryId)
        );
        fetchCategories();
      } catch (error) {
        console.error("Помилка при видаленні категорії:", error);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.name || !newCategory.mainCategory) {
      console.log(
        "отримані дані: ",
        newCategory.name,
        newCategory.mainCategory
      );
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/api/product/addCategory`, {
        name: newCategory.name,
        MainCategory: newCategory.mainCategory,
      });

      // Оновлюємо список категорій
      setCategories((prevCategories) => [...prevCategories, response.data]);

      // Очищаємо `newCategory`
      setNewCategory({ name: "" });

      // Додатково викликаємо fetchCategories для гарантованого оновлення
      fetchCategories();
    } catch (error) {
      console.error("Помилка при створенні категорії:", error);
    }
  };

  return (
    <div className="container font-montserrat mx-auto p-4">
      <form onSubmit={handleAddCategory} className="mb-6">
        <input
          type="text"
          placeholder="Назва нової категорії"
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory((prevState) => ({
              ...prevState,
              name: e.target.value, // оновлюємо лише поле name
            }))
          }
          className="w-full p-2 border rounded-md"
        />
        <select
          value={newMainCategory.mainCategory}
          onChange={(e) =>
            setNewCategory({
              ...newCategory,
              mainCategory: e.target.value,
            })
          }
          className="w-full p-2 border rounded-md"
        >
          <option value="" disabled>
            Оберіть головну категорію
          </option>
          {mainCategories.map((mainCategory) => (
            <option
              key={mainCategory.main_category_id}
              value={mainCategory.main_category_id}
            >
              {mainCategory.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md"
        >
          Додати категорію
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-4">Список категорій</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.category_id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h4 className="text-lg font-semibold">{category.name}</h4>
            <h4 className="text-sm font-sans">{category.main_category_name}</h4>
            <button
              onClick={() => handleEditCategory(category.category_id)}
              className="mt-2 bg-green-500 text-white p-2 rounded-md"
            >
              Редагувати
            </button>
            <button
              onClick={() => handleDeleteCategory(category.category_id)}
              className="mt-2 bg-red-500 text-white p-2 rounded-md"
            >
              Видалити
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTab;
