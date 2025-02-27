import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { useBaseUrl } from "../context/BaseUrlContext";

const Products = () => {
  const baseUrl = useBaseUrl();
  const { category } = useParams();
  const openCategory = category ? decodeURIComponent(category) : "";
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("priceAsc");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (openCategory !== undefined && openCategory !== null) {
      setSelectedCategory(openCategory);
    } else {
      setSelectedCategory("");
    }
  }, [openCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/product/getCategoriesMenu`
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Помилка при завантаженні категорій:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/product/listProduct`);
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Помилка завантаження продуктів:", error);
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const sortedProducts = [...products].sort((a, b) =>
    sortOption === "priceAsc" ? a.price - b.price : b.price - a.price
  );

  const filteredProducts = sortedProducts.filter((product) => {
    if (selectedCategory === "" || selectedCategory === "Усі") {
      return true;
    }

    const isSubCategory = categories.some((mainCategory) =>
      mainCategory.categories.some(
        (sub) =>
          sub.name === selectedCategory && sub.name === product.category_name
      )
    );

    const isMainCategory = categories.some(
      (mainCategory) =>
        mainCategory.main_category === selectedCategory &&
        mainCategory.categories.some(
          (sub) => sub.name === product.category_name
        )
    );

    return isSubCategory || isMainCategory;
  });

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    navigate(`/products/${encodeURIComponent(categoryName)}`);
  };

  const generateBreadcrumbs = () => {
    let breadcrumbs = ["Головна", "Товари"];
    if (selectedCategory) {
      breadcrumbs.push(selectedCategory);
    }
    return breadcrumbs.map((crumb, index) => {
      if (index < breadcrumbs.length - 1) {
        return (
          <span key={index}>
            <Link
              to={
                index === 0
                  ? "/"
                  : `/products/${encodeURIComponent(selectedCategory)}`
              }
            >
              {crumb}
            </Link>{" "}
            /{" "}
          </span>
        );
      } else {
        return <span key={index}>{crumb}</span>;
      }
    });
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <section className="font-montserrat tracking-wider max-w-screen-2xl left-0 py-20 px-4 sm:px-6 md:px-8">
      {/* 🔥 Хлібні крихти */}
      <div className="mb-4 text-lg text-gray-600">{generateBreadcrumbs()}</div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 🔥 Фільтр категорій */}
        <div className="w-full lg:w-1/4 bg-gray-100 p-6 rounded-lg shadow-md mb-8 lg:mb-0">
          <h3 className="text-xl font-semibold mb-4">Фільтри</h3>
          <button
            className={`w-full text-base text-left font-semibold py-2 ${
              selectedCategory === "" ? "text-blue-600" : "text-black"
            }`}
            onClick={() => handleCategoryClick("")}
          >
            Усі товари
          </button>
          <div className="space-y-2">
            {categories.map((mainCategory) => (
              <div key={mainCategory.main_category}>
                {/* 🔥 Головна категорія */}
                <button
                  className={`w-full text-base text-left font-semibold py-2 ${
                    selectedCategory === mainCategory.main_category
                      ? "text-blue-600"
                      : "text-black"
                  }`}
                  onClick={() =>
                    handleCategoryClick(mainCategory.main_category)
                  }
                >
                  {mainCategory.main_category}
                </button>

                {/* 🔥 Підкатегорії */}
                {mainCategory.categories.map((category) => (
                  <div key={category.category_id} className="pl-4">
                    <button
                      className={`text-sm block w-full text-left px-4 py-1 ${
                        selectedCategory === category.name
                          ? "text-blue-600 font-semibold"
                          : "text-black"
                      }`}
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.name}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 Сітка товарів */}
        <div className="w-full lg:w-3/4">
          {/* 🔥 Сортування */}
          <div className="flex items-center mb-6 space-x-4">
            <div className="text-lg font-semibold">Сортування:</div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-sm"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="priceAsc">Ціна (за зростанням)</option>
              <option value="priceDesc">Ціна (за спаданням)</option>
            </select>
          </div>

          {/* 🔥 Список товарів */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="bg-white p-4 rounded-lg cursor-pointer"
                  onClick={() =>
                    navigate(`/product/${product.product_id}`, {
                      state: { product },
                    })
                  }
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 flex justify-center items-center text-gray-500 mb-4">
                      Фото відсутнє
                    </div>
                  )}
                  <p className="">{product.name}</p>
                  <p className="text-black font-semibold">{product.price} грн</p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 col-span-4">
                Товари не знайдені
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
