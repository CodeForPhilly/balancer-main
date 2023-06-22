import React from "react";

interface PatientInfo {
    ID: string;
    Diagnosis: string;
    OtherDiagnosis: string;
    Description: string;
    Age: number;
}

interface PatientHistoryData {
    allPatientInfo: PatientInfo[];
    setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>
    copy: string
}

const PatientHistory = ({ allPatientInfo, setPatientInfo, copy }: PatientHistoryData) => {
  return (
    <div className="flex flex-col gap-2 max-h-100 overflow-y-auto mb-12">
      <br />
      <h2 className="font-satoshi font-bold text-gray-600 text-xl">
        List of <span className="blue_gradient">Patients</span>
      </h2>
      {allPatientInfo.reverse().map((item, index) => (
        <div
          key={`link-${index}`}
          onClick={() => setPatientInfo(item)}
          className="link_card"
        >
          <div className="copy_btn">
            <img
              src={copy}
              alt="copy_icon"
              className="w-[40%] h-[40%] object-contain"
            />
          </div>
          <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
            {item.ID}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PatientHistory;
