import { Link } from "react-router-dom";

export const FeatureMenuDropDown = () => {
  return (
    <div className="absolute text-sm items-center mt-2 top-full mt-0 flex h-40 w-90 flex-row rounded-lg bg-white font-inter border-2 sm:px-6 md:px-8 lg:px-8 xl:px-6 ">

      <div className="mx-5">
        <ul className=" mb-2 mt-2">
          <Link
            to="/"
            className=" text-black font-bold hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
          >
            Medication Suggester
          </Link>
          <div className="text-sm font-satoshi mt-1 text-gray-400">Medication recommendations based on symptoms and medical history.</div>
        </ul>
        <ul className=" mb-2 mt-5">
          <Link
            to="/drugSummary"
            className=" mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
          >
            Medication Summary and Comparison
          </Link>
        </ul>

        {/* <div
          className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
          onClick={handleSearchMenu}
        >
          <span className="flex-auto"> Review Lookup</span>
        </div>
        <SearchMenu
          showSearchMenu={showSearchMenu}
          handleSearchMenu={handleSearchMenu}
        /> */}
      </div>
    </div>
  );
};
