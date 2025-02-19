import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useBaseUrl } from "../context/BaseUrlContext";
import { Menu, X } from "lucide-react";
import cartIcon from "../res/icons/cart_w.png";
import userIcon from "../res/icons/user_icon.png";

const Header = ({ setIsAuthOpen, setCartModalOpen }) => {
  const baseUrl = useBaseUrl();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          fetchUserData();
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

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/session/getUser`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.userData);
        setIsAdmin(data.userData?.root === 1);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (userData && userData.user_id) {
      fetchCartItemCount(userData.user_id);
    }
  }, [userData, fetchCartItemCount]);

  return (
    <header className="bg-black sticky top-0 z-[20] flex w-full items-center justify-between h-16 px-4">
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

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Гамбургер-меню для мобільних пристроїв */}
      <nav
        className={`fixed top-0 left-0 w-64 h-full font-montserrat bg-black transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:hidden flex flex-col p-6 space-y-4 z-20`}
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
        {isAuthenticated ? (
          <>
            <Link to="/profile">
              <img
                src={userIcon}
                alt="User Profile"
                className="w-7 h-7 cursor-pointer transition duration-300 hover:brightness-50"
              />
            </Link>
          </>
        ) : (
          <button
            className="hidden md:block bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
            onClick={() => setIsAuthOpen(true)}
          >
            Sign In
          </button>
        )}
      </nav>

      {/* Навігація для великих екранів */}
      <nav className="hidden md:flex space-x-6 items-center font-montserrat">
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
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Іконки корзини та профілю */}
      <div className="flex items-center space-x-4">
        <div
          className="relative cursor-pointer duration-300 hover:brightness-50"
          onClick={() => setCartModalOpen(true)}
        >
          <img src={cartIcon} alt="Cart" className="w-8 h-8 transition" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartItemCount}
            </span>
          )}
        </div>

        {isAuthenticated ? (
          <>
            <Link to="/profile">
              <img
                src={userIcon}
                alt="User Profile"
                className="w-7 h-7 cursor-pointer transition duration-300 hover:brightness-50"
              />
            </Link>
          </>
        ) : (
          <button
            className="hidden md:block bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
            onClick={() => setIsAuthOpen(true)}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
