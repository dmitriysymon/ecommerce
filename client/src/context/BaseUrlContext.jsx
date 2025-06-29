import { createContext, useContext } from "react";
import config from "../../../config/clientConfig";

// Створюємо контекст
const BaseUrlContext = createContext(config.apiUrl);

// Кастомний хук для зручного використання
export const useBaseUrl = () => useContext(BaseUrlContext);

export const BaseUrlProvider = ({ children }) => {
    return (
        <BaseUrlContext.Provider value={config.apiUrl}>
            {children}
        </BaseUrlContext.Provider>
    );
};
