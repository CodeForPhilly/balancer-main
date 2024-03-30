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
        <div className="welcome-header w-[90%] md:w-[75%]">
            {subHeader && (
                <h2 className="lg:text-5x1 py-4 text-center font-quicksand text-2xl font-medium text-gray-800 md:mt-4 md:text-3xl">
                    {subHeader}
                </h2>
            )}
            {(descriptionText && <p className="desc1">{descriptionText}</p>) ||
                descriptionEl}
        </div>
    );
}

export default Welcome;
