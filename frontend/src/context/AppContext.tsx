import { createContext } from "react";

export const AppContext = createContext();

export default function AppProvider({ children }) {
    return (
        <AppContext.Provider value={{ name: 'abdallah' }}>
            {children}
        </AppContext.Provider>
    );
}