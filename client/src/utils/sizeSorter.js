const sizeOrder = [
  "XS", "S", "M", "L", "XL",
  "2XL", "3XL", "4XL", "5XL",
  "6XL", "7XL", "8XL", "9XL", "10XL"
];

/**
 * Сортує масив розмірів
 * При сортуванні рядкових значень повертає їх у верхньому регістрі
 * @param {Array<string|number>} sizes - масив розмірів (рядки або числа)
 * @returns {Array<string|number>} - відсортований масив з рядками у верхньому регістрі
 */
export function sortSizes(sizes) {
  if (!Array.isArray(sizes)) return sizes;

  // Перевіряємо, чи всі елементи — числа
  const allNumbers = sizes.every(s => typeof s === "number" || (!isNaN(parseInt(s)) && !isNaN(Number(s))));
  // Перевіряємо, чи всі елементи — рядки
  const allStrings = sizes.every(s => typeof s === "string");

  if (allNumbers) {
    return sizes
      .map(s => Number(s))
      .sort((a, b) => a - b);
  } else if (allStrings) {
    // Сортуємо та перетворюємо у верхній регістр
    return sizes.slice().sort((a, b) => {
      const aUpper = a.toUpperCase();
      const bUpper = b.toUpperCase();

      const indexA = sizeOrder.indexOf(aUpper);
      const indexB = sizeOrder.indexOf(bUpper);

      if (indexA === -1 && indexB === -1) {
        return aUpper.localeCompare(bUpper);
      } else if (indexA === -1) {
        return 1;
      } else if (indexB === -1) {
        return -1;
      } else {
        return indexA - indexB;
      }
    }).map(s => s.toUpperCase()); // Перетворення усіх на верхній регістр після сортування
  }

  // Якщо змішані типи або інше — повертаємо без змін
  return sizes;
}
