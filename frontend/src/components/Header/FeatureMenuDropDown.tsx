import { Link } from "react-router-dom";

export const FeatureMenuDropDown = () => {
  return (
    <div className="xl:px-50 absolute   justify-center top-full mt-0 flex h-72 w-[50%] flex-row rounded bg-white px-4 py-2 font-inter shadow-lg sm:px-6 md:px-8 lg:px-8 2xl:px-56">

      <div className="">
        <ul className=" mb-8 mt-8">
          <Link
            to="/"
            className=" text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
          >
            Medication Suggester
          </Link>
        </ul>
        <ul className=" mb-8">
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
