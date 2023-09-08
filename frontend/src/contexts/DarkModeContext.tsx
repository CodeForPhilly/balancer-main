import React, { createContext, useState, useEffect, ReactNode } from "react";

interface DarkModeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const defaultContextValue: DarkModeContextType = {
  isDarkMode: false,
  setIsDarkMode: () => {
    // This is a placeholder function. Real function provided by the context provider.
  },
};

export const DarkModeContext =
  createContext<DarkModeContextType>(defaultContextValue);

interface DarkModeProviderProps {
  children: ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
