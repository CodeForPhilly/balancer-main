import logo from "../../assets/balancer.png";
import { Link } from "react-router-dom";
// import { useLocation } from "react-router-dom";
import accountLogo from "../../assets/account.svg";
import "../../components/Header/header.css";
// import Typed from "react-typed";
import { useState, useRef, useEffect } from "react";
import MdNavBar from "./MdNavBar";
import LoginMenuDropDown from "./LoginMenuDropDown";
import { FeatureMenuDropDown } from "./FeatureMenuDropDown";
import { ResearchMenuDropDown } from "./ResearchMenuDropDown";

const Header = () => {
  // const { pathname } = useLocation();
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const [showResearchMenu, setShowResearchMenu] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownResearchRef = useRef(null);
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
    setShowResearchMenu(false);
  };

  const handleMouseLeave = () => {
    delayTimeout = setTimeout(() => {
      setShowFeaturesMenu(false);
    }, 300); // Adjust the delay time as needed
  };

  const handleMouseEnterResearch = () => {
    if (delayTimeout !== null) {
      clearTimeout(delayTimeout);
    }
    setShowResearchMenu(true);
    setShowFeaturesMenu(false);
  };

  const handleMouseLeaveResearch = () => {
    delayTimeout = setTimeout(() => {
      setShowResearchMenu(false);
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
              {showFeaturesMenu && <FeatureMenuDropDown />}
            </div>

            <div
              onMouseEnter={handleMouseEnterResearch}
              onMouseLeave={handleMouseLeaveResearch}
              ref={dropdownResearchRef}
              className=""
            >
              <span
                className={` mr-9 text-black ${
                  showResearchMenu
                    ? "border-b-2 border-blue-600 hover:no-underline hover:border-b-2 hover:border-blue-600 cursor-pointer"
                    : "hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600 cursor-pointer"
                }`}
              >
                Research Information
                <span
                  className={` ${
                    showResearchMenu
                      ? "absolute ml-1.5 transition-transform duration-300 rotate-180"
                      : "absolute ml-1.5 "
                  }`}
                >
                  &#8593;
                </span>
                {showResearchMenu && <ResearchMenuDropDown />}
              </span>
            </div>
          </>
        </nav>

        <nav className=" flex font-satoshi justify-end w-full items-center text-sm">
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
              <img
                src={accountLogo}
                alt="logo"
                className="object-contain hover:bg-gray-100 hover:border-blue-600 hover:border-b-2"
              />
            </div>
            <LoginMenuDropDown
              showLoginMenu={showLoginMenu}
              handleLoginMenu={handleLoginMenu}
            />
          </>
        </nav>
      </div>
      <MdNavBar />
    </header>
  );
};

export default Header;
