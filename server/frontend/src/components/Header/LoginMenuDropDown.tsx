import React from "react";

import { Link } from "react-router-dom";

import closeLogo from "../../assets/close.svg";

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
      {showLoginMenu && (
        <div
          className="z-5 fixed inset-0 bg-gray-900 opacity-50"
          onClick={handleLoginMenu}
        ></div>
      )}
      <div
        className={
          showLoginMenu
            ? "z20 fixed right-0 top-0 h-full w-[35%] border-l border-l-gray-900 bg-white p-16 duration-1000 ease-in-out"
            : "fixed right-[-100%] duration-500 ease-in-out"
        }
      >
        <div className="flex justify-between">
          <div className="font-satoshi text-2xl">
            <h1>Balance account</h1>
          </div>
          <div onClick={handleLoginMenu}>
            {showLoginMenu && (
              <img
                src={closeLogo}
                alt="logo"
                className="hover:cursor-pointer hover:border-b-2 hover:border-blue-600 md:h-7 md:w-7"
              />
            )}
          </div>
        </div>
        <div className="h-44"></div>
        <div className="flex h-20 flex-col items-center  justify-self-center">
          <span className="orange_gradient mr-8 text-xl font-bold">
            Balancer
          </span>
        </div>
        <div className="mb-4 flex h-14 flex-col items-center justify-center text-center font-satoshi text-xl">
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
          {" "}
          <Link to="/login">
            <button
              type="submit"
              className="mt-12 rounded-xl bg-blue-500 px-24 py-2 text-white hover:bg-blue-600"
            >
              Login
            </button>
          </Link>
          <Link to="/register">
            <button
              type="submit"
              className="mt-1 rounded-xl bg-blue-500 px-8 py-2 text-white hover:bg-blue-600"
            >
              Sign up for a new account
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LoginMenuDropDown;
