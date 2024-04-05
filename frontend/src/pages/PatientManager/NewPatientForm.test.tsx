jest.mock('../../config/envConfig', () => ({
    getEnv: () => ({
      apiUrl: 'http://localhost:8000/api/listMeds/',
    }),
}));

import React from 'react';
// mock React's useState function
jest.mock('react', () => {
    const originalReact = jest.requireActual('react'); // Import actual React module
    return {
      ...originalReact, // Spread all original exports
      useState: jest.fn(), // Override only useState
    };
  });
  

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewPatientForm from './NewPatientForm';


// Define mock data
export interface PatientInfo {
    ID?: string;
    Diagnosis?: string;
    OtherDiagnosis?: string;
    Description?: string;
    Depression?: string;
    Hypomania?: string;
    Mania?: string;
    CurrentMedications?: string;
    PriorMedications?: string;
    PossibleMedications?: {
      first?: string;
      second?: string;
      third?: string;
    };
    Psychotic: string;
    Suicide: string;
    Kidney: string;
    Liver: string;
    blood_pressure: string;
    weight_gain: string;
    Reproductive: string;
    risk_pregnancy: string;
}

const mockPatientInfo: PatientInfo = {
    ID: '1', 
    Diagnosis: 'Initial Diagnosis',
    OtherDiagnosis: '',
    Description: '',
    Depression: 'False',
    Hypomania: 'False',
    Mania: 'False',
    CurrentMedications: '',
    PriorMedications: '',
    PossibleMedications: {
      first: '',
      second: '',
      third: '',
    },
    Psychotic: 'No',
    Suicide: 'No',
    Kidney: 'No',
    Liver: 'No',
    blood_pressure: 'No',
    weight_gain: 'No',
    Reproductive: 'No',
    risk_pregnancy: 'No',
};
  
// Mock functions for setting state
const mockSetPatientInfo = jest.fn();
const mockSetAllPatientInfo = jest.fn();

// Mock array for allPatientInfo
const mockAllPatientInfo = [mockPatientInfo]; 

// At the top of your test file
// jest.mock('axios');
// import axios from 'axios';
// const mockedAxios = axios as jest.Mocked<typeof axios>;



describe('NewPatientForm Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
      
        // Reset useState mock to a clean state
        const originalReact = jest.requireActual('react');
        (React.useState as jest.Mock)
          .mockImplementation((initial: any) => originalReact.useState(initial));
      });
    

    it('renders without crashing', () => {
        (React.useState as jest.Mock)
        .mockImplementationOnce(() => [false, jest.fn()]) // Mock for isPressed
        .mockImplementationOnce(() => [false, jest.fn()]); 
        render(<NewPatientForm
          patientInfo={mockPatientInfo}
          setPatientInfo={mockSetPatientInfo}
          allPatientInfo={mockAllPatientInfo}
          setAllPatientInfo={mockSetAllPatientInfo}
        />);
        
        // Look for a static element that should always be present
        // For example, if your form always renders a submit button, check for that
        // expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
      });
    });