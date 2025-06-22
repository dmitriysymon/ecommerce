import { createContext, useContext } from "react";

// Створюємо контекст
const BaseUrlContext = createContext("http://localhost:5000");

// Кастомний хук для зручного використання
export const useBaseUrl = () => useContext(BaseUrlContext);

export const BaseUrlProvider = ({ children }) => {
    return (
        <BaseUrlContext.Provider value="http://localhost:5000">
            {children}
        </BaseUrlContext.Provider>
    );
};
