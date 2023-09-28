import React, { useState } from "react";
// import "./footer.css"; // Import the corresponding CSS file
import "../../components/Footer/footer.css";
import { Link } from "react-router-dom";
const Footer = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <Link
          to="/login"
          className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
        >
          Copyright
        </Link>
        <Link
          to="/login"
          className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
        >
          Contact us
        </Link>
        <Link
          to="/login"
          className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
        >
          About
        </Link>
        <Link
          to="/login"
          className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
        >
          Privacy policy
        </Link>
        <Link
          to="/login"
          className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
        >
          Terms of use
        </Link>
        <Link
          to="/login"
          className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
        >
          Leave feedback
        </Link>
      </div>
      <div className="footer-form">
        <input type="text" className="input" placeholder="Enter your email" />
        <button
          type="submit"
          className={`btnBlue ${
            isPressed &&
            "transition-transform focus:outline-none focus:ring focus:ring-blue-200"
          }${
            isLoading
              ? "bg-white-600 transition-transform focus:outline-none focus:ring focus:ring-blue-500"
              : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          disabled={isLoading} // Disable the button while loading
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="mr-2 h-4 w-4 animate-ping rounded-full bg-white"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <p>Subscribe</p>
          )}
        </button>
      </div>
    </footer>
  );
};
export default Footer;
