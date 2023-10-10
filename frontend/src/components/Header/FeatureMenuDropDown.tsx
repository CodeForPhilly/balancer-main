import { Link } from "react-router-dom";

export const FeatureMenuDropDown = () => {
  return (
    <div className="absolute text-sm items-center mt-2 mb-2 top-full  flex h-50 flex-row rounded-lg bg-white font-inter border-2 sm:px-6 md:px-8 lg:px-8 xl:px-6 ">

      <div className="mx-3 my-5 ">
      <ul  className=" cursor-pointer  hover:bg-gray-100 p-3 rounded-lg transition duration-300">
          <Link
            to="/"
          
          >
              <span  className=" text-black font-bold  ">
            Medication Suggester
              </span>
                
          <div className="text-sm font-satoshi mt-1 text-gray-400">Medication recommendations based on symptoms and medical history.</div>
          </Link>
        </ul>


        <ul  className=" cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition duration-300">
          <Link
            to="/drugSummary"
           
            >
              <span  className=" text-black font-bold ">

            Medication Summary and Comparison
              </span>
           <div className="text-sm font-satoshi mt-1  text-gray-400">Streamline drug documentation analysis.</div>
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
