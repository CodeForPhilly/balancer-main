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

const MedicationItem = ({
  medication,
  isClicked,
  riskData,
  loading,
  onClick,
}: {
  medication: string;
  isClicked: boolean;
  riskData: RiskData | null;
  loading: boolean;
  onClick: () => void;
}) => {
  if (medication === "None") {
    return (
      <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4">
        <div className="flex w-0 flex-1 items-center">
          <div className="ml-4 flex min-w-0 flex-1 gap-2">
            <span className="truncate font-medium">{medication}</span>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="border-b last:border-b-0">
      <li
        className={`flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100
          ${isClicked ? "bg-indigo-100" : ""} cursor-pointer`}
        onClick={onClick}
      >
        <div className="flex w-0 flex-1 items-center">
          <div className="ml-4 flex min-w-0 flex-1 gap-2">
            <span className="truncate font-medium">{medication}</span>
            {loading && isClicked && (
              <div className="ml-3 mt-0 flex max-w-sm items-start text-white">
                <TypingAnimation />
              </div>
            )}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className="font-medium text-indigo-600 hover:text-indigo-500">
            Benefits and risks
          </span>
        </div>
      </li>

      {isClicked && riskData && (
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex">
            <div className="w-1/2 pr-4">
              <h4 className="mb-3 text-sm font-medium text-indigo-600">
                Benefits:
              </h4>
              <ul className="space-y-2">
                {riskData.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm hover:bg-indigo-100">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-1/2 pl-4">
              <h4 className="mb-3 text-sm font-medium text-indigo-600">
                Risks:
              </h4>
              <ul className="space-y-2">
                {riskData.risks.map((risk, index) => (
                  <li key={index} className="text-sm hover:bg-indigo-100">
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MedicationTier = ({
  title,
  medications,
  clickedMedication,
  riskData,
  loading,
  onMedicationClick,
}: {
  title: string;
  medications: string[];
  clickedMedication: string | null;
  riskData: RiskData | null;
  loading: boolean;
  onMedicationClick: (medication: string) => void;
}) => (
  <>
    <dt className="ml-2 flex text-sm font-medium leading-6 text-gray-900">
      {title}:
    </dt>
    <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
      {medications.map((medication) => (
        <MedicationItem
          key={medication}
          medication={medication}
          isClicked={medication === clickedMedication}
          riskData={riskData}
          loading={loading}
          onClick={() => onMedicationClick(medication)}
        />
      ))}
    </ul>
  </>
);

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
      setShowSummary(true);
      setLoading(false);
      setRiskData(null);
      setClickedMedication(null);
    }
  }, [isPatientDeleted]);

  useEffect(() => {
    setRiskData(null);
    setClickedMedication(null);
  }, [patientInfo]);

  const handleClickSummary = () => {
    setShowSummary(!showSummary);
  };

  const handleMedicationClick = async (medication: string) => {
    if (clickedMedication === medication) {
      setClickedMedication(null);
      setRiskData(null);
      return;
    }

    setClickedMedication(medication);
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(`${baseUrl}/chatgpt/risk`, {
        diagnosis: medication,
      });
      setRiskData(response.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMedicationsSection = () => (
    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="flex text-sm font-medium leading-6 text-gray-900">
        Possible Medications:
      </dt>
      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
        {patientInfo.PossibleMedications && (
          <>
            <MedicationTier
              title="Tier 1: First-line Options"
              medications={(
                patientInfo.PossibleMedications.first?.split(", ") ?? []
              ).filter(Boolean)}
              clickedMedication={clickedMedication}
              riskData={riskData}
              loading={loading}
              onMedicationClick={handleMedicationClick}
            />
            <div className="mt-6">
              <MedicationTier
                title="Tier 2: Second-line Options"
                medications={(
                  patientInfo.PossibleMedications.second?.split(", ") ?? []
                ).filter(Boolean)}
                clickedMedication={clickedMedication}
                riskData={riskData}
                loading={loading}
                onMedicationClick={handleMedicationClick}
              />
            </div>
            <div className="mt-6">
              <MedicationTier
                title="Tier 3: Third-line Options"
                medications={(
                  patientInfo.PossibleMedications.third?.split(", ") ?? []
                ).filter(Boolean)}
                clickedMedication={clickedMedication}
                riskData={riskData}
                loading={loading}
                onMedicationClick={handleMedicationClick}
              />
            </div>
          </>
        )}
      </dd>
    </div>
  );

  return (
    <section className="lg:flex lg:items-center lg:justify-center">
      <div className="md:mx-0 md:p-0">
        <br />
        {patientInfo.ID && (
          <div className="justify-between lg:w-[860px]">
            {!showSummary && (
              <div className="font_body rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8 lg:w-[860px]">
                <div
                  onClick={handleClickSummary}
                  className="flex items-center justify-between"
                >
                  <h2 className="header_logo cursor-pointer font-satoshi text-xl font-bold text-gray-600 hover:text-blue-600">
                    Patient Summary
                  </h2>
                  <div className="cursor-pointer items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {showSummary && (
              <div className="font_body rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8">
                <div>
                  <div
                    onClick={handleClickSummary}
                    className="flex items-center justify-between"
                  >
                    <h2 className="header_logo cursor-pointer font-satoshi text-xl font-bold text-gray-600 hover:text-blue-600">
                      Summary
                    </h2>
                    <div
                      onClick={handleClickSummary}
                      className="cursor-pointer items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 12h12"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="mt-2 border-b border-gray-900/10">
                  <h3 className="text-base leading-7 text-gray-900">
                    <label className="font-semibold">Patient ID:</label>{" "}
                    {patientInfo.ID}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                    Patient details and application
                  </p>
                </div>
                <div className="mt-3">
                  <dl>
                    <div className="flex-row justify-between border-b border-gray-900/10 py-6 md:flex">
                      <div className="flex w-full md:p-0">
                        <dt className="w-1/2 text-sm font-medium leading-6 text-gray-900">
                          Current State:
                        </dt>
                        <dd className="text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          {patientInfo.Diagnosis}
                        </dd>
                      </div>
                    </div>
                    <div className="border-b border-gray-900/10 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 md:py-6">
                      <dt className="mt-3 flex text-sm font-medium leading-6 text-gray-900">
                        Risk Assessment:
                      </dt>
                      <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ul
                          role="list"
                          className="divide-y divide-gray-100 rounded-md border border-gray-200"
                        >
                          {/* Risk Assessment Items */}
                          {patientInfo.Psychotic === "Yes" && (
                            <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100">
                              Currently psychotic
                            </li>
                          )}
                          {patientInfo.Suicide === "Yes" && (
                            <li className="flex items-center justify-between border-b border-gray-900/10 py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100">
                              <Tooltip text="Lithium is the only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder, so it will be shown at the top of the suggested medications list.">
                                Patient has a history of suicide attempts
                                <span className="material-symbols-outlined ml-1">
                                  info
                                </span>
                              </Tooltip>
                            </li>
                          )}
                          {/* Add other risk assessment items similarly */}
                        </ul>
                      </dd>
                    </div>
                    <div className="flex flex-col justify-between border-b border-gray-900/10 py-6 sm:px-0 md:flex-row">
                      <div className="flex w-full">
                        <dt className="w-1/2 text-sm font-medium leading-6 text-gray-900">
                          Current Medications:
                        </dt>
                        <dt className="text-sm leading-6 text-gray-700">
                          {patientInfo.CurrentMedications}
                        </dt>
                      </div>
                      <br />
                      <div className="flex w-full">
                        <label
                          htmlFor="current-state"
                          className="block flex w-1/2 text-sm font-medium leading-6 text-gray-900"
                        >
                          Prior medications
                          <Tooltip text="Any bipolar medications entered here will not appear in the list of suggested medications, as they have already been tried without success.">
                            <span className="material-symbols-outlined ml-1">
                              info
                            </span>
                          </Tooltip>
                        </label>
                        <dt className="text-sm leading-6 text-gray-700">
                          {patientInfo.PriorMedications}
                        </dt>
                      </div>
                    </div>
                    {renderMedicationsSection()}
                  </dl>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PatientSummary;
