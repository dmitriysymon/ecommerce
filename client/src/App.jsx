import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './component/Header';
import Banner from './component/banner';
import Footer from './component/Footer';
import NewArrivals from './component/NewArrivals';
import Products from './pages/Products';
import ModalAuth from './component/Modal_Auth';
import ModalReg from './component/Modal_Reg';
import AdminProducts from './pages/AdminProducts';
import Profile from './pages/Profile';
import ProductPage from './pages/ProductPage';

const App = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const location = useLocation();

  const scrollToFooter = () => {
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  useEffect(() => {
    if (location.hash === "#footer") {
      scrollToFooter();
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header setIsAuthOpen={setIsAuthOpen} scrollToFooter={scrollToFooter} />

      <div className="flex-grow px-4 md:px-8"> {/* додано відступи для мобільних пристроїв */}
        <Routes>
          <Route path="/" element={<><Banner /><NewArrivals /></>} />
          <Route path="/products" element={<Products />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Products />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </div>

      <Footer id="footer" className="w-full mt-8" /> {/* Футер на всю ширину, з відступом внизу */}

      <ModalAuth
        isOpen={isAuthOpen}
        setIsOpen={setIsAuthOpen}
        switchToReg={() => {
          setIsAuthOpen(false);
          setIsRegOpen(true);
        }}
      />

      <ModalReg
        isOpen={isRegOpen}
        setIsOpen={setIsRegOpen}
        switchToAuth={() => {
          setIsRegOpen(false);
          setIsAuthOpen(true);
        }}
      />
    </div>
  );
};

const RootApp = () => (
  <Router>
    <App />
  </Router>
);

export default RootApp;
