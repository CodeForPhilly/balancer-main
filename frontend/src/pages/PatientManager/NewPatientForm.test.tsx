

jest.mock('../../config/envConfig', () => ({
    getEnv: () => ({
      apiUrl: 'http://localhost:8000/api/listMeds/',
    }),
  }));
  
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NewPatientForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks(); 
    }); 

    it('submits form data using mocked API URL', async () => {
        <NewPatientForm
            patientInfo={mockPatientInfo}
            setPatientInfo={mockSetPatientInfo}
            allPatientInfo={mockAllPatientInfo}
            setAllPatientInfo={mockSetAllPatientInfo}
        />        
        fireEvent.change(screen.getByLabelText(/current state/i), { target: { value: 'New Value' } });
        
        // Simulate form submission
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
        
        await waitFor(() => {
            expect(screen.getByText(/submission success message/i)).toBeInTheDocument();
          
            expect(axios.post).toHaveBeenCalledWith('http://localhost:8000/api/listMeds/', expect.any(Object));
        });
    });

    it('renders and shows all fields', () => {
        render(
            <NewPatientForm
            patientInfo={mockPatientInfo}
            setPatientInfo={mockSetPatientInfo}
            allPatientInfo={mockAllPatientInfo}
            setAllPatientInfo={mockSetAllPatientInfo}
            />
        )

        expect(screen.getByLabelText(/current state/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/bipolar history/i)).toBeInTheDocument();
        // Add assertions for each field you expect to be rendered
    });

    it('updates the Diagnosis field on user input', () => {
        render(
            <NewPatientForm
            patientInfo={mockPatientInfo}
            setPatientInfo={mockSetPatientInfo}
            allPatientInfo={mockAllPatientInfo}
            setAllPatientInfo={mockSetAllPatientInfo}
            />
        );
        const diagnosisSelect = screen.getByLabelText(/current state/i);
        fireEvent.change(diagnosisSelect, { target: { value: 'Depressed' } });
        expect(diagnosisSelect).toHaveValue('Depressed');
    });

    it('calls setPatientInfo on form submit with updated values', async () => {
        render(
            <NewPatientForm
              patientInfo={mockPatientInfo}
              setPatientInfo={mockSetPatientInfo}
              allPatientInfo={mockAllPatientInfo}
              setAllPatientInfo={mockSetAllPatientInfo}
            />
        );
    
        const submitButton = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitButton);
    
        // Check if setPatientInfo was called.
        expect(mockSetPatientInfo).toHaveBeenCalled();
    });

    it('submits the form data to the backend', async () => {
        mockedAxios.post.mockResolvedValue({ /* mock your expected response */ });
    
        render(
            <NewPatientForm
              patientInfo={mockPatientInfo}
              setPatientInfo={mockSetPatientInfo}
              allPatientInfo={mockAllPatientInfo}
              setAllPatientInfo={mockSetAllPatientInfo}
            />
        );
    
        // Replace 'inputFieldName' and 'submitButton' with actual selectors as necessary
        const inputField = screen.getByLabelText(/current state/i);
        fireEvent.change(inputField, { target: { value: 'New Value' } });
        const submitButton = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitButton);
    
        // Wait for the expected asynchronous action to complete
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(
              "http://localhost:8000/api/listMeds/",
              { Diagnosis: 'New Value' } 
            );
        });
    });

    it('displays a validation error for empty required fields on submit', async () => {
        render(
            <NewPatientForm
                patientInfo={mockPatientInfo}
                setPatientInfo={mockSetPatientInfo}
                allPatientInfo={mockAllPatientInfo}
                setAllPatientInfo={mockSetAllPatientInfo}
            />
        );
    
        // Assuming Diagnosis is a required field and you have validation implemented
        const submitButton = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            const validationError = screen.getByText(/Diagnosis is required/i); // Adjust based on your actual validation message
            expect(validationError).toBeInTheDocument();
        });
    });

    it('displays an error message on API failure', async () => {
        mockedAxios.post.mockRejectedValue(new Error("Mock error"));
    
        render(
            <NewPatientForm
                patientInfo={mockPatientInfo}
                setPatientInfo={mockSetPatientInfo}
                allPatientInfo={mockAllPatientInfo}
                setAllPatientInfo={mockSetAllPatientInfo}
            />
        );
    
        const submitButton = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitButton);
    
        await waitFor(() => {
            const errorMessage = screen.getByText(/an error occurred/i); // Use your actual error message text
            expect(errorMessage).toBeInTheDocument();
        });
    });
    
});
