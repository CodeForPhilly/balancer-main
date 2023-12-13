import { useState, useEffect } from "react";

import axios from "axios";

import { PatientInfo } from "./PatientTypes";
import Tooltip from "../../components/Tooltip";
import TypingAnimation from "../../components/Header/components/TypingAnimation.tsx";

interface PatientSummaryProps {
  patientInfo: PatientInfo;
  isPatientDeleted: boolean;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
}

type RiskData = {
  benefits: string[];
  risks: string[];
};

const PatientSummary = ({
  patientInfo,
  isPatientDeleted,
}: PatientSummaryProps) => {
  const [showSummary, setShowSummary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [clickedMedication, setClickedMedication] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (isPatientDeleted) {
      // Reset the component's state
      setShowSummary(true);
      setLoading(false);
      setRiskData(null);
      setClickedMedication(null);
    }
  }, [isPatientDeleted]);

  useEffect(() => {
    // Clear the riskData whenever any data in patientInfo changes
    setRiskData(null);
    setClickedMedication(null);
  }, [patientInfo]);

  const handleClickSummary = () => {
    setShowSummary(!showSummary);
  };

  const handleMedicationClick = async (medication: string) => {
    // Toggle the clickedMedication
    if (clickedMedication === medication) {
      setClickedMedication(null);
      setRiskData(null); // Optionally, clear the riskData if medication is deselected

      return;
    } else {
      setClickedMedication(medication);
      setLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.post(`${baseUrl}/chatgpt/risk`, {
          diagnosis: medication,
        });
        setRiskData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="mx-3 md:mx-0 md:p-0">
        {patientInfo.Diagnosis && (
          <div className=" w-[870px] justify-between">
            <div className="flex justify-between">
              <div>
                <h2 className="header_logo cursor-pointer font-satoshi text-xl font-bold text-gray-600  hover:text-blue-600 ">
                  Summary
                  {/* <span className="blue_gradient">Summary</span> */}
                </h2>
              </div>
              <div
                onClick={handleClickSummary}
                className=" cursor-pointer items-center"
              >
                {showSummary ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 12h12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </div>
            </div>
            {showSummary && (
              <div className="summary_box mt-2 w-[870px]">
                <div className="border-b border-gray-900/10 px-4 py-6 sm:px-0">
                  <h3 className="text-base  leading-7 text-gray-900">
                    <label className="font-semibold">Patient ID:</label>{" "}
                    {patientInfo.ID}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6  text-gray-500">
                    Patient details and application
                  </p>
                </div>
                <div className="mt-3 ">
                  <dl className="">
                    <div className="flex justify-between border-b border-gray-900/10 py-6">
                      <div className="flex w-full ">
                        <dt className="w-1/2 text-sm font-medium leading-6 text-gray-900 ">
                          Current State:
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          {patientInfo.Diagnosis}
                        </dd>
                      </div>
                      <div className=" flex w-full ">
                        <dt className=" w-1/2 text-sm font-medium leading-6 text-gray-900">
                          Bipolar history:
                        </dt>
                        <dd className=" text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          <ul className=" ">
                            {patientInfo.Depression == "True" ? (
                              <li className="h-3 text-sm md:my-0 md:mb-3">
                                Depression
                              </li>
                            ) : (
                              ""
                            )}
                            {patientInfo.Hypomania == "True" ? (
                              <li className="h-3 text-sm md:my-0 md:mb-3">
                                Hypomania
                              </li>
                            ) : (
                              ""
                            )}
                            {patientInfo.Mania == "True" ? (
                              <li className="h-3 text-sm md:my-0 md:mb-3">
                                Mania
                              </li>
                            ) : (
                              ""
                            )}
                          </ul>
                        </dd>
                      </div>
                    </div>
                    <div className="border-b border-gray-900/10 px-4 py-6 sm:grid sm:grid-cols-3  sm:gap-4 sm:px-0">
                      <dt className="mt-3 flex text-sm font-medium leading-6 text-gray-900">
                        Risk Assessment:
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ul
                          role="list"
                          className="divide-y divide-gray-100 rounded-md border border-gray-200  "
                        >
                          <span className="font-medium ">
                            {patientInfo.Psychotic == "Yes" ? (
                              <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100 ">
                                Currently psychotic
                              </li>
                            ) : (
                              ""
                            )}
                          </span>
                          <span className="font-medium ">
                            {patientInfo.Suicide == "Yes" ? (
                              <li className="flex items-center justify-between  border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100 ">
                                Patient has attempted suicide
                              </li>
                            ) : (
                              ""
                            )}
                          </span>
                          <span className="font-medium ">
                            {patientInfo.Kidney == "Yes" ? (
                              <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100 ">
                                <Tooltip text="Lithium can affect kidney function, so it will not be included in the suggested medication list for patients with a risk or history of kidney disease.">
                                  At risk for Kidney disease
                                  <span className="material-symbols-outlined  ml-1">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            ) : (
                              ""
                            )}
                          </span>
                          <span className="font-medium ">
                            {patientInfo.Liver == "Yes" ? (
                              <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100 ">
                                <Tooltip text="Depakote is processed through the liver, so it will not be included in the suggested medication list for patients with a risk or history of liver disease.">
                                  At risk for Liver disease
                                  <span className="material-symbols-outlined  ml-1">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            ) : (
                              ""
                            )}
                          </span>
                          <span className="font-medium ">
                            {patientInfo.blood_pressure == "Yes" ? (
                              <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100 ">
                                <Tooltip text="Second-generation antipsychotics can cause low blood pressure upon standing, putting the patient at risk of passing out and hitting their head, so they will not be included in suggested medication list for patients with a risk or history of low blood pressure.">
                                  At risk for low blood pressure or concern for
                                  falls
                                  <span className="material-symbols-outlined  ml-1">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            ) : (
                              ""
                            )}
                          </span>
                          <span className="font-medium ">
                            {patientInfo.weight_gain == "Yes" ? (
                              <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100 ">
                                <Tooltip text="Seroquel, Risperdal, Abilify, and Zyprexa are known for causing weight gain, so they will not be included in the suggested medications list for patients with concerns about weight gain.">
                                  Has weight gain concerns
                                  <span className="material-symbols-outlined  ml-1">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            ) : (
                              ""
                            )}
                          </span>
                          <span className="font-medium ">
                            {patientInfo.Reproductive == "Yes" ? (
                              <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100 ">
                                <Tooltip text="Depakote is known for causing birth defects and will not be included in the suggested medications list for patients interested in becoming pregnant.">
                                  Wants to conceive in next 2 years
                                  <span className="material-symbols-outlined ml-1">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            ) : (
                              ""
                            )}
                          </span>
                          <span className="font-medium ">
                            {patientInfo.risk_pregnancy == "Yes" ? (
                              <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100 ">
                                <Tooltip text="Depakote is known for causing birth defects and will not be included in the suggested medications list for patients at risk of pregnancy. Note: If the patient is on birth control, taking Depakote is less of a risk.">
                                  Any risk of pregnancy
                                  <span className="material-symbols-outlined ml-1">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            ) : (
                              ""
                            )}
                          </span>
                        </ul>
                      </dd>
                    </div>
                    <div className="flex flex-row justify-between border-b border-gray-900/10 py-6 sm:px-0">
                      <div className="flex w-full">
                        <dt className="w-1/2 text-sm font-medium leading-6 text-gray-900">
                          Current Medications:
                        </dt>
                        <dt className="text-sm  leading-6 text-gray-700">
                          {patientInfo.CurrentMedications}
                        </dt>
                      </div>
                      <div className="flex w-full ">
                        <label
                          htmlFor="current-state"
                          className="block flex w-1/2 text-sm font-medium leading-6 text-gray-900"
                        >
                          Prior medications
                          <Tooltip text="Any bipolar medications entered here will not appear in the list of suggested medications, as they have already been tried without success.">
                            <span className="material-symbols-outlined  ml-1">
                              info
                            </span>
                          </Tooltip>
                        </label>
                        <dt className=" text-sm  leading-6 text-gray-700">
                          {patientInfo.PriorMedications}
                        </dt>
                      </div>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="flex text-sm font-medium leading-6 text-gray-900">
                        Possible Medications:
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ul
                          role="list"
                          className="divide-y divide-gray-100 rounded-md border border-gray-200"
                        >
                          {patientInfo.PossibleMedications &&
                            patientInfo.PossibleMedications.drugs?.map(
                              (medication: string) => (
                                <li
                                  className={`flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100
                                ${
                                  medication === clickedMedication
                                    ? "bg-indigo-100"
                                    : ""
                                } cursor-pointer`}
                                  onClick={() =>
                                    handleMedicationClick(medication)
                                  }
                                >
                                  <div className="flex w-0 flex-1 items-center">
                                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                      <span className="truncate font-medium">
                                        {medication}
                                      </span>
                                      <div className="ml-3 mt-0 flex max-w-sm items-start text-white">
                                        {loading &&
                                        medication === clickedMedication ? (
                                          <TypingAnimation />
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    <span className="font-medium text-indigo-600 hover:text-indigo-500">
                                      Benefits and risks
                                    </span>
                                  </div>
                                </li>
                              )
                            )}
                        </ul>
                      </dd>
                    </div>

                    {riskData && (
                      <div className="grid gap-4 px-4 py-3">
                        {/* <dt className="text-sm font-medium leading-6 text-gray-900">
                          Benefits and risks
                        </dt> */}
                        <dd className="mt-1 text-sm leading-6  text-gray-900 sm:col-span-2 sm:mt-0">
                          <div className="flex">
                            <div className=" w-[50%]">
                              <div>
                                <h4 className="mb-4 mt-4 text-sm font-medium text-indigo-600">
                                  Benefits:
                                </h4>
                              </div>
                              <div className="">
                                <ul className="">
                                  {riskData.benefits.map(
                                    (benefit: string, index: number) => (
                                      <li
                                        key={index}
                                        className="my-8  mr-1 h-12 text-sm hover:bg-indigo-100 md:my-0 md:mb-3"
                                      >
                                        {benefit}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                            <div className="w-[50%]">
                              <div>
                                <h4 className="mb-4 mt-4  text-sm font-medium  text-indigo-600">
                                  Risks:
                                </h4>
                              </div>
                              <div className="">
                                <ul className="">
                                  {riskData.risks.map(
                                    (risk: string, index: number) => (
                                      <li
                                        key={index}
                                        className=" my-8 mr-1 h-12 text-sm hover:bg-indigo-100 md:my-0 md:mb-3"
                                      >
                                        {risk}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSummary;
