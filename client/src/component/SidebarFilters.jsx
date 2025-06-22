import React, { useState, useEffect } from "react";
import pointer_d from "../assets/pointer_d.svg";
import { colorOptions } from "../services/colorOptions";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { sortSizes } from "../utils/sizeSorter";
const { Range } = Slider;

const SidebarFilters = ({
  categories,
  selectedCategories,
  setSelectedCategories,
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  availableFilters,
  setIsFilterOpen,
  location,
  navigate,
  selectedSex,
  isFilterOpen,
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  const [openMainCategories, setOpenMainCategories] = useState([]);
  const [isSizesOpen, setIsSizesOpen] = useState(selectedSizes.length > 0);
  const [isColorsOpen, setIsColorsOpen] = useState(selectedColors.length > 0);
  const [priceRange, setPriceRange] = useState([0, 1000]); // або відповідні значення
  const [minMaxPrice, setMinMaxPrice] = useState([0, 1000]); // межі діапазону

  useEffect(() => {
    const initiallyOpen = categories
      .filter(
        (mainCat) =>
          selectedCategories.includes(mainCat.main_category) ||
          mainCat.categories.some((cat) =>
            selectedCategories.includes(cat.name)
          )
      )
      .map((cat) => cat.main_category);

    setOpenMainCategories(initiallyOpen);
  }, [categories, selectedCategories]);

  const handleClose = () => {
    if (isMobile) setIsFilterOpen(false);
  };

  const updateURLParams = ({
    categories = selectedCategories,
    sizes = selectedSizes,
    colors = selectedColors,
    price = priceRange,
  }) => {
    const queryParams = new URLSearchParams(location.search);

    if (selectedSex) {
      queryParams.set("sex", selectedSex);
    } else {
      queryParams.delete("sex");
    }

    if (categories.length > 0) {
      queryParams.set("categories", categories[0]);
    } else {
      queryParams.delete("categories");
    }

    if (sizes.length > 0) {
      queryParams.set("sizes", sizes.join(","));
    } else {
      queryParams.delete("sizes");
    }

    if (colors.length > 0) {
      queryParams.set("colors", colors.join(","));
    } else {
      queryParams.delete("colors");
    }

    if (price && price[0] !== null && price[1] !== null) {
      // Припустимо, що price - масив з двох чисел [min, max]
      queryParams.set("priceMin", price[0]);
      queryParams.set("priceMax", price[1]);
    } else {
      queryParams.delete("priceMin");
      queryParams.delete("priceMax");
    }

    navigate({
      pathname: `/products`,
      search: queryParams.toString(),
    });
  };

  const handleSingleCategorySelect = (categoryName) => {
    const updated = [categoryName];
    setSelectedCategories(updated);
    updateURLParams({ categories: updated });
  };

  const toggleCategory = (mainCategoryName) => {
    setOpenMainCategories((prev) =>
      prev.includes(mainCategoryName)
        ? prev.filter((name) => name !== mainCategoryName)
        : [...prev, mainCategoryName]
    );
  };

  const handleSizeToggle = (size) => {
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];

    setSelectedSizes(updated);
    updateURLParams({ sizes: updated });
  };

  const handleColorToggle = (color) => {
    const updated = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];

    setSelectedColors(updated);
    updateURLParams({ colors: updated });
  };

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

  return (
    <div
      className={`fixed top-0 left-0 h-full z-40 w-64 lg:mt-10 bg-white transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-1/6 lg:min-w-64 shadow-lg lg:shadow-none overflow-y-auto p-6
        ${
          isMobile ? (isFilterOpen ? "translate-x-0" : "-translate-x-full") : ""
        }`}
    >
      {isMobile && (
        <div className="flex justify-between items-center mb-4 lg:hidden mt-16">
          <h3 className="text-xl font-semibold">Фільтри</h3>
          <button
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>
      )}

      {/* 🔸 Категорії */}
      <div className="space-y-3">
        <h4
          className={`text-base text-left font-semibold cursor-pointer mb-2 flex justify-between items-center`}
        >
          {getSexDisplayName(selectedSex)}
        </h4>
        {categories.map((mainCategory) => {
          const isMainActive =
            selectedCategories.includes(mainCategory.main_category) ||
            mainCategory.categories.some((cat) =>
              selectedCategories.includes(cat.name)
            );
          const isOpen = openMainCategories.includes(
            mainCategory.main_category
          );

          return (
            <div key={mainCategory.main_category}>
              <h4
                className={`text-base text-left pl-4 text-black cursor-pointer mb-2 flex justify-between items-center ${
                  isMainActive ? "font-semibold" : ""
                }`}
                onClick={() => toggleCategory(mainCategory.main_category)}
              >
                {mainCategory.main_category}
                <img
                  src={pointer_d}
                  alt="arrow"
                  className={`h-5 w-5 transition-transform duration-300 opacity-50 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </h4>
              {isOpen && (
                <div className="pl-6 text-left flex flex-col gap-1">
                  {mainCategory.categories.map((category) => {
                    const isSelected = selectedCategories.includes(
                      category.name
                    );
                    return (
                      <span
                        key={category.category_id}
                        className={`cursor-pointer text-base px-2 ${
                          isSelected ? "font-semibold" : ""
                        }`}
                        onClick={() =>
                          handleSingleCategorySelect(category.name)
                        }
                      >
                        {category.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* 🔹 Розміри */}
        <div>
          <h4
            className="text-left text-black cursor-pointer mb-2 flex justify-between items-center"
            onClick={() => setIsSizesOpen((prev) => !prev)}
          >
            Розміри
            <img
              src={pointer_d}
              alt="arrow"
              className={`h-5 w-5 transition-transform duration-300 opacity-50 ${
                isSizesOpen ? "rotate-180" : ""
              }`}
            />
          </h4>
          {isSizesOpen && (
            <div className="pl-4 flex flex-col gap-1">
              {availableFilters.sizes.map((size) => (
                <label
                  key={size}
                  className="flex items-center justify-between w-1/5 text-md cursor-pointer"
                >
                  <span>{size}</span>
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => handleSizeToggle(size)}
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 🔹 Кольори */}
        <div>
          <h4
            className="text-left text-black cursor-pointer mb-2 flex justify-between items-center"
            onClick={() => setIsColorsOpen((prev) => !prev)}
          >
            Кольори
            <img
              src={pointer_d}
              alt="arrow"
              className={`h-5 w-5 transition-transform duration-300 opacity-50 ${
                isColorsOpen ? "rotate-180" : ""
              }`}
            />
          </h4>
          {isColorsOpen && (
            <div className="pl-4 flex flex-col gap-1">
              {availableFilters.colors.map((colorHex) => {
                const colorInfo = colorOptions.find((c) => c.hex === colorHex);
                return (
                  <label
                    key={colorHex}
                    className="flex items-center justify-between w-4/5 gap-2 text-md cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-sm border border-gray-300"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span> - {colorInfo ? colorInfo.name : colorHex}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="ml-auto"
                      checked={selectedColors.includes(colorHex)}
                      onChange={() => handleColorToggle(colorHex)}
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarFilters;
