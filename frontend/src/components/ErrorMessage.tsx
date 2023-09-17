import React from 'react';

type Errors = string[];

const ErrorMessage: React.FC<{ errors: Errors }> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="error-message  bg-red-100">

      <ul className="flex flex-col gap-2 error-messages bg-red-100 p-2 rounded">
        {errors.map((error) => (
          <div className='  '>

            <span className='text-red-800 font-bold'>
              There {errors.length === 1 ? 'was' : 'were'} {errors.length} {errors.length === 1 ? 'error' : 'errors'} with your submission
            </span>
            <li key={error} className="list-disc ml-5  text-red-700 ">

              {error}

            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default ErrorMessage;