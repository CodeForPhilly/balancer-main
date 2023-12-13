import React, { useState, useEffect, useCallback } from "react";

import axios from "axios";

// import closeLogo from "../../assets/close.svg";
// import logo from "../../assets/balancer.png";
// import { Link } from "react-router-dom";
import TypingAnimation from "./components/TypingAnimation.tsx";

interface SearchMenuProps {
  showSearchMenu: boolean;
  handleSearchMenu: () => void;
}

const SearchMenu: React.FC<SearchMenuProps> = ({
  showSearchMenu,
  handleSearchMenu,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3001/drugReviewSearch/",
        {
          drugReviewSearch: inputValue,
        }
      );
      setMessage(response.data.gpt_message.content);
      setSearchResults(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  }, [inputValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch(); // This activates/deactivates the search.
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSearchMenu(); // This activates/deactivates the search.
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSearchMenu]);

  return (
    <>
      {showSearchMenu && (
        <div
          className="z-5 fixed inset-0 bg-gray-900 opacity-50"
          onClick={handleSearchMenu}
        ></div>
      )}
      <div
        className={
          showSearchMenu
            ? "z20 fixed left-1/2 top-[10%] max-h-[80%] min-h-[30%] w-[45%] -translate-x-1/2  transform  overflow-y-auto rounded-md border-l bg-white p-0 ease-in-out"
            : "hidden"
        }
      >
        <div className="flex flex-col items-center justify-center">
          <div className="ring-slate-1000/10 dark:highlight-white/5 relative h-14 w-[100%] items-center rounded-t-md bg-white text-slate-800 shadow-sm ring-1 focus-within:ring-2 focus-within:ring-sky-500 hover:ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-0 dark:hover:bg-slate-700 sm:flex">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-500 hover:cursor-pointer hover:text-slate-900 dark:text-slate-400"
              aria-hidden="true"
              onClick={handleSearch}
            >
              <path d="m19 19-3.5-3.5"></path>
              <circle cx="11" cy="11" r="6"></circle>
            </svg>
            <input
              type="text"
              className="h-full w-full rounded-t-md border-none bg-transparent py-2 pl-16 pr-3 text-lg focus:outline-none"
              placeholder="Let's find out what others are saying"
              value={inputValue}
              onChange={handleInputChange}
            />
            {/* <button onClick={handleSearch}>Search</button> */}

            <kbd
              onClick={() => handleSearchMenu()}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer font-sans font-semibold dark:text-slate-500"
            >
              <abbr
                title="Control"
                className="text-slate-500 no-underline dark:text-slate-500"
              >
                ESC{" "}
              </abbr>{" "}
            </kbd>
          </div>

          <div className="flex h-20 flex-col items-center justify-center text-center font-satoshi text-xl">
            <p>Let's find out what others are saying</p>
          </div>
          <div className="ml-3 mt-1 flex max-w-sm items-start text-white">
            {loading ? <TypingAnimation /> : null}
          </div>
          <div className="h-18 flex w-[90%] flex-col items-center justify-center p-5 text-center">
            <p>
              The search results are from a database of over 5000 reviews. You
              can ask me anything and I will summarize what others are saying.
            </p>
          </div>
          <div className="mt-4 w-[85%]">
            {message && (
              <h2 className="p-5 font-satoshi text-lg font-bold text-gray-600">
                Summary of<span className="blue_gradient"> Results</span>
              </h2>
            )}
            <div>
              {message && (
                <p className="mb-4 divide-x divide-gray-900/5 rounded-lg bg-gray-50 p-4 text-sm hover:bg-gray-100 ">
                  {message}
                </p>
              )}
            </div>
            {/* <div>
              {message && (
                <pre
                  style={{
                    // display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: "100%",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                  className="mb-4"
                  dangerouslySetInnerHTML={{
                    __html: message,
                  }}
                ></pre>
              )}
            </div> */}
            {message && (
              <h2 className="p-5 font-satoshi text-lg  font-bold text-gray-600">
                List of<span className="blue_gradient"> Results</span>
              </h2>
            )}
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="mb-4 divide-x divide-gray-900/5 rounded-lg bg-gray-50 p-4 text-sm hover:bg-gray-100"
              >
                <h3 className="font-bold">{result.drugName}</h3>
                <br />
                <p>Review: {result.review}</p>
                <p>Date: {result.date}</p>
                <p>Useful Count: {result.usefulCount}</p>
                <p>Condition: {result.condition}</p>
                {/* Other fields like result.condition, result.date can be rendered similarly if desired */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchMenu;
