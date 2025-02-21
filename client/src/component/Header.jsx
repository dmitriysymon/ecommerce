import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useBaseUrl } from "../context/BaseUrlContext";
import { Menu, X } from "lucide-react";
import cartIcon from "../res/icons/cart_w.png";
import userIcon from "../res/icons/user_icon.png";
import { fetchUserData } from "../services/userService";
import CategoriesMenu from "./categoriesMenu";

const Header = ({ setIsAuthOpen, setCartModalOpen, setCategoriesMenuOpen }) => {
  const baseUrl = useBaseUrl();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`bg-black fixed top-0 left-0 w-full z-[50] flex items-center justify-between h-16 px-4 font-montserrat transition-transform duration-500 ${
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
        <nav className="hidden md:flex space-x-6 items-center font-montserrat flex-grow justify-center">
          <Link
            to="/"
            className="text-white hover:text-gray-400 transition-colors"
          >
            Головна
          </Link>
          {/* Товари з показом меню категорій */}
          <div
            onMouseEnter={() => setCategoriesMenuOpen(true)} // Показати меню при наведенні
            className="relative"
          >
            <span className="text-white hover:text-gray-400 transition-colors cursor-pointer">
              Товари
            </span>
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
        <div className="flex items-center space-x-4">
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
        className={`fixed top-0 left-0 w-64 h-screen font-montserrat bg-black shadow-lg transform ${
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
        <Link
          to="/products"
          className="text-white hover:text-gray-400 transition-colors"
        >
          Товари
        </Link>
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
