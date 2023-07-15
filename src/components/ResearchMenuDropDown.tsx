import React from "react";
import { Link } from "react-router-dom";

export const ResearchMenuDropDown = () => {
  return (
    <div className="font-inter absolute flex flex-row bg-white mt-0 py-2 left-0 right-0 w-full h-72 top-full shadow-lg rounded px-4 sm:px-6 md:px-8 lg:px-8 xl:px-50 2xl:px-56">
      <div className="  w-28 mr-9 "> </div>
      <div className="">
        <ul className=" mt-8 mb-8">
          <Link
            to="/login"
            className=" text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
          >
            PubMed
          </Link>
        </ul>
        <ul className=" mb-8">
          <Link
            to="/login"
            className=" mr-9 text-black hover:text-black hover:no-underline hover:border-b-2 hover:border-blue-600"
          >
            Google Scholar
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
            ScienceDirect
            {/* <span className="absolute ml-1.5 transition-transform duration-300 hover:rotate-180">
            &#8593;
          </span> */}
          </Link>
        </ul>
      </div>
    </div>
  );
};
