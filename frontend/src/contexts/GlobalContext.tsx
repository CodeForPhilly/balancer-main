import React, { createContext, useContext, useState } from "react";

interface GlobalContextType {
  showSummary: boolean;
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
  enterNewPatient: boolean;
  setEnterNewPatient: React.Dispatch<React.SetStateAction<boolean>>;
  resetFormValues: boolean;
  triggerFormReset: () => void;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  showMetaPanel: boolean;
  setShowMetaPanel: React.Dispatch<React.SetStateAction<boolean>>;
}

// Provide default no-op values to prevent errors during initialization
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: () => void = () => {};
const defaultContextValue: GlobalContextType = {
  enterNewPatient: false,
  setEnterNewPatient: noop,
  showSummary: false,
  setShowSummary: noop,
  resetFormValues: false,
  triggerFormReset: noop,
  isEditing: false,
  setIsEditing: noop,
  showMetaPanel: false,
  setShowMetaPanel: noop,
};

const GlobalContext = createContext<GlobalContextType>(defaultContextValue);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [enterNewPatient, setEnterNewPatient] = useState<boolean>(true);
  const [resetFormValues, setResetFormValues] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showMetaPanel, setShowMetaPanel] = useState<boolean>(false);

  const triggerFormReset = () => {
    setResetFormValues(true);
    setTimeout(() => {
      setResetFormValues(false);
    }, 100);
  };

  return (
    <GlobalContext.Provider
      value={{
        showSummary,
        setShowSummary,
        enterNewPatient,
        setEnterNewPatient,
        resetFormValues,
        triggerFormReset,
        isEditing,
        setIsEditing,
        showMetaPanel,
        setShowMetaPanel,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
