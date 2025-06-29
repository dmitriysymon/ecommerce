import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBaseUrl } from "../context/BaseUrlContext";

const SearchModal = ({ isOpen, onClose, query }) => {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const baseUrl = useBaseUrl();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        const res = await fetch(
          `${baseUrl}/api/product/search?search=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data);
        console.log(data);
      } catch (error) {
        console.error("Помилка пошуку:", error);
      }
    };

    if (isOpen) {
      fetchResults();
    } else {
      setResults([]); // очищаємо результати при закритті модалки (опційно)
    }
  }, [query, isOpen, baseUrl]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-16 left-0 w-full z-40 bg-white shadow-md border-gray-200 overflow-y-auto animate-slide-down"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.length > 0 ? (
          results.map((product) => {
            const selectedColor = product.color ?? product.colors?.[0] ?? null;
            const colorSlug = selectedColor
              ? encodeURIComponent(selectedColor)
              : "";

            return (
              <div
                key={product.product_id}
                className="backdrop-brightness-98 cursor-pointer bg-white border hover:shadow-md"
                onClick={() => {
                  navigate(`/product/${product.product_id}/${colorSlug}`, {
                    state: { product },
                  });
                  onClose();
                }}
              >
                <div className="w-full aspect-[4/5] overflow-hidden mb-4 bg-white">
                  <img
                    src={baseUrl + product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p>{product.name}</p>
                <p className="text-black font-semibold mb-4">
                  {product.price} грн
                </p>
              </div>
            );
          })
        ) : (
          <p className="col-span-full text-center text-white">
            Нічого не знайдено
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
