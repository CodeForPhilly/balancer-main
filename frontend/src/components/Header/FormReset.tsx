import { useRef } from 'react';
import Header from './Header'; // Adjust path as needed
import NewPatientForm from '../../pages/PatientManager/NewPatientForm';

const FormReset = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div>
      <Header isAuthenticated={true} isSuperuser={true} onClearForm={resetForm} />
      <NewPatientForm ref={formRef} />
    </div>
  );
};

export default FormReset;