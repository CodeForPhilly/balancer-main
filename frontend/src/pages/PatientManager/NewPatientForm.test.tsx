import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewPatientForm from './NewPatientForm';

describe('NewPatientForm Component', () => {
  it('renders and shows all fields', () => {
    render(<NewPatientForm /* pass required props here */ />);

    expect(screen.getByLabelText(/current state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bipolar history/i)).toBeInTheDocument();
    // Add assertions for each field you expect to be rendered
  });
});
