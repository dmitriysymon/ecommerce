import { useState, useEffect } from "react";
import axios from "axios";

export const useNovaPoshta = (apiKey) => {
    const [cities, setCities] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [regions, setRegions] = useState([]); // Додаємо стан для областей
    const [selectedCityRef, setSelectedCityRef] = useState("");
  
    useEffect(() => {
      const fetchCities = async () => {
        try {
          const response = await axios.post("https://api.novaposhta.ua/v2.0/json/", {
            apiKey,
            modelName: "Address",
            calledMethod: "getCities",
            methodProperties: {}
          });
          setCities(response.data.data);
        } catch (error) {
          console.error("Помилка отримання міст:", error);
        }
      };
      fetchCities();
    }, [apiKey]);
  
    useEffect(() => {
      if (!selectedCityRef) return;
  
      const fetchWarehouses = async () => {
        try {
          const response = await axios.post("https://api.novaposhta.ua/v2.0/json/", {
            apiKey,
            modelName: "AddressGeneral",
            calledMethod: "getWarehouses",
            methodProperties: { 
              CityRef: selectedCityRef
            }
          });
          console.log(response.data.data.length);
          setWarehouses(response.data.data);
        } catch (error) {
          console.error("Помилка отримання відділень:", error);
        }
      };
  
      fetchWarehouses();
    }, [selectedCityRef, apiKey]);
  
    return { cities, warehouses, regions, setSelectedCityRef};
  };
  
