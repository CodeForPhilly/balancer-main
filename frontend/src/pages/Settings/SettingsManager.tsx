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
  const [showSummary, setShowSummary] = useState<boolean>(true);
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

  const handleClickSummary = () => {
    setShowSummary(!showSummary);
  };

  return (
    <section className="md:mt-28 lg:flex lg:items-center lg:justify-center">
      <div className="md:mx-0 md:p-0">
        <br />
        <div className="justify-between lg:w-[860px]">
          <div className="font_body rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8">
            <h2 className="header_logo font-satoshi text-xl font-bold text-gray-600 hover:text-blue-600">
              Settings
            </h2>
            {settings.map((setting, index) => (
              <div key={index} className="mt-2 border-b border-gray-900/10">
                <p className="text-base leading-7 text-gray-900">
                  <strong>GUID:</strong> {setting.guid}
                  <br />
                  <strong>Source Table GUID:</strong>{" "}
                  {setting.SourceTableGUID || "N/A"}
                  <br />
                  <strong>Setting Value:</strong> {setting.SettingValue}
                  <br />
                  <strong>Settings Label:</strong>{" "}
                  {setting.SettingsLabel || "N/A"}
                  <br />
                  <strong>Source Table:</strong> {setting.SourceTable}
                  <br />
                  <strong>Last Modified:</strong>{" "}
                  {new Date(setting.LastModified).toLocaleDateString()}
                  <br />
                  <strong>Modified By User:</strong> {setting.ModifiedByUser}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsManager;
