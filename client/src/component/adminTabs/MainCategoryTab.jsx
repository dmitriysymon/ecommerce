import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useBaseUrl } from "../../context/BaseUrlContext";

const MainCategoryTab = () => {
  const baseUrl = useBaseUrl();

  const [mainCategories, setMainCategories] = useState([]);

  const [newMainCategory, setNewMainCategory] = useState("");

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
    fetchMainCategories();
  }, []);

  const handleDeleteMainCategory = async (mainCategoryId) => {
    if (
      window.confirm("Ви впевнені, що хочете видалити цю головну категорію?")
    ) {
      try {
        await axios.delete(`${baseUrl}/api/product/delMainCategory`, {
          params: { mainCategoryId },
        });
        setMainCategories(
          mainCategories.filter(
            (mainCategory) => mainCategory.main_category_id !== mainCategoryId
          )
        );
        fetchMainCategories();
      } catch (error) {
        console.error("Помилка при видаленні головної категорії:", error);
      }
    }
  };

  const handleAddMainCategory = async (e) => {
    e.preventDefault();
    if (!newMainCategory.name) return;
    try {
      const response = await axios.post(
        `${baseUrl}/api/product/addMainCategory`,
        { name: newMainCategory.name }
      );
      setMainCategories([...mainCategories, response.data]);
      setNewMainCategory({ name: "", mainCategory: "" });
      fetchMainCategories();
    } catch (error) {
      console.error("Помилка при створенні головної категорії:", error);
    }
  };

  return (
    <div className="container font-montserrat mx-auto p-4">
      <form onSubmit={handleAddMainCategory} className="mb-6">
        <input
          type="text"
          placeholder="Назва головної категорії"
          value={newMainCategory.name}
          onChange={(e) =>
            setNewMainCategory({ ...newMainCategory, name: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          required
        />
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md"
        >
          Додати головну категорію
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-4">Список головних категорій</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mainCategories.map((mainCategory) => (
          <div
            key={mainCategory.main_category_id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h4 className="text-lg font-semibold">{mainCategory.name}</h4>
            <button
              onClick={() =>
                handleDeleteMainCategory(mainCategory.main_category_id)
              }
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

export default MainCategoryTab;
