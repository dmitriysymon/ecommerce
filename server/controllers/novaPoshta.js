const axios = require("axios");

const apiKey = "4308a61be59b3baa8155882c7baad178"; // Ваш ключ API

// Функція для отримання міст
const getCities = async (req, res) => {
  try {
    const response = await axios.post("https://api.novaposhta.ua/v2.0/json/", {
      apiKey,
      modelName: "Address",
      calledMethod: "getCities",
      methodProperties: {}
    });
    res.json(response.data.data);
  } catch (error) {
    console.error("Помилка отримання міст:", error);
    res.status(500).send("Помилка при отриманні міст");
  }
};

// Функція для отримання відділень по місту
const getWarehouses = async (req, res) => {
  const { cityRef } = req.body;
  if (!cityRef) {
    return res.status(400).send("Не вказано місто");
  }

  try {
    const response = await axios.post("https://api.novaposhta.ua/v2.0/json/", {
      apiKey,
      modelName: "AddressGeneral",
      calledMethod: "getWarehouses",
      methodProperties: { CityRef: cityRef }
    });
    res.json(response.data.data);
  } catch (error) {
    console.error("Помилка отримання відділень:", error);
    res.status(500).send("Помилка при отриманні відділень");
  }
};

module.exports = { getCities, getWarehouses };
