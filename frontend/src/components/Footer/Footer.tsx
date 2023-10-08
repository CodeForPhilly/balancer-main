// Footer.js

import { useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css"; // Import the common Tailwind CSS styles

function Footer() {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <div className="footer-content">
      <footer className="footer">
        {[
          "Copyright",
          "Contact us",
          "About",
          "Privacy policy",
          "Terms of use",
          "Leave feedback",
        ].map((text, index) => (
          <Link
            key={index}
            to="/login"
            className="mr-5 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
          >
            {text}
          </Link>
        ))}

        <div className="mt-6 flex items-center justify-center">
          <div className="w-1/2 rounded border px-4 py-2 shadow-inner">
            <input
              type="email"
              id="email"
              className="focus:shadow-outline block w-full leading-tight text-gray-700 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div className="ml-4">
            <button
              type="submit"
              className={`btnBlue ${
                isPressed &&
                "transition-transform focus:outline-none focus:ring focus:ring-blue-200"
              }`}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              {isPressed ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-ping rounded-full bg-white"></div>
                  <p>Loading...</p>
                </div>
              ) : (
                <p>Subscribe</p>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
