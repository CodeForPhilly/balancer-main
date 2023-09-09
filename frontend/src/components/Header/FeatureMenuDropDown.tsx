import { Link } from "react-router-dom";

export const FeatureMenuDropDown = () => {
  return (
    <div className="xl:px-50 absolute left-0 right-0 top-full mt-0 flex h-72 w-full flex-row rounded bg-white px-4 py-2 font-inter shadow-lg sm:px-6 md:px-8 lg:px-8 2xl:px-56">
      <div className="  mr-26 w-28 "> </div>
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
            to="/login"
            className=" mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
          >
            Medication Summary and Comparison
            {/* <span className="absolute ml-1.5 transition-transform duration-300 hover:rotate-180">
            &#8593;
          </span> */}
          </Link>
        </ul>
        <ul className=" mb-8">
          <Link
            to="/login"
            className="mr-9 text-black hover:border-b-2 hover:border-blue-600 hover:text-black hover:no-underline"
          >
            Review Lookup
            {/* <span className="absolute ml-1.5 transition-transform duration-300 hover:rotate-180">
            &#8593;
          </span> */}
          </Link>
        </ul>
      </div>
    </div>
  );
};
