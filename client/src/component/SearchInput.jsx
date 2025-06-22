import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import SearchModal from "./SearchModal";
import { useBaseUrl } from "../context/BaseUrlContext";

const SearchInput = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(true); // відкрити автоматично на моб
    }
  }, [isMobile]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="font-montserrat mr-2 relative flex items-center">
        {isDesktop && (
          <button
            onClick={handleToggle}
            className="p-2 text-white duration-300 hover:brightness-50 focus:outline-none"
          >
            <Search className="w-6 h-6" />
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          placeholder="Пошук..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`ml-2 px-3 py-1 text-sm rounded-sm outline-none transition-all duration-300
            ${
              isOpen
                ? "opacity-100 w-48 lg:w-64"
                : "opacity-0 w-0 lg:w-0 pointer-events-none"
            }
            ${isDesktop ? "lg:block hidden" : "block w-full"}
          `}
        />
      </div>

      {/* Модальне вікно з результатами */}
      <SearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        query={query}
      />
    </>
  );
};

export default SearchInput;
