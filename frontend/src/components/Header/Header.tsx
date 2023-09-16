import { useState, useRef, useEffect } from "react";

import { Link } from "react-router-dom";

import "../../components/Header/header.css";
import Chat from "./Chat";
import { FeatureMenuDropDown } from "./FeatureMenuDropDown";
import MdNavBar from "./MdNavBar";

const Header = () => {
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const dropdownRef = useRef(null);
  let delayTimeout: number | null = null;
  const [showChat, setShowChat] = useState(false);

  const handleMouseEnter = () => {
    if (delayTimeout !== null) {
      clearTimeout(delayTimeout);
    }
    setShowFeaturesMenu(true);
  };

  const handleMouseLeave = () => {
    delayTimeout = setTimeout(() => {
      setShowFeaturesMenu(false);
    }, 300) as unknown as number; // Adjust the delay time as needed
  };

  useEffect(() => {
    return () => {
      if (delayTimeout !== null) {
        clearTimeout(delayTimeout);
      }
    };
  }, []);

  return (
    <header className="fixed w-full items-center">
      <div className="hidden h-10 w-full items-center justify-center border-b border-gray-300 bg-blue-100 text-center text-sm font-light text-gray-500 md:flex">
        This app is currently in its beta testing phase. The information and
        tools provided herein are intended for general informational purposes
        only and should NOT be construed as medical advice, diagnosis, or
        treatment.
      </div>
      <div className="flex h-10 w-full items-center justify-center border-b border-gray-300 bg-blue-100 text-center text-sm font-light text-gray-500 md:hidden ">
        This app is currently in its beta testing phase. The information should
        NOT be construed as medical advice.
      </div>
      <div
        className={
          "xl:px-50 mx-auto hidden h-20 items-center justify-between border-b border-gray-300 bg-white  px-4 sm:px-6 md:px-8 lg:flex lg:px-8 2xl:px-56"
        }
      >
          <Link to="/">
            <span className="header_logo  ml-56 text-xl font-bold">
              Balancer
            </span>
          </Link>
        <nav className="flex w-full items-center justify-center font-satoshi text-base">
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={dropdownRef}
            className=""
          >
            <span
              className={` mr-9 text-black ${
                showFeaturesMenu
                  ? "cursor-pointer mx-4 border-b-2 border-blue-600 hover:border-b-2 hover:border-blue-600 hover:no-underline"
                  : "cursor-pointer mx-4 hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
              }`}
            >
              Features
              <span
                className={` ${
                  showFeaturesMenu
                    ? "absolute ml-1.5 rotate-180 transition-transform duration-300"
                    : "absolute ml-1.5 "
                }`}
              >
                &#8593;
              </span>
            </span>
            {showFeaturesMenu && <FeatureMenuDropDown />}
          </div>
          <>
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
              Help
            </Link>
            <Link
              to="/login"
              className="mr-5  text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
            >
              Leave Feedback
            </Link>

            <Chat showChat={showChat} setShowChat={setShowChat} />
          </>
        </nav>
        
            <span className="text-white   mr-56 text-xl font-bold">
              Balancer
            </span>
     
      </div>
      <MdNavBar />
    </header>
  );
};

export default Header;
