import logo from "../../assets/balancer.png";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import accountLogo from "../../assets/account.svg";
import closeLogo from "../../assets/close.svg";
import hamburgerLogo from "../../assets/hamburger.svg";
import "../../components/Header/header.css";
import Typed from "react-typed";
import React, { useState, useRef, useEffect } from "react";
import MdNavBar from "./MdNavBar";
import LoginMenuDropDown from "./LoginMenuDropDown";

const Header = () => {
  const { pathname } = useLocation();
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const dropdownRef = useRef(null);
  let delayTimeout: number | null = null;
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  const handleLoginMenu = () => {
    setShowLoginMenu(!showLoginMenu);
  };

  const handleMouseEnter = () => {
    if (delayTimeout !== null) {
      clearTimeout(delayTimeout);
    }
    setShowFeaturesMenu(true);
  };

  const handleMouseLeave = () => {
    delayTimeout = setTimeout(() => {
      setShowFeaturesMenu(false);
    }, 300); // Adjust the delay time as needed
  };

  useEffect(() => {
    return () => {
      if (delayTimeout !== null) {
        clearTimeout(delayTimeout);
      }
    };
  }, []);

  return (
    <header className="w-full items-center fixed">
      {/* <div className="flex bg-blue-500 text-center font-light text-white w-full h-8 items-center justify-center text-sm">
        WELCOME! STAY TUNE FOR OUR FIRST RELEASE! -
        <Typed strings={["  JULY 30th"]} typeSpeed={200} backSpeed={200} loop />
      </div> */}
      <div
        className={
          "hidden lg:flex items-center border-b border-gray-300 h-20 mx-auto bg-white justify-between  px-4 sm:px-6 md:px-8 lg:px-8 xl:px-50 2xl:px-56"
        }
      >
        <nav className="w-full flex font-satoshi items-center text-sm">
          <Link to="/">
            <img src={logo} alt="logo" className="object-contain w-28 mr-9  " />
          </Link>
          {pathname === "/" && (
            <>
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                ref={dropdownRef}
                className=""
              >
                <span
                  className={` mr-9 text-black ${
                    showFeaturesMenu
                      ? "border-b-2 border-blue-600 hover:no-underline hover:border-b-2 hover:border-blue-600 cursor-pointer"
                      : "hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600 cursor-pointer"
                  }`}
                >
                  Features
                  <span
                    className={` ${
                      showFeaturesMenu
                        ? "absolute ml-1.5 transition-transform duration-300 rotate-180"
                        : "absolute ml-1.5 "
                    }`}
                  >
                    &#8593;
                  </span>
                </span>
                {showFeaturesMenu && (
                  <div className="font-inter absolute flex flex-row bg-white mt-0 py-2 left-0 right-0 w-full h-72 top-full shadow-lg rounded px-4 sm:px-6 md:px-8 lg:px-8 xl:px-50 2xl:px-56">
                    <div className="  w-28 mr-9 "> </div>
                    <div className="">
                      <ul className=" mt-8 mb-8">
                        <Link
                          to="/login"
                          className=" text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
                        >
                          Diagnosis
                        </Link>
                      </ul>
                      <ul className=" mb-8">
                        <Link
                          to="/login"
                          className=" mr-9 text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
                        >
                          Drug Summary and Comparison
                          {/* <span className="absolute ml-1.5 transition-transform duration-300 hover:rotate-180">
                            &#8593;
                          </span> */}
                        </Link>
                      </ul>
                      <ul className=" mb-8">
                        <Link
                          to="/login"
                          className="mr-9 text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
                        >
                          Drug Review Lookup
                          {/* <span className="absolute ml-1.5 transition-transform duration-300 hover:rotate-180">
                            &#8593;
                          </span> */}
                        </Link>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/register"
                className="mr-9 text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
              >
                Information
                {/* <span className="absolute ml-1.5 transition-transform duration-300 hover:rotate-180">
                  &#8593;
                </span> */}
              </Link>
            </>
          )}
        </nav>

        <nav className=" flex font-satoshi justify-end w-full items-center text-sm">
          {pathname === "/" && (
            <>
              <Link
                to="/login"
                className="mr-9  text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
              >
                About Balancer
              </Link>
              <Link
                to="/register"
                className="mr-9  text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
              >
                Support
              </Link>
              <div onClick={handleLoginMenu}>
                <Link to="/">
                  <img
                    src={accountLogo}
                    alt="logo"
                    className="object-contain hover:bg-gray-100 hover:border-blue-600 hover:border-b-2"
                  />
                </Link>
              </div>
              <LoginMenuDropDown
                showLoginMenu={showLoginMenu}
                handleLoginMenu={handleLoginMenu}
              />
            </>
          )}
        </nav>
      </div>
      <MdNavBar />
    </header>
  );
};

export default Header;
