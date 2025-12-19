import { Link, useLocation } from "react-router-dom";

export const FeatureMenuDropDown = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  return (
    <div className="h-50 absolute top-full mb-2 mt-2 flex flex-row items-center rounded-lg border-2 bg-white font-satoshi text-sm">
      <div className="">
        <Link to="/AdminPortal">
          <ul className={currentPath === "/AdminPortal" ? "subheader-nav-item subheader-nav-item-selected" : "subheader-nav-item"}>
            <span className="font-bold">Manage files</span>

            <div className="font-normal mt-1 text-gray-600">
              Manage and chat with files
            </div>
          </ul>
        </Link>
        <Link to="/rulesmanager">
          <ul className={currentPath === "/rulesmanager" ? "subheader-nav-item subheader-nav-item-selected" : "subheader-nav-item"}>
            <span className="font-bold">Manage rules</span>

            <div className="font-normal mt-1 text-gray-600">
              Manage list of rules
            </div>
          </ul>
        </Link>
        <Link to="/ManageMeds">
          <ul className={currentPath === "/ManageMeds" ? "subheader-nav-item subheader-nav-item-selected" : "subheader-nav-item"}>
            <span className="font-bold">Manage meds</span>

            <div className="font-normal mt-1 text-gray-600">
              Manage list of meds
            </div>
          </ul>
        </Link>
        {/*
        <Link to="/drugSummary">
          <ul className=" cursor-pointer rounded-lg p-3 transition duration-300 hover:bg-gray-100">
            <span className=" font-bold text-black ">Manage Prompts</span>
            <div className="mt-1 font-satoshi text-sm  text-gray-400">
              This is to set and test the Balancer-AI's personality.
            </div>
          </ul>
        </Link>

        <Link to="/settings">
          <ul className=" cursor-pointer rounded-lg p-3 transition duration-300 hover:bg-gray-100">
            <span className=" font-bold text-black ">Settings Manager</span>
            <div className="mt-1 font-satoshi text-sm  text-gray-400">
              Control Settings for the Balancer-AI.
            </div>
          </ul>
        </Link> */}

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