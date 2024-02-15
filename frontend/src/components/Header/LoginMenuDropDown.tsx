import React from "react";
import { Link } from "react-router-dom";
// import closeLogo from "../../assets/close.svg";

interface LoginMenuDropDownProps {
  showLoginMenu: boolean;
  handleLoginMenu: () => void;
}

const LoginMenuDropDown: React.FC<LoginMenuDropDownProps> = ({
  showLoginMenu,
  handleLoginMenu,
}) => {
  return (
    <>
      {/* {showLoginMenu && (
        <div
          className="z-5 fixed inset-0 bg-gray-900 opacity-50"
          onClick={handleLoginMenu}
        ></div>
      )} */}
      {showLoginMenu && (
        <div className="inset-0 z-20 bg-gray-900 opacity-50 md:fixed"></div>
      )}
      <div
        className={
          showLoginMenu
            ? "fixed right-0 top-0 z-40 h-full w-[100%] border-l border-l-gray-900 bg-white p-16 duration-1000 ease-in-out md:w-[65%] lg:w-[35%]"
            : "fixed right-[-500%] duration-500 ease-in-out md:right-[-100%]"
        }
      >
        <div className="hidden justify-between md:block md:flex">
          <div className="font-satoshi text-2xl">
            <h1>Balance account</h1>
          </div>
          <div onClick={handleLoginMenu}>
            {/* {showLoginMenu && (
              <img
                src={closeLogo}
                alt="logo"
                className="hover:cursor-pointer hover:border-b-2 hover:border-blue-600 md:h-7 md:w-7"
              />
            )} */}
          </div>
        </div>
        <div className="h-44"></div>
        <div className="flex h-20 flex-col items-center  justify-self-center">
          <span className="text-xl font-bold md:mr-8">Balancer</span>
        </div>
        <div className="mb-4 flex hidden h-14 flex-col items-center justify-center text-center font-satoshi text-xl md:block">
          <p>Log into your Balancer account</p>
        </div>
        <div className="flex h-28 flex-col items-center justify-center text-center">
          <p className="mb-4">
            Log into an existing Balancer account or create a new one. With a
            Balance account, you can get access to additional features and store
            data.
          </p>
          <p className="w-96">
            You can log in or sign up for a Balancer account using your email,
            gmail or Facebook account.
          </p>
        </div>
        <div className="flex h-32 flex-col items-center justify-center text-center">
          <div className="mt-8 flex flex-col">
            <Link to="/login">
              <button
                type="submit"
                className=" mt-1 w-80 rounded-xl bg-blue-500 px-24 py-2 text-white hover:bg-blue-600"
              >
                Login
              </button>
            </Link>
            {/* <Link to="/register">
              <button
                type="submit"
                className=" mt-1 w-80 rounded-xl bg-blue-500 px-24 py-2 text-white hover:bg-blue-600"
              >
                Sign up
              </button>
            </Link> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginMenuDropDown;
