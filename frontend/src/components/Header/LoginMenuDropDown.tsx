import React from "react";
import { Link } from "react-router-dom";
import { classNames } from "../../utils/classNames";

interface LoginMenuDropDownProps {
  showLoginMenu: boolean;
  handleLoginMenu: () => void;
}

const LoginMenuDropDown: React.FC<LoginMenuDropDownProps> = ({
  showLoginMenu,
}) => {
  return (
    <>
      <LoginMenu show={showLoginMenu} />

      <div
        className={classNames(
          "flex flex-col items-center justify-center gap-y-3 text-md",
          showLoginMenu
            ? "fixed right-0 top-0 z-40 h-full w-[100%] border-l border-l-gray-900 bg-white p-16 duration-1000 ease-in-out md:w-[65%] lg:w-[35%]"
            : "fixed right-[-500%] duration-500 ease-in-out md:right-[-500%]"
        )}
      >
        <span className="select-none relative group font-quicksand text-4xl font-bold text-transparent lg:text-3xl bg-gradient-to-r from-blue-500 via-blue-700 to-blue-300 bg-clip-text">
          Balancer
          <span className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/30 via-blue-700/30 to-blue-300/30 rounded-md blur-lg opacity-0 group-hover:opacity-100 transition duration-300"></span>
        </span>

        <p className="mb-4">
          Balancer is an interactive and user-friendly research tool for bipolar
          medications, powered by Code for Philly volunteers.
        </p>
        <p className="mb-4">
          We built Balancer{" "}
          <b>
            to improve the health and well-being of people with bipolar
            disorder.
          </b>
        </p>
        <p className="mb-4">
          Balancer is currently still being developed, so do not take any
          information on the test site as actual medical advice.
        </p>

        {/* <p className="mb-4">
          You can log in or sign up for a Balancer account using your email,
          gmail or Facebook account.
        </p> */}

        <button
          type="submit"
          className="rounded-xl w-full bg-blue-500 font-bold text-xl md:text-lg px-24 py-2 text-white hover:bg-blue-600 text-nowrap"
        >
          <Link to="/login">Sign In</Link>
        </button>
        {/* <Link to="/register">
              <button
                type="submit"
                className=" mt-1 w-80 rounded-xl bg-blue-500 px-24 py-2 text-white hover:bg-blue-600"
              >
                Sign up
              </button>
            </Link> */}
      </div>
    </>
  );
};

const LoginMenu = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return <div className="inset-0 z-20 bg-gray-900 opacity-50 md:fixed" />;
};

export default LoginMenuDropDown;
