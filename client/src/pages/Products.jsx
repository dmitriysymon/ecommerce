import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useBaseUrl } from "../context/BaseUrlContext";
import SidebarFilters from "../component/SidebarFilters";
import { getAvailableFilters } from "../utils/productFilters.js";

const Products = () => {
  const baseUrl = useBaseUrl();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const [sortOption, setSortOption] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarFixed, setIsSidebarFixed] = useState(false);

  const [selectedSex, setSelectedSex] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  const [availableFilters, setAvailableFilters] = useState({
    sizes: [],
    colors: [],
    priceRange: [0, 0],
  });

  useEffect(() => {
  const fetchEverything = async () => {
    setLoading(true);

    // 1️⃣ Оновити фільтри з URL
    const newSex = queryParams.get("sex") || "";
    const newCategories = queryParams.get("categories")?.split(",") || [];
    const newSizes = parseQueryArray(queryParams.getAll("sizes"));
    const newColors = parseQueryArray(queryParams.getAll("colors"));
    const newMinPrice = queryParams.get("min_price") || null;
    const newMaxPrice = queryParams.get("max_price") || null;

    setSelectedSex(newSex);
    setSelectedCategories(newCategories);
    setSelectedSizes(newSizes);
    setSelectedColors(newColors);
    setPriceMin(newMinPrice);
    setPriceMax(newMaxPrice);

    try {
      // 2️⃣ Отримати категорії
      const categoriesRes = await fetch(`${baseUrl}/api/product/getCategoriesMenu`);
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }

      // 3️⃣ Отримати продукти
      const productsRes = await axios.get(`${baseUrl}/api/product/listProduct`, {
        params: {
          sex: newSex,
          category: newCategories?.[0],
          color: newColors,
          size: newSizes,
          min_price: newMinPrice,
          max_price: newMaxPrice,
        },
      });

      setProducts(productsRes.data);
      setAvailableFilters(getAvailableFilters(productsRes.data));
    } catch (error) {
      console.error("Помилка при завантаженні:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchEverything();
}, [location.search]);


  const sortedProducts = useMemo(() => {
    if (sortOption === "priceAsc")
      return [...products].sort((a, b) => a.price - b.price);
    if (sortOption === "priceDesc")
      return [...products].sort((a, b) => b.price - a.price);
    return products;
  }, [products, sortOption]);

  const getSexDisplayName = (sex) => {
    switch (sex) {
      case "male":
        return "Чоловік";
      case "female":
        return "Жінка";
      case "kids":
        return "Діти";
      default:
        return "Усі";
    }
  };

  const parseQueryArray = (param) => {
    if (!param) return [];
    if (Array.isArray(param)) {
      return param.flatMap((item) =>
        item
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    }
    return param
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [{ label: "НОВИНКА", path: "/" }];

    if (selectedSex) {
      breadcrumbs.push({
        label: getSexDisplayName(selectedSex),
        path: `/products?sex=${getSexDisplayName(selectedSex)}`,
      });
    }

    if (selectedCategories.length > 0) {
      const mainCategory = categories.find(
        (main) =>
          main.main_category === selectedCategories[0] ||
          main.categories.some((sub) => sub.name === selectedCategories[0])
      );

      if (mainCategory) {
        breadcrumbs.push({ label: mainCategory.main_category + ` / ` });
        const subCategory = mainCategory.categories.find(
          (cat) => cat.name === selectedCategories[0]
        );
        if (subCategory) breadcrumbs.push({ label: subCategory.name });
      }
    }

    return breadcrumbs.map((crumb, index) =>
      crumb.path ? (
        <span key={index}>
          <Link to={crumb.path}>{crumb.label}</Link> /{" "}
        </span>
      ) : (
        <span key={index}>{crumb.label}</span>
      )
    );
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <section className="font-montserrat tracking-tight py-20 px-4 sm:px-6 md:px-8">
      <div className="hidden sm:block mb-4 text-lg text-left text-gray-600">
        {generateBreadcrumbs()}
      </div>

      <div className="lg:hidden sticky left-0 right-0 z-30 bg-white px-4 py-2 shadow flex justify-between items-center">
        <button
          className="text-black border border-gray-300 px-4 py-2"
          onClick={() => setIsFilterOpen(true)}
        >
          Категорії
        </button>
        <select
          className="ml-2 px-4 py-2 border border-gray-300 rounded-sm"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="" disabled>
            Сортування
          </option>
          <option value="priceAsc">Ціна ↑</option>
          <option value="priceDesc">Ціна ↓</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-5">
        <SidebarFilters
          categories={categories}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          availableFilters={availableFilters}
          setIsFilterOpen={setIsFilterOpen}
          location={location}
          navigate={navigate}
          selectedSex={selectedSex}
          isFilterOpen={isFilterOpen}
          isSidebarFixed={isSidebarFixed}
        />

        <div className="w-full lg:w-3/4">
          <div className="hidden lg:flex items-center mb-6 space-x-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-sm"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="" disabled>
                Сортування
              </option>
              <option value="priceAsc">Ціна (за зростанням)</option>
              <option value="priceDesc">Ціна (за спаданням)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="cursor-pointer border border-gray-100 hover:shadow-md"
                  onClick={() => {
                    const selectedColor =
                      product.color ?? product.colors?.[0] ?? null;
                    const colorSlug = selectedColor
                      ? encodeURIComponent(selectedColor)
                      : "";
                    navigate(`/product/${product.product_id}/${colorSlug}`, {
                      state: { product },
                    });
                  }}
                >
                  {product.images?.[0] ? (
                    <div className="w-full aspect-[4/5] overflow-hidden mb-4 bg-white">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 flex justify-center items-center text-gray-500 mb-4">
                      Фото відсутнє
                    </div>
                  )}
                  <p>{product.name}</p>
                  <p className="text-black font-semibold mb-4">
                    {product.price} грн
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 col-span-full">
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
