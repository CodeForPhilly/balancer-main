import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NewPatientForm from './NewPatientForm';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);
  
// Implement a mock function that can handle both overloads
window.scrollTo = vi.fn((...args: [ScrollToOptions?] | [number, number]) => {
if (args.length === 1 && typeof args[0] === 'object') {
    console.log(`Scrolling with options`, args[0]);
} else if (typeof args[0] === 'number' && typeof args[1] === 'number') {
    console.log(`Scrolling to position (${args[0]}, ${args[1]})`);
}
}) as typeof window.scrollTo;

// Define mock data
interface PatientInfo {
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
const mockSetPatientInfo = vi.fn();
const mockSetAllPatientInfo = vi.fn();

const mockAllPatientInfo = [mockPatientInfo];

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => JSON.stringify([mockPatientInfo])),
    setItem: vi.fn(() => null),
  },
  writable: true
});

const props = {
  patientInfo: mockPatientInfo,
  setPatientInfo: mockSetPatientInfo,
  allPatientInfo: mockAllPatientInfo,
  setAllPatientInfo: mockSetAllPatientInfo
};

describe('NewPatientForm useEffect', () => {
  it('loads patient info from localStorage on mount', () => {
    render(<NewPatientForm {...props} />);
    expect(mockSetAllPatientInfo).toHaveBeenCalledWith([mockPatientInfo]);
  });
});

describe('NewPatientForm Component', () => {
  beforeEach(() => {
    mockedAxios.post.mockClear();
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([mockPatientInfo]));

    // Mocking Axios post request to return specific data needed for the component
    mockedAxios.post.mockResolvedValue({
      data: {
        first: ["MedicationA1", "MedicationA2"],
        second: ["MedicationB1", "MedicationB2"],
        third: ["MedicationC1", "MedicationC2"]
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<NewPatientForm {...props} />);
    expect(screen.getByText('Enter Patient Details')).toBeInTheDocument();
  });

  it('prevents form submission if the diagnosis is "Null"', async () => {
    render(<NewPatientForm {...props} />);
    
    // Attempt to submit the form without changing the diagnosis
    const submitButton = screen.getByRole('button', { name: 'submit-test' })
    fireEvent.click(submitButton);
    
    await waitFor(() => expect(mockedAxios.post).not.toHaveBeenCalled());
  });

  it('handles patient info on form submit', async () => {
    const { getByRole, getByLabelText } = render(<NewPatientForm {...props} />);
    
    fireEvent.change(getByLabelText('Current state'), { target: { value: 'Manic' } });
    fireEvent.click(getByRole('button', { name: 'submit-test' }));
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  it('clears the form when the clear button is clicked', async () => {
    render(<NewPatientForm {...props} />);
    const diagnosisSelect = screen.getByRole('combobox', { name: /current state/i }) as HTMLSelectElement; 
    
    fireEvent.change(diagnosisSelect, { target: { value: 'Manic' } });
  
    const clearButton = screen.getByTestId('clear-form-button');
    fireEvent.click(clearButton);
  
    await waitFor(() => {
      expect(diagnosisSelect).toHaveValue('Null');
    });
  });

  it('handles patient info on form submit', async () => {
    render(<NewPatientForm {...props} />);
    
    fireEvent.change(screen.getByLabelText('Current state'), { target: { value: 'Manic' } });
    fireEvent.click(screen.getByRole('button', { name: 'submit-test' }));
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/chatgpt/list_meds', 
        { state: 'Manic' }
      );
    });
  });
});
