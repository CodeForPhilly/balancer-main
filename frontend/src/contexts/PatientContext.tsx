// Update PatientContext.tsx to include the reset functionality
import React, {createContext, useContext, useState} from 'react';

interface PatientContextType {
    showSummary: boolean;
    setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
    enterNewPatient: boolean;
    setEnterNewPatient: React.Dispatch<React.SetStateAction<boolean>>;
    resetFormValues: boolean;
    triggerFormReset: () => void;
}


//redux / context issue need to provide default to avoid undefined
//if we don't the login errors out
const defaultContextValue: PatientContextType = {
    enterNewPatient: true,
    setEnterNewPatient: () => {
    }, //no-op default
    showSummary: true,
    setShowSummary: () => {
    }, //no-op default
    resetFormValues: false,
    triggerFormReset: () => {
    }, //no-op default
};


const PatientContext = createContext<PatientContextType>(defaultContextValue);


export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [showSummary, setShowSummary] = useState<boolean>(false);
    const [enterNewPatient, setEnterNewPatient] = useState<boolean>(true);
    const [resetFormValues, setResetFormValues] = useState<boolean>(false);


    const triggerFormReset = () => {
        setResetFormValues(true);
        // Reset the flag after a short delay
        setTimeout(() => {
            setResetFormValues(false);
        }, 100);
    };

    return (
        <PatientContext.Provider
            value={{
                showSummary,
                setShowSummary,
                enterNewPatient,
                setEnterNewPatient,
                resetFormValues,
                triggerFormReset
            }}
        >
            {children}
        </PatientContext.Provider>
    );
};

export const usePatientContext = () => {
    const context = useContext(PatientContext);
    if (context === undefined) {
        throw new Error('usePatientContext must be used within a PatientProvider');
    }
    return context;
};