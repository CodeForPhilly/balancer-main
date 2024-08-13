import { useRef } from 'react';
import Header from './Header'; 


const FormReset = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div>
      <Header onClearForm={resetForm} />
    </div>
  );
};

export default FormReset;