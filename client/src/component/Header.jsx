import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useBaseUrl } from "../context/BaseUrlContext";
import { Menu, X } from "lucide-react";
import cartIcon from "../res/icons/cart_w.png";
import userIcon from "../res/icons/user_icon.png";
import { fetchUserData } from "../services/userService";
import { FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import SearchInput from "./SearchInput";

const Header = ({ setIsAuthOpen, setCartModalOpen}) => {
  const baseUrl = useBaseUrl();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMenMenuOpen, setIsMenMenuOpen] = useState(false);
  const [isWomenMenuOpen, setIsWomenMenuOpen] = useState(false);
  const [isKidsMenuOpen, setIsKidsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const { cartItemCount, fetchCartItemCount, loadLocalCartCount } = useCart();

  const navigateToSexCategory = (sex) => {
    navigate(`/products?sex=${sex}`);
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
    setActiveCategory(null);
  };

  const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/session/checkSession`, {
          method: "POST",
          credentials: "include",
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
          const user = await fetchUserData(baseUrl);
          if (user) {
            setUserData(user);
            setIsAdmin(user.root === 1);
            fetchCartItemCount(user.user_id);
          }
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
          loadLocalCartCount();
        }
      } catch (error) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        loadLocalCartCount();
      }
    };

    const fetchCategories = async () => {
      try {
        const sexes = ["male", "female", "kids"];
        const allResults = [];

        for (const sex of sexes) {
          const response = await fetch(
            `${baseUrl}/api/product/getCategoriesBySex?sex=${sex}`
          );
          if (response.ok) {
            const data = await response.json();
            // Додаємо поле group для розрізнення в UI
            const grouped = data.map((mainCategory) => ({
              ...mainCategory,
              group: sex === "kids" ? "kids" : sex === "male" ? "men" : "women",
            }));
            allResults.push(...grouped);
          }
        }

        setCategories(allResults);
      } catch (error) {
        console.error("Помилка при завантаженні категорій:", error);
      }
    };

    fetchCategories();
    checkSession();
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // Якщо дуже близько до верху — завжди показувати хедер
      if (currentScroll < 50) {
        setIsVisible(true);
      } else {
        if (currentScroll > lastScrollY) {
          setIsVisible(false); // скрол вниз
        } else {
          setIsVisible(true); // скрол вгору
        }
      }

      lastScrollY = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (category, sex) => {
    const categorySlug = category === "Усі" ? "" : encodeURIComponent(category);
    navigate(`/products?sex=${sex}&categories=${categorySlug}`);
    setIsMenuOpen(false); // Закриваємо меню після переходу
    setIsCategoriesOpen(false);
    setActiveCategory(null);
  };

  return (
    <>
      <header
        className={`bg-black fixed top-0 left-0 w-full z-50 flex items-center justify-between h-16 px-4 font-montserrat tracking-wider transition-transform duration-500 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        <Link
          to="/"
          className="hidden lg:block text-white text-2xl font-montserrat hover:text-gray-400 transition-colors"
        >
          НОВИНКА
        </Link>
        <nav className="hidden md:flex space-x-6 items-center flex-grow justify-center">
          {/* Він */}
          <div
            className="relative"
            onMouseEnter={() => setIsMenMenuOpen(true)}
            onMouseLeave={() => setIsMenMenuOpen(false)}
          >
            <span
              className="text-white hover:text-gray-400 cursor-pointer"
              onClick={() => navigateToSexCategory("male")}
            >
              Чоловік
            </span>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={
                isMenMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }
              }
              transition={{ duration: 0.1 }}
              className={`${
                isMenMenuOpen ? "pointer-events-auto" : "pointer-events-none"
              } fixed left-0 w-screen bg-black text-white shadow-lg p-2 z-49 flex justify-center items-start`}
            >
              <div className="flex space-x-6">
                {categories
                  .filter((cat) => cat.group === "men")
                  .map((mainCategory) => (
                    <div
                      key={mainCategory.main_category}
                      className="px-6 text-left flex flex-col items-start"
                    >
                      <span className="py-3 font-semibold">
                        {mainCategory.main_category}
                      </span>
                      {mainCategory.categories.map((category) => (
                        <button
                          key={category.category_id}
                          onClick={() =>
                            handleCategoryClick(category.name, "male")
                          }
                          className="py-2 hover:text-gray-400"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>

          {/* Вона */}
          <div
            className="relative"
            onMouseEnter={() => setIsWomenMenuOpen(true)}
            onMouseLeave={() => setIsWomenMenuOpen(false)}
          >
            <span
              className="text-white hover:text-gray-400 cursor-pointer"
              onClick={() => navigateToSexCategory("female")}
            >
              Жінка
            </span>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={
                isWomenMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }
              }
              transition={{ duration: 0.1 }}
              className={`${
                isWomenMenuOpen ? "pointer-events-auto" : "pointer-events-none"
              } fixed left-0 w-screen bg-black text-white shadow-lg p-2 z-49 flex justify-center items-start`}
            >
              <div className="flex space-x-6">
                {categories
                  .filter((cat) => cat.group === "women")
                  .map((mainCategory) => (
                    <div
                      key={mainCategory.main_category}
                      className="px-6 text-left flex flex-col items-start"
                    >
                      <span className="py-3 font-semibold">
                        {mainCategory.main_category}
                      </span>
                      {mainCategory.categories.map((category) => (
                        <button
                          key={category.category_id}
                          onClick={() =>
                            handleCategoryClick(category.name, "female")
                          }
                          className="py-2 hover:text-gray-400"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>

          {/* Kids */}
          <div
            className="relative"
            onMouseEnter={() => setIsKidsMenuOpen(true)}
            onMouseLeave={() => setIsKidsMenuOpen(false)}
          >
            <span
              className="text-white hover:text-gray-400 cursor-pointer"
              onClick={() => navigateToSexCategory("kids")}
            >
              Діти
            </span>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={
                isKidsMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }
              }
              transition={{ duration: 0.1 }}
              className={`${
                isKidsMenuOpen ? "pointer-events-auto" : "pointer-events-none"
              } fixed left-0 w-screen bg-black text-white shadow-lg p-2 z-49 flex justify-center items-start`}
            >
              <div className="flex space-x-6">
                {categories
                  .filter((cat) => cat.group === "kids")
                  .map((mainCategory) => (
                    <div
                      key={mainCategory.main_category}
                      className="px-6 text-left flex flex-col items-start"
                    >
                      <span className="py-3 font-semibold">
                        {mainCategory.main_category}
                      </span>
                      {mainCategory.categories.map((category) => (
                        <button
                          key={category.category_id}
                          onClick={() =>
                            handleCategoryClick(category.name, "kids")
                          }
                          className="py-2 hover:text-gray-400"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>

          <a
            href="#services"
            className="text-white hover:text-gray-400 transition-colors"
          >
            Опт
          </a>
          <button
            onClick={scrollToBottom}
            className="text-white hover:text-gray-400 transition-colors"
          >
            Контакти
          </button>
          {isAdmin && (
            <Link
              to="/admin/products"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </nav>
        <SearchInput />
        <div className="flex items-center space-x-4 z-50">
          <div
            className="relative flex flex-col items-center cursor-pointer duration-300 hover:brightness-50"
            onClick={() => setCartModalOpen(true)}
          >
            <img src={cartIcon} alt="Cart" className="w-6 h-6 transition" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full z-[999]">
                {cartItemCount}
              </span>
            )}
          </div>

          {isAuthenticated ? (
            <Link to="/profile" className="flex flex-col items-center">
              <img
                src={userIcon}
                alt="User Profile"
                className="w-6 h-6 cursor-pointer transition duration-300 hover:brightness-50"
              />
            </Link>
          ) : (
            <div
              onClick={() => setIsAuthOpen(true)}
              className="flex flex-col items-center"
            >
              <img
                src={userIcon}
                alt="User Profile"
                className="w-6 h-6 cursor-pointer transition duration-300 hover:brightness-50"
              />
            </div>
          )}
        </div>
      </header>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Гамбургер-меню */}
      <nav
        className={`text-lg fixed top-0 left-0 text-left w-64 h-screen font-montserrat bg-black shadow-lg transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:hidden flex flex-col p-6 space-y-4 z-[60]`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="text-white self-end"
        >
          <X size={28} />
        </button>

        <Link
          to="/"
          className="text-white hover:text-gray-400 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Головна
        </Link>

        {/* Чоловік */}
        <div className="text-white">
          <button
            className="w-full text-left flex justify-between items-center"
            onClick={() =>
              setActiveCategory(activeCategory === "men" ? null : "men")
            }
          >
            Чоловік
            <FiChevronDown
              className={`transform transition-transform ${
                activeCategory === "men" ? "rotate-180" : ""
              }`}
            />
          </button>
          {activeCategory === "men" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-4 mt-2"
            >
              {categories
                .filter((cat) => cat.group === "men")
                .map((mainCategory) => (
                  <div key={mainCategory.main_category}>
                    <p className="font-semibold py-1">
                      {mainCategory.main_category}
                    </p>
                    {mainCategory.categories.map((category) => (
                      <button
                        key={category.category_id}
                        className="text-sm block px-2 py-1 text-white w-full text-left hover:bg-gray-700 rounded"
                        onClick={() =>
                          handleCategoryClick(category.name, "male")
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                ))}
            </motion.div>
          )}
        </div>

        {/* Жінка */}
        <div className="text-white">
          <button
            className="w-full text-left flex justify-between items-center"
            onClick={() =>
              setActiveCategory(activeCategory === "women" ? null : "women")
            }
          >
            Жінка
            <FiChevronDown
              className={`transform transition-transform ${
                activeCategory === "women" ? "rotate-180" : ""
              }`}
            />
          </button>
          {activeCategory === "women" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-4 mt-2"
            >
              {categories
                .filter((cat) => cat.group === "women")
                .map((mainCategory) => (
                  <div key={mainCategory.main_category}>
                    <p className="font-semibold py-1">
                      {mainCategory.main_category}
                    </p>
                    {mainCategory.categories.map((category) => (
                      <button
                        key={category.category_id}
                        className="text-sm block px-2 py-1 text-white w-full text-left hover:bg-gray-700 rounded"
                        onClick={() =>
                          handleCategoryClick(category.name, "female")
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                ))}
            </motion.div>
          )}
        </div>

        {/* Діти */}
        <div className="text-white">
          <button
            className="w-full text-left flex justify-between items-center"
            onClick={() =>
              setActiveCategory(activeCategory === "kids" ? null : "kids")
            }
          >
            Діти
            <FiChevronDown
              className={`transform transition-transform ${
                activeCategory === "kids" ? "rotate-180" : ""
              }`}
            />
          </button>
          {activeCategory === "kids" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-4 mt-2"
            >
              {categories
                .filter((cat) => cat.group === "kids")
                .map((mainCategory) => (
                  <div key={mainCategory.main_category}>
                    <p className="font-semibold py-1">
                      {mainCategory.main_category}
                    </p>
                    {mainCategory.categories.map((category) => (
                      <button
                        key={category.category_id}
                        className="text-sm block px-2 py-1 text-white w-full text-left hover:bg-gray-700 rounded"
                        onClick={() =>
                          handleCategoryClick(category.name, "kids")
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                ))}
            </motion.div>
          )}
        </div>

        <a
          href="#services"
          className="text-white hover:text-gray-400 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Опт
        </a>
        <Link
          to="#footer"
          className="text-white hover:text-gray-400 transition-colors"
          onClick={() => setIsMenuOpen(false)}
        >
          Контакти
        </Link>

        {isAdmin && (
          <Link
            to="/admin/products"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Admin Panel
          </Link>
        )}
      </nav>
    </>
  );
};

export default Header;
