import React from 'react';

const Footer = () => {
  return (
    <footer id="footer" className="bg-[#1c1c1c] text-white py-4 w-full">
      <div className="w-full flex items-center justify-between px-4 font-montserrat">
        <div className="text-sm">
          &copy; 2025 НОВИНКА. Всі права захищені.
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Про нас
              </a>
            </li>
            <li>
              <a href="#privacy" className="hover:text-gray-400 transition-colors">
                Політика конфіденційності
              </a>
            </li>
            <li>
              <a href="#terms" className="hover:text-gray-400 transition-colors">
                Умови використання
              </a>
            </li>
            <li>
              <a href="https://facebook.com" className="hover:text-gray-400 transition-colors" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://twitter.com" className="hover:text-gray-400 transition-colors" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://instagram.com" className="hover:text-gray-400 transition-colors" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
