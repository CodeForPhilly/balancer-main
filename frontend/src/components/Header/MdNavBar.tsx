import { useState } from "react";

import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Chat from "./Chat";
// import logo from "../../assets/balancer.png";
import closeLogo from "../../assets/close.svg";
import hamburgerLogo from "../../assets/hamburger.svg";

interface LoginFormProps {
  isAuthenticated: boolean;
}

const MdNavBar = (props: LoginFormProps) => {
  const [nav, setNav] = useState(true);
  const { pathname } = useLocation();
  const [showChat, setShowChat] = useState(false);
  const { isAuthenticated } = props;
  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <div
      className={
        "mx-auto flex items-center justify-between border-b border-gray-300 bg-white px-5 md:h-20 lg:hidden"
      }
    >
      <nav className="flex w-full ">
        {/* <Link to="/">
          <img src={logo} alt="logo" className="mr-16 w-28 object-contain " />
        </Link> */}
        <Link to="/">
          <span className="header_logo  text-xl font-bold ">Balancer</span>
        </Link>
      </nav>
      <div onClick={handleNav} className="">
        {nav && (
          <img
            src={hamburgerLogo}
            alt="logo"
            className="h-8 w-7 md:h-8 md:w-7"
          />
        )}
      </div>
      <div
        className={
          !nav
            ? "fixed left-0 top-0 h-full w-[100%] border-r border-r-gray-900 bg-white duration-500 ease-in-out"
            : "ease-out-in fixed left-[-100%] duration-1000"
        }
      >
        <div onClick={handleNav} className="flex justify-end">
          {!nav && (
            <img
              src={closeLogo}
              alt="logo"
              className="mr-4 mt-4 h-8 w-7 md:h-8 md:w-7"
            />
          )}
        </div>
        <div className="m-4">
          {/* <img
            src={logo}
            alt="logo"
            className="mr-16 w-28 object-contain py-2"
          /> */}
          <span className="header_logo  ml-52 text-xl font-bold">Balancer</span>
        </div>
        <ul className="font-satoshi uppercase">
          <li className="border-b border-gray-300 p-4">
            {pathname === "/" && (
              <>
                <Link
                  to="/login"
                  className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                >
                  About Balancer
                </Link>
              </>
            )}
          </li>
          <li className="border-b border-gray-300 p-4">
            {pathname === "/" && (
              <>
                <Link
                  to="/register"
                  className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
                >
                  Support
                </Link>
              </>
            )}
          </li>
          <li className="border-b border-gray-300 p-4">
            <Link
              to="/login"
              className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
            >
              Features
            </Link>
          </li>
          <li className="border-b border-gray-300 p-4">
            <Link
              to="/register"
              className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
            >
              Information
            </Link>
          </li>
        </ul>
      </div>
      {isAuthenticated && (
        <Chat showChat={showChat} setShowChat={setShowChat} />
      )}
    </div>
  );
};

export default MdNavBar;
