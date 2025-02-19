import React, { createContext, useContext } from "react";
import { toast } from "react-custom-alert";
import 'react-custom-alert/dist/index.css';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const alertSuccess = (message) => toast.success(message);
  const alertError = (message) => toast.error(message);

  return (
    <AlertContext.Provider value={{ alertSuccess, alertError }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
