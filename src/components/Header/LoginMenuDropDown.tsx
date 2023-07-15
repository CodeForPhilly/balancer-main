import React, { useState } from "react";
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
      {!showLoginMenu && (
        <div
          className="fixed inset-0 bg-gray-900 opacity-50 z-5"
          onClick={handleLoginMenu}
        ></div>
      )}
      <div
        className={
          !showLoginMenu
            ? "fixed right-0 top-0 w-[35%] border-l bg-white border-l-gray-900 h-full ease-in-out duration-1000 z20"
            : "ease-in-out duration-500 fixed right-[-100%]"
        }
      >
        <div onClick={handleLoginMenu} className="mt-10 mr-6 flex justify-end">
          {!showLoginMenu && (
            <img
              src={closeLogo}
              alt="logo"
              className="w-7 h-8 md:w-7 md:h-8 mt-4 mr-4"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default LoginMenuDropDown;
