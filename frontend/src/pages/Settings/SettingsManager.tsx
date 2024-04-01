import React, { useState, useEffect } from "react";
import axios from "axios";

// Define an interface for the setting items
interface SettingItem {
  guid: string;
  SourceTableGUID: null | string;
  SettingValue: string;
  SettingsLabel: null | string;
  SourceTable: string;
  LastModified: string;
  ModifiedByUser: number;
}

const SettingsManager: React.FC = () => {
  // const [showSummary, setShowSummary] = useState<boolean>(true);
  const [settings, setSettings] = useState<SettingItem[]>([]);
  function truncateStringByWord(str: string, limit: number): string {
    const words = str.split(" ");

    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }

    return str;
  }
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem("access");
      if (accessToken) {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `JWT ${accessToken}`, // Assuming the use of JWT for Authorization
          },
        };

        // Use an environment variable for the base URL or directly insert the URL if not available
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const url = `${baseUrl}/ai_settings/settings/`;
        try {
          const response = await axios.get<SettingItem[]>(url, config);
          setSettings(response.data);
        } catch (error) {
          console.error("There was an error fetching the settings:", error);
        }
      } else {
        console.log("Access token is not available.");
      }
    };

    fetchData();
  }, []);
  // const handleClickSummary = () => {
  //   setShowSummary(!showSummary);
  // };

  return (
    <section className="md:mt-28 lg:flex lg:items-center lg:justify-center">
      <div className="md:mx-0 md:p-0">
        <br />
        <div className="justify-between lg:w-[860px]">
          <div className="font_body rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8">
            <h2 className="text-base  leading-7 text-gray-900">
              <label className="font-semibold">AI Settings</label>
            </h2>
            <div className="mt-2 border-b border-gray-900/10 ">
              <p className="mb-5 mt-1 max-w-2xl text-sm leading-6  text-gray-500">
                This is where you set your settings.
              </p>
            </div>
            <ul className="list-none">
              {settings.map((setting, index) => (
                <li
                  key={index}
                  className="my-5 grid grid-cols-12 items-center border-b border-gray-900/10 py-2"
                >
                  <div className="col-span-4 text-base font-medium leading-7 text-gray-900">
                    {setting.SettingsLabel || "N/A"}
                  </div>
                  <div className="col-span-7 text-base leading-7 text-gray-900">
                    {truncateStringByWord(setting.SettingValue, 50)}
                  </div>
                  <div className="col-span-1 text-right text-base leading-7 text-gray-900">
                    <button className="font-medium">Update</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsManager;
