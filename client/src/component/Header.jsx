import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useBaseUrl } from "../context/BaseUrlContext";
import { Menu, X } from "lucide-react";
import cartIcon from "../res/icons/cart_w.png";
import userIcon from "../res/icons/user_icon.png";
import { fetchUserData } from "../services/userService";
import CategoriesMenu from "./categoriesMenu";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion } from "framer-motion";

const Header = ({ setIsAuthOpen, setCartModalOpen, setCategoriesMenuOpen }) => {
  const baseUrl = useBaseUrl();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null); // Для відкриття підкатегорій

  const { cartItemCount, fetchCartItemCount, loadLocalCartCount } = useCart();

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
        const response = await fetch(
          `${baseUrl}/api/product/getCategoriesMenu`
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Помилка при завантаженні категорій:", error);
      }
    };

    fetchCategories();
    checkSession();
  }, []);

  useEffect(() => {
    if (userData && userData.user_id) {
      fetchCartItemCount(userData.user_id);
    }
  }, [userData, fetchCartItemCount]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        if (window.scrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (category) => {
    const categorySlug = category === "Усі" ? "" : encodeURIComponent(category);
    navigate(`/products/${categorySlug}`);
  };

  return (
    <>
      <header
        className={`bg-black sticky lg:fixed md:fixed top-0 left-0 w-full z-50 flex items-center justify-between h-16 px-4 font-montserrat tracking-wider transition-transform duration-500 ${
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
          className="text-white text-2xl font-montserrat hover:text-gray-400 transition-colors"
        >
          НОВИНКА
        </Link>
        <nav className="hidden md:flex space-x-6 items-center flex-grow justify-center">
          <Link
            to="/"
            className="text-white hover:text-gray-400 transition-colors"
          >
            Головна
          </Link>
          {/* Товари з показом меню категорій */}
          <div
            className="relative"
            onMouseEnter={() => setIsProductsMenuOpen(true)}
            onMouseLeave={() => setIsProductsMenuOpen(false)}
          >
            <span
              className="text-white hover:text-gray-400 transition-colors cursor-pointer"
              onClick={() => handleCategoryClick("")}
            >
              Товари
            </span>
            {isProductsMenuOpen && categories.length > 0 && (
              <div className="fixed left-0 w-screen bg-black text-white shadow-lg p-2 z-49 flex justify-center items-start">
                <div className="flex space-x-6">
                  {categories.map((mainCategory) => (
                    <div
                      key={mainCategory.main_category}
                      className="px-6 text-center whitespace-nowrap"
                    >
                      <Link className="py-3 font-semibold block hover:text-gray-400 duration-200">
                        {mainCategory.main_category}
                      </Link>
                      {mainCategory.categories.map((category) => (
                        <button
                          key={category.category_id}
                          onClick={() => handleCategoryClick(category.name)}
                          className="block py-2 hover:text-gray-400 duration-200"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <a
            href="#services"
            className="text-white hover:text-gray-400 transition-colors"
          >
            Services
          </a>
          <Link
            to="#footer"
            className="text-white hover:text-gray-400 transition-colors"
          >
            Contact
          </Link>
          {isAdmin && (
            <Link
              to="/admin/products"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-4 z-50">
          <div
            className="relative flex flex-col items-center cursor-pointer duration-300 hover:brightness-50"
            onClick={() => setCartModalOpen(true)}
          >
            <img src={cartIcon} alt="Cart" className="w-6 h-6 transition" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
            <span className="text-sm text-white mt-1">Кошик</span>
          </div>

          {isAuthenticated ? (
            <Link to="/profile" className="flex flex-col items-center">
              <img
                src={userIcon}
                alt="User Profile"
                className="w-6 h-6 cursor-pointer transition duration-300 hover:brightness-50"
              />
              {userData?.username && (
                <span className="text-sm text-white mt-1">
                  {userData.username}
                </span>
              )}
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
              <span className="text-sm text-white mt-1">Акаунт</span>
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
        >
          Головна
        </Link>

        {/* Товари */}
        <div className="text-white">
          <button
            className="w-full text-left flex justify-between items-center"
            onClick={(e) => {
              // Зупиняємо натискання на кнопку з іконкою від виклику переходу по посиланню
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
              handleCategoryClick("");
            }}
          >
            Товари
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: isCategoriesOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center" // Збільшена область натискання для іконки
            >
              <FiChevronDown
                size={20}
                onClick={(e) => {
                  e.stopPropagation(); // Зупиняємо подальшу обробку натискання
                  setIsCategoriesOpen(!isCategoriesOpen);
                }}
              />
            </motion.div>
          </button>

          {/* Якщо меню категорій відкрите */}
          {isCategoriesOpen && categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-2 space-y-3 mt-2"
            >
              {categories.map((mainCategory) => (
                <div key={mainCategory.main_category}>
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Зупиняємо подальше виконання переходу
                      setIsMenuOpen(!isMenuOpen);
                      handleCategoryClick(mainCategory.main_category);
                    }}
                    className="w-full text-base text-left text-white flex justify-between items-center"
                  >
                    {mainCategory.main_category}
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{
                        rotate:
                          activeCategory === mainCategory.main_category
                            ? 180
                            : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronDown
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation(); // Зупиняємо натискання на іконку від виконання переходу
                          setActiveCategory(
                            activeCategory === mainCategory.main_category
                              ? null
                              : mainCategory.main_category
                          );
                        }}
                      />
                    </motion.div>
                  </button>

                  {/* Якщо ця категорія активна, показуємо підкатегорії */}
                  {activeCategory === mainCategory.main_category && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pl-1 mt-2"
                    >
                      {mainCategory.categories.map(
                        (category, categoryIndex) => (
                          <div key={category.category_id}>
                            <button
                              className="text-sm block px-2 py-1 text-white" // Скорочена область натискання для елементів
                              onClick={(e) => {
                                e.preventDefault(); // Зупиняємо подальше виконання переходу
                                setIsMenuOpen(!isMenuOpen);
                                handleCategoryClick(category.name);
                              }}
                            >
                              {category.name}
                            </button>

                            {/* Якщо це не остання підкатегорія, додаємо бордер */}
                            {categoryIndex !==
                              mainCategory.categories.length - 1 && (
                              <div className="border-t-2 border-gray-400 opacity-40 my-2 rounded-full"></div>
                            )}
                          </div>
                        )
                      )}
                    </motion.div>
                  )}

                  {/* Якщо це не остання категорія, додаємо бордер */}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <a
          href="#services"
          className="text-white hover:text-gray-400 transition-colors"
        >
          Services
        </a>
        <Link
          to="#footer"
          className="text-white hover:text-gray-400 transition-colors"
        >
          Contact
        </Link>

        {isAdmin && (
          <Link
            to="/admin/products"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-center"
          >
            Admin Panel
          </Link>
        )}
      </nav>
    </>
  );
};

export default Header;
