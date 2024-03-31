import { ReactElement } from 'react';

interface WelcomeProps {
    subHeader?: string;
    descriptionText?: string;
    descriptionEl?: ReactElement;
}

function Welcome({
    subHeader = 'Designed to assist prescribers',
    descriptionText,
    descriptionEl,
}: WelcomeProps) {
  return (
    <div className="md:mt-10">
      <h1 className="text-center text-5xl font-extrabold leading-[1.15] text-black sm:text-6xl md:mt-16"></h1>
      {subHeader && (
        <h2 className="px-2  text-center font-quicksand text-2xl font-medium text-gray-800 md:mt-7 md:p-0 md:px-0 md:text-5xl">
          {subHeader}
        </h2>
      )}
      { ( descriptionText || descriptionEl ) &&
        <p className="desc1">{ descriptionText || descriptionEl }</p>
      }
    </div>
  );
}

export default Welcome;
