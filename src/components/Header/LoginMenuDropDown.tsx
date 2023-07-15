import React, { useState } from "react";
import closeLogo from "../../assets/close.svg";
import logo from "../../assets/balancer.png";

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
      {!showLoginMenu && (
        <div
          className="fixed inset-0 bg-gray-900 opacity-50 z-5"
          onClick={handleLoginMenu}
        ></div>
      )}
      <div
        className={
          !showLoginMenu
            ? "fixed right-0 top-0 p-16 w-[35%] border-l bg-white border-l-gray-900 h-full ease-in-out duration-1000 z20"
            : "ease-in-out duration-500 fixed right-[-100%]"
        }
      >
        <div className="flex justify-between">
          <div className="font-satoshi text-2xl">
            <h1>Balance account</h1>
          </div>
          <div onClick={handleLoginMenu}>
            {!showLoginMenu && (
              <img src={closeLogo} alt="logo" className="md:w-7 md:h-7" />
            )}
          </div>
        </div>
        <div className="h-44"></div>
        <div className="h-20 flex justify-self-center">
          <div className="mx-auto">
            <img
              src={logo}
              alt="logo"
              className=" w-28 object-contain hover:bg-gray-100 hover:border-blue-600 hover:border-b-2"
            />
          </div>
        </div>
        <div className="font-satoshi text-xl h-14 flex flex-col justify-center items-center text-center">
          <p>Log into your Balance account</p>
        </div>
        <div className="h-28 flex flex-col justify-center items-center text-center">
          <p>
            Log into an existing Balance account or create a new one. With a
            Balance account, you can get access to additional features and store
            data.
          </p>
          <br></br>
          <p className="w-96">
            You can log in or sign up for a Balance account using your email,
            gmail or Facebook account.
          </p>
        </div>
        <div className="h-32 flex flex-col justify-center items-center text-center">
          {" "}
          <button
            type="submit"
            className="mt-12 bg-blue-500 rounded-xl text-white py-2 px-24 hover:bg-blue-600"
          >
            <p>Login</p>
          </button>
          <button
            type="submit"
            className="mt-1 bg-blue-500 rounded-xl text-white py-2 px-8 hover:bg-blue-600"
          >
            <p>Sign up for a new account</p>
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginMenuDropDown;
