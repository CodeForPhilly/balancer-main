import React from "react";

type Errors = string[];

const ErrorMessage: React.FC<{ errors: Errors }> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className=" bg-red-100">
      <ul className=" flex flex-col gap-2 rounded bg-red-100 p-2">
        {errors.map((error) => (
          <div className="  ">
            <span className="font-bold text-red-800">
              There {errors.length === 1 ? "was" : "were"} {errors.length}{" "}
              {errors.length === 1 ? "error" : "errors"} with your submission
            </span>
            <li key={error} className="ml-5 list-disc  text-red-700 ">
              {error}
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default ErrorMessage;
