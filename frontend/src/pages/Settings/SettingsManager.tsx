import React, { useState, useEffect } from "react";

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

  // Simulate fetching data from an API
  useEffect(() => {
    const fetchData = async () => {
      // Simulate an API call
      const data: SettingItem[] = [
        {
          guid: "f4749460-e37f-497a-9023-34f88aec7b81",
          SourceTableGUID: null,
          SettingValue: "System Prompt",
          SettingsLabel: null,
          SourceTable: "api_ai_promptstorage",
          LastModified: "2024-03-26T12:46:01.789632Z",
          ModifiedByUser: 1,
        },
        {
          guid: "410a06de-7064-4b80-af43-bbffff0eacd0",
          SourceTableGUID: null,
          SettingValue: "ChatGpt",
          SettingsLabel: "LLM",
          SourceTable: "api_chats",
          LastModified: "2024-03-31T00:36:57.419137Z",
          ModifiedByUser: 1,
        },
      ];

      setSettings(data);
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

            {settings.map((setting, index) => (
              <li
                key={index}
                className="flex items-center justify-between  border-b border-gray-900/10"
              >
                <div className="my-5 flex w-[360px]  items-center justify-start  text-base leading-7  text-gray-900">
                  <div className="font-medium">
                    {setting.SettingsLabel || "N/A"}
                  </div>
                  <div className="ml-56">{setting.SettingValue}</div>
                </div>
                <div className="flex text-base leading-7 text-gray-900">
                  <div className="font-medium">Update</div>
                </div>
              </li>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsManager;
