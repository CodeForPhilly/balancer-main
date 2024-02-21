// Footer.js

import { useState } from "react";
import { Link } from "react-router-dom";
import "../../App.css"; // Import the common Tailwind CSS styles

function Footer() {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    // <div className="xl:px-50 mx-auto hidden h-20 items-center justify-between border-t border-gray-300 bg-white  px-4 sm:px-6 md:px-8 lg:flex lg:px-8 2xl:px-56">
    <div className=" mt-20 flex w-full  justify-center border-t border-gray-300  ">
      {/* <div className="footer-content footer-content mr-5 mt-5 rounded-md border-l border-r border-t border-gray-300 "> */}{" "}
      {/* Added mt-5 and mr-5 */}
      <footer className="footer font_body mt-10 ">
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
            className="ml-5 mr-5 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
          >
            {text}
          </Link>
        ))}

        <div className="mb-8 mt-8 flex items-center justify-center">
          <div className=" rounded  px-2 py-2 ">
            <input
              type="email"
              id="email"
              className="input w-[300px]"
              placeholder="Enter your email"
            />
          </div>
          <div className="ml-2 ">
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
        <div className="flex justify-center rounded  px-4 py-2 ">
          © 2024 Balancer. All rights reserved.
        </div>
      </footer>
    </div>
    // </div>
  );
}

export default Footer;
