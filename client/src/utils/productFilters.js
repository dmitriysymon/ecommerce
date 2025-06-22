export const getAvailableFilters = (products) => {
  const sizes = new Set();
  const colors = new Set();

  let minPrice = Infinity;
  let maxPrice = 0;

  products.forEach((product) => {
    (product.sizes || []).forEach((size) => sizes.add(size));

    // 🔧 Безпечна обробка кольорів
    const colorValue = product.color;
    const colorArray = Array.isArray(colorValue) ? colorValue : [colorValue];
    colorArray.forEach((col) => {
      if (typeof col === "string") colors.add(col);
    });

    if (typeof product.price === "number") {
      if (product.price < minPrice) minPrice = product.price;
      if (product.price > maxPrice) maxPrice = product.price;
    }
  });

  return {
    sizes: Array.from(sizes),
    colors: Array.from(colors),
    priceRange: [minPrice, maxPrice],
  };
};

export const applyFilters = (products, { sizes, colors, priceMin, priceMax }) => {
  return products.filter((product) => {
    // Перевіряємо, чи товар має хоча б один із вибраних розмірів
    const matchSize =
      !sizes || sizes.length === 0 ||
      (product.sizes || []).some((size) => sizes.includes(size));

    // Аналогічно для кольорів
    const productColors = Array.isArray(product.color)
      ? product.color
      : product.color
      ? [product.color]
      : [];

    const matchColor =
      !colors || colors.length === 0 ||
      productColors.some((color) => colors.includes(color));

    const matchPrice =
      (priceMin === null || priceMin === undefined || product.price >= priceMin) &&
      (priceMax === null || priceMax === undefined || product.price <= priceMax);

    return matchSize && matchColor && matchPrice;
  });
};


// productFilters.js

export const filterProducts = (products, filters, categories) => {
  const { size, color, priceMin, priceMax, selectedCategories, selectedSex } =
    filters;

  const basicFiltered = applyFilters(products, {
    size,
    color,
    priceMin,
    priceMax,
  });

  return basicFiltered.filter((product) => {
    // 🔸 Фільтрація по категоріях
    const categoryMatch = (() => {
      if (!selectedCategories || selectedCategories.length === 0) return true;

      const productCategory = product.category_name;

      return selectedCategories.some((selectedCategory) => {
        // Перевіряємо чи це підкатегорія
        const isSubCategory = categories.some((main) =>
          main.categories.some(
            (sub) =>
              sub.name === selectedCategory && sub.name === productCategory
          )
        );

        // Перевіряємо чи це головна категорія
        const isMainCategory = categories.some(
          (main) =>
            main.main_category === selectedCategory &&
            main.categories.some((sub) => sub.name === productCategory)
        );

        return isSubCategory || isMainCategory;
      });
    })();

    // 🔹 Фільтрація по статі
    const sexMatch = (() => {
      if (!selectedSex) return true;
      if (selectedSex === "male" || selectedSex === "female") {
        return product.sex === selectedSex || product.sex === "unisex";
      }
      return product.sex === selectedSex;
    })();

    return categoryMatch && sexMatch;
  });
};
