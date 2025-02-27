import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./component/Header";
import Banner from "./component/banner";
import Footer from "./component/Footer";
import NewArrivals from "./component/NewArrivals";
import Products from "./pages/Products";
import ModalAuth from "./component/Modal_Auth";
import ModalReg from "./component/Modal_Reg";
import ModalCart from "./component/cartModal";
import AdminProducts from "./pages/AdminProducts";
import Profile from "./pages/Profile";
import ProductPage from "./pages/ProductPage";
import { ToastContainer, toast } from "react-custom-alert";
import "react-custom-alert/dist/index.css";
import { CartProvider } from "./context/CartContext.jsx";
import { BaseUrlProvider } from "./context/BaseUrlContext";
import { CheckoutPage } from "./component/orderForm";

const App = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isCartModalOpen, setCartModalOpen] = useState(false);
  const location = useLocation();

  const scrollToFooter = () => {
    const footerElement = document.getElementById("footer");
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (location.hash === "#footer") {
      scrollToFooter();
    }
  }, [location]);

  return (
    <BaseUrlProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Header
            setIsAuthOpen={setIsAuthOpen}
            scrollToFooter={scrollToFooter}
            setCartModalOpen={setCartModalOpen}
          />
          <div className="flex-grow sm:px-0 md:px-0 lg:px-0">
            {" "}
            {/* Використовуємо різні відступи для мобільних, планшетів та десктопів */}
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Banner />
                    <NewArrivals />
                  </>
                }
              />
              <Route path="/products/:category?" element={<Products />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/orderForm" element={<CheckoutPage />} />
            </Routes>
          </div>

          <Footer id="footer" className="w-full mt-8" />
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
          <ModalCart
            isOpen={isCartModalOpen} // Передаємо isCartModalOpen в ModalCart
            setIsOpen={setCartModalOpen} // Передаємо setCartModalOpen в ModalCart
            closeCart={() => {
              setCartModalOpen(false);
            }}
          />
          <ToastContainer floatingTime={5000} />
        </div>
      </CartProvider>
    </BaseUrlProvider>
  );
};

const RootApp = () => (
  <Router>
    <App />
  </Router>
);

export default RootApp;
