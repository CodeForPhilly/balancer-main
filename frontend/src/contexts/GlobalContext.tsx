import React, {createContext, useContext, useState} from 'react';

interface GlobalContextType {
    showSummary: boolean;
    setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
    enterNewPatient: boolean;
    setEnterNewPatient: React.Dispatch<React.SetStateAction<boolean>>;
    resetFormValues: boolean;
    triggerFormReset: () => void;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}


//redux / context issue need to provide default to avoid undefined
//if we don't the login errors out
const defaultContextValue: GlobalContextType = {
    enterNewPatient: false,
    setEnterNewPatient: () => {
    }, //no-op default
    showSummary: false,
    setShowSummary: () => {
    }, //no-op default
    resetFormValues: false,
    triggerFormReset: () => {
    }, //no-op default
    isEditing: false,
    setIsEditing: () => {
    }, //no-op default
};


const GlobalContext = createContext<GlobalContextType>(defaultContextValue);


export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [showSummary, setShowSummary] = useState<boolean>(false);
    const [enterNewPatient, setEnterNewPatient] = useState<boolean>(true);
    const [resetFormValues, setResetFormValues] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const triggerFormReset = () => {
        setResetFormValues(true);
        // Reset the flag after a short delay
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
                setIsEditing
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
};