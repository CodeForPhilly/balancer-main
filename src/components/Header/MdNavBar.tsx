import closeLogo from "../../assets/close.svg";
import hamburgerLogo from "../../assets/hamburger.svg";
import { Link } from "react-router-dom";
import logo from "../../assets/balancer.png";
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

const MdNavBar = () => {
  const [nav, setNav] = useState(true);
  const { pathname } = useLocation();
  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <div
      className={
        "lg:hidden flex items-center border-b border-gray-300 h-20 mx-auto bg-white justify-between px-5"
      }
    >
      <nav className="w-full flex items-center">
        <Link to="/">
          <img src={logo} alt="logo" className="object-contain mr-16 w-28 " />
        </Link>
      </nav>
      <div onClick={handleNav} className="">
        {nav && (
          <img
            src={hamburgerLogo}
            alt="logo"
            className="w-7 h-8 md:w-7 md:h-8"
          />
        )}
      </div>
      <div
        className={
          !nav
            ? "fixed left-0 top-0 w-[100%] border-r bg-white border-r-gray-900 h-full ease-in-out duration-500"
            : "fixed left-[-100%] ease-out-in duration-1000"
        }
      >
        <div onClick={handleNav} className="flex justify-end">
          {!nav && (
            <img
              src={closeLogo}
              alt="logo"
              className="w-7 h-8 md:w-7 md:h-8 mt-4 mr-4"
            />
          )}
        </div>
        <div className="m-4">
          <img
            src={logo}
            alt="logo"
            className="object-contain mr-16 w-28 py-2"
          />
        </div>
        <ul className="uppercase font-satoshi">
          <li className="p-4 border-b border-gray-300">
            {pathname === "/" && (
              <>
                <Link
                  to="/login"
                  className="mr-9 text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
                >
                  About Balancer
                </Link>
              </>
            )}
          </li>
          <li className="p-4 border-b border-gray-300">
            {pathname === "/" && (
              <>
                <Link
                  to="/register"
                  className="mr-9 text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
                >
                  Support
                </Link>
              </>
            )}
          </li>
          <li className="p-4 border-b border-gray-300">
            <Link
              to="/login"
              className="mr-9 text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
            >
              Features
              {/* <span className="absolute ml-1.5 transition-transform duration-300 hover:rotate-180">
                  &#8593;
                </span> */}
            </Link>
          </li>
          <li className="p-4 border-b border-gray-300">
            <Link
              to="/register"
              className="mr-9 text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
            >
              Information
              {/* <span className="absolute ml-1.5 transition-transform duration-300 hover:rotate-180">
                  &#8593;
                </span> */}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MdNavBar;
