import { useState, useEffect, useRef } from "react";
import { CirclePicker } from "react-color";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useBaseUrl } from "../../context/BaseUrlContext";
import { colorOptions } from "../../services/colorOptions";

const ProductTab = () => {
  const navigate = useNavigate();
  const baseUrl = useBaseUrl();
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sku: "",
    images: [],
    sex: "",
    variants: [],
  });

  const [colorGroup, setColorGroup] = useState("default");
  const [sizeEntries, setSizeEntries] = useState([]);
  const [tempSize, setTempSize] = useState("");
  const [tempStock, setTempStock] = useState("");

  const [tempImages, setTempImages] = useState([]);

  // Завантаження товарів
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/product/listProduct`);
      setProducts(response.data);
    } catch (error) {
      console.error("Помилка при завантаженні товарів:", error);
    }
  };

  // Завантаження категорій
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const generateRandomSku = () => {
    const randomSku = Math.random().toString(36).slice(2, 10).toUpperCase();
    setNewProduct({ ...newProduct, sku: randomSku });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("category", newProduct.category);
      formData.append("sku", newProduct.sku);
      formData.append("sex", newProduct.sex);

      // Передаємо варіанти як JSON-рядок
      formData.append("variants", JSON.stringify(newProduct.variants));

      // Додаємо фото
      newProduct.images.forEach(({ file, color }) => {
        console.log("передане фото: ", file, "Колір: ");
        formData.append("images", file);
        formData.append("imageColors", color); // додатково передаємо колір
      });

      const response = await axios.post(
        `${baseUrl}/api/product/addProduct`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const productId = response.data.productId;

      setProducts([...products, { ...newProduct, product_id: productId }]);

      setNewProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        sku: "",
        images: [],
        sex: "",
        variants: [],
      });
    } catch (error) {
      console.error("Помилка при додаванні товару:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей товар?")) {
      try {
        await axios.delete(`${baseUrl}/api/product/delProduct`, {
          params: { productId },
        });
        setProducts(
          products.filter((product) => product.product_id !== productId)
        );
      } catch (error) {
        console.error("Помилка при видаленні товару:", error);
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const withColor = files.map((file) => ({ file, color: colorGroup }));
    setTempImages((prev) => [...prev, ...withColor]);
  };



  return (
    <div className="container font-montserrat mx-auto p-4">
      <form onSubmit={handleAddProduct} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Назва товару"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          required
        />
        <select
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="" disabled>
            Оберіть категорію
          </option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Опис товару"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="number"
          placeholder="Ціна"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          required
        />
        <select
          value={newProduct.sex}
          onChange={(e) =>
            setNewProduct({ ...newProduct, sex: e.target.value })
          }
          className="w-full p-2 border rounded-md"
          required
        >
          <option value="" disabled>
            Оберіть стать
          </option>
          <option value="male">Чоловік</option>
          <option value="female">Жінка</option>
          <option value="unisex">Унісекс</option>
          <option value="kids">Kids</option>
        </select>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Артикул"
            value={newProduct.sku}
            onChange={(e) =>
              setNewProduct({ ...newProduct, sku: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            required
          />
          <button
            type="button"
            onClick={generateRandomSku}
            className="bg-gray-200 text-gray-800 p-2 w-64 rounded-md"
          >
            Автогенерація артикула
          </button>
        </div>
        <div className="border p-4 rounded-md bg-gray-50 space-y-2">
          <h4 className="font-semibold">Додати розміри для кольору</h4>
          <CirclePicker
            width=""
            colors={colorOptions.map((c) => c.hex)}
            color={colorGroup}
            onChangeComplete={(color) => setColorGroup(color.hex)}
          />
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border rounded-md"
          />
          <p className="mt-2 text-sm text-gray-600">
            Обраний колір:{" "}
            {colorOptions.find(
              (c) => c.hex.toLowerCase() === colorGroup.toLowerCase()
            )?.name || "—"}
          </p>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Розмір"
              value={tempSize}
              onChange={(e) => setTempSize(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Кількість"
              value={tempStock}
              onChange={(e) => setTempStock(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <button
              type="button"
              onClick={() => {
                if (!tempSize || !tempStock) return;
                setSizeEntries((prev) => [
                  ...prev,
                  { size: tempSize, stock: tempStock },
                ]);
                setTempSize("");
                setTempStock("");
              }}
              className="bg-green-500 text-white px-4 rounded-md"
            >
              +
            </button>
          </div>

          {/* Показати розміри */}
          <ul className="text-sm text-gray-800 space-y-1">
            {sizeEntries.map((entry, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <span>
                  {entry.size} / {entry.stock}
                </span>
                <button
                  onClick={() =>
                    setSizeEntries((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="text-red-500"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {tempImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {tempImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(img.file)}
                    alt="preview"
                    className="w-full h-24 object-cover rounded"
                  />
                  <span
                    className="absolute bottom-0 left-0 text-xs px-1 bg-white"
                    style={{ color: img.color }}
                  >
                    {img.color}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (sizeEntries.length === 0) return;

              const newVariants = sizeEntries.map((entry) => ({
                size: entry.size,
                stock: entry.stock,
                color: colorGroup,
              }));

              // Додаємо варіанти
              setNewProduct((prev) => ({
                ...prev,
                variants: [...prev.variants, ...newVariants],
                images: [...prev.images, ...tempImages],
              }));

              if (fileInputRef.current) {
                fileInputRef.current.value = null; // очищення вибору
              }

              // Очистити після додавання
              setSizeEntries([]);
              setTempImages([]);
              setColorGroup("default");
            }}
            className="bg-blue-500 text-white w-full p-2 rounded-md"
          >
            Додати всі розміри для обраного кольору
          </button>

          {newProduct.variants.length > 0 && (
            <ul className="text-sm text-gray-800 space-y-1">
              {newProduct.variants.map((v, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>
                    {v.size} / {v.color} / {v.stock}
                  </span>
                  <button
                    onClick={() =>
                      setNewProduct((prev) => ({
                        ...prev,
                        variants: prev.variants.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md"
        >
          Додати товар
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-4">Список товарів</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.product_id}
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
            onClick={() =>
              navigate(`/adminProduct/${product.product_id}`, {
                state: { product },
              })
            }
          >
            <div className="w-full aspect-[4/5] overflow-hidden mb-4 bg-white">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-lg font-semibold">{product.name}</h4>
            <p>{product.description}</p>
            <p>Ціна: {product.price}</p>
            <p>Кількість: {product.stock}</p>
            <button
              onClick={() => handleDeleteProduct(product.product_id)}
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

export default ProductTab;
