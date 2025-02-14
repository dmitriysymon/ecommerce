import axios from "axios";

const API_URL = "http://localhost:5000"; // Адреса твого бекенду

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error("Помилка отримання даних:", error);
    return [];
  }
};
