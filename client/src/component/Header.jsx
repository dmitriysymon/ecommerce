import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cartIcon from '../res/icons/cart_w.png';
import userIcon from '../res/icons/user_icon.png';

const Header = ({ setIsAuthOpen }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/session/checkSession', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
          fetchUserData(); // Отримати root після перевірки сесії
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/session/getUser', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.userData?.root === 1); // root === 1 => користувач - адміністратор
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };  

    checkSession();
  }, []);

  const handleLogout = () => {
    fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      setIsAuthenticated(false);
      setIsAdmin(false);
    });
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-[#1c1c1c] text-white py-3 shadow-md z-50">
      <div className="container mx-auto flex items-center justify-between px-1">
        <Link to="/" className="text-2xl font-montserrat hover:text-gray-400 transition-colors">
          НОВИНКА
        </Link>
        <nav>
          <ul className="flex space-x-6 font-montserrat">
            <li><Link to="/" className="hover:text-gray-400 transition-colors">Головна</Link></li>
            <li><Link to="/products" className="hover:text-gray-400 transition-colors">Товари</Link></li>
            <li><a href="#services" className="hover:text-gray-400 transition-colors">Services</a></li>
            <li><Link to="#footer" className="hover:text-gray-400 transition-colors">Contact</Link></li>
          </ul>
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          <img
            src={cartIcon}
            alt="Cart"
            className="w-8 h-8 cursor-pointer transition duration-300 hover:invert hover:brightness-75"
          />
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin/products" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
                  Admin Panel
                </Link>
              )}
              <Link to="/profile">
                <img
                  src={userIcon}
                  alt="User Profile"
                  className="w-7 h-7 cursor-pointer transition duration-300 hover:invert hover:brightness-75"
                />
              </Link>
            </>
          ) : (
            <button 
              className="bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => setIsAuthOpen(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;