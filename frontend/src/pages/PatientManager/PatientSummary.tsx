import React, { useState, useEffect, useRef } from "react";
import { PatientInfo } from "./PatientTypes";
import Tooltip from "../../components/Tooltip";
import TypingAnimation from "../../components/Header/components/TypingAnimation.tsx";
import { FaPencilAlt, FaPrint, FaMinus, FaRegThumbsDown } from "react-icons/fa";
import FeedbackForm from "../Feedback/FeedbackForm";
import Modal from "../../components/Modal/Modal";
import { EllipsisVertical } from "lucide-react";
import { fetchRiskDataWithSources } from "../../api/apiClient.ts";

interface PatientSummaryProps {
  showSummary: boolean;
  setShowSummary: (state: boolean) => void;
  setEnterNewPatient: (isEnteringNewPatient: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  patientInfo: PatientInfo;
  isPatientDeleted: boolean;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
}

type SourceItem = {
  title: string | null;
  publication: string | null;
  text: string;
  rule_type?: "INCLUDE" | "EXCLUDE" | "include" | "exclude";
  history_type?: string;
  guid?: string | null;
  page?: number | null;
  link_url?: string | null;
};
type RiskData = {
  benefits: string[];
  risks: string[];
  source?: string;
  sources?: SourceItem[];
};

type MedicationWithSource = {
  name: string;
  source: "include" | "diagnosis";
};

const truncate = (s = "", n = 220) =>
  s.length > n ? s.slice(0, n).trim() + "…" : s;

const MedicationItem = ({
  medication,

  isClicked,
  riskData,
  loading,
  onSourcesClick,
  onBenefitsRisksClick,
  activePanel,
}: {
  medication: string;
  source: string;
  isClicked: boolean;
  riskData: RiskData | null;
  loading: boolean;
  onSourcesClick: () => void;
  onBenefitsRisksClick: () => void;
  activePanel: "sources" | "benefits-risks" | null;
}) => {
  if (medication === "None") {
    return (
      <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4">
        <div className="flex items-center flex-1 w-0">
          <div className="flex flex-1 min-w-0 gap-2 ml-4">
            <span className="font-medium truncate">{medication}</span>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="border-b last:border-b-0">
      <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100">
        <div className="flex items-center flex-1 w-0">
          <div className="flex flex-1 min-w-0 gap-2 ml-4">
            <span className="font-medium truncate">{medication}</span>
            {loading && isClicked && (
              <div className="flex items-start max-w-sm mt-0 ml-3 text-white">
                <TypingAnimation />
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <span
            className={`font-medium text-indigo-600 hover:text-indigo-500 border border-transparent hover:border-indigo-300 cursor-pointer px-2 py-1 rounded ${
              isClicked && activePanel === "sources" ? "bg-indigo-100" : ""
            }`}
            onClick={onSourcesClick}
          >
            Sources
          </span>
        </div>
        <div className="flex-shrink-0 ml-4">
          <span
            className={`font-medium text-indigo-600 hover:text-indigo-500 border border-transparent hover:border-indigo-300 cursor-pointer px-2 py-1 rounded ${
              isClicked && activePanel === "benefits-risks"
                ? "bg-indigo-100"
                : ""
            }`}
            onClick={onBenefitsRisksClick}
          >
            Benefits and risks
          </span>
        </div>
      </li>

      {isClicked && riskData && activePanel === "benefits-risks" && (
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex">
            <div className="w-1/2 pr-4">
              <h4 className="mb-3 text-sm font-medium text-indigo-600">
                Benefits:
              </h4>
              <ul className="space-y-2">
                {riskData.benefits.map((b, i) => (
                  <li key={i} className="text-sm hover:bg-indigo-100">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-1/2 pl-4">
              <h4 className="mb-3 text-sm font-medium text-indigo-600">
                Risks:
              </h4>
              <ul className="space-y-2">
                {riskData.risks.map((r, i) => (
                  <li key={i} className="text-sm hover:bg-indigo-100">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isClicked && riskData && activePanel === "sources" && (
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-indigo-600">Sources</h4>
          </div>

          {riskData.sources?.length ? (
            <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
              {riskData.sources.map((s, idx) => (
                <li key={idx} className="px-4 py-3">
                  <div className="mt-1 text-sm font-medium text-gray-900 flex items-center justify-between">
                    <span>{s.title || "Untitled source"}</span>

                    {s.link_url && (
                      <a
                        href={s.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        View PDF
                      </a>
                    )}
                  </div>

                  {s.publication && (
                    <div className="text-xs text-gray-500">{s.publication}</div>
                  )}

                  <p className="mt-2 text-sm text-gray-700">
                    {truncate(s.text)}
                  </p>

                  {s.page && (
                    <div className="mt-1 text-xs text-gray-400">
                      Page {s.page}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              No sources available for this medication.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const MedicationTier = ({
  title,
  tier,
  medications,
  clickedMedication,
  riskData,
  loading,
  onSourcesClick,
  onBenefitsRisksClick,
  activePanel,
}: {
  title: string;
  tier: string;
  medications: MedicationWithSource[];
  clickedMedication: string | null;
  riskData: RiskData | null;
  loading: boolean;
  onSourcesClick: (medication: MedicationWithSource) => void;
  onBenefitsRisksClick: (medication: MedicationWithSource) => void;
  activePanel: "sources" | "benefits-risks" | null;
}) => (
  <>
    <dt className="flex ml-2 text-sm font-medium leading-6 text-gray-900">
      {title}:
    </dt>
    {medications.length ? (
      <ul className="border border-gray-200 divide-y divide-gray-100 rounded-md">
        {medications.map((medicationObj) => (
          <MedicationItem
            key={medicationObj.name}
            medication={medicationObj.name}
            source={medicationObj.source}
            isClicked={medicationObj.name === clickedMedication}
            riskData={riskData}
            loading={loading}
            onSourcesClick={() => onSourcesClick(medicationObj)}
            onBenefitsRisksClick={() => onBenefitsRisksClick(medicationObj)}
            activePanel={activePanel}
          />
        ))}
      </ul>
    ) : (
      <em className="ml-2">{`Patient's other health concerns may contraindicate typical ${tier} line options.`}</em>
    )}
  </>
);

const PatientSummary = ({
  showSummary,
  setShowSummary,
  setEnterNewPatient,
  setIsEditing,
  patientInfo,
  isPatientDeleted,
}: PatientSummaryProps) => {
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [clickedMedication, setClickedMedication] = useState<string | null>(
    null
  );
  const [activePanel, setActivePanel] = useState<
    "sources" | "benefits-risks" | null
  >(null);

  const [isModalOpen, setIsModalOpen] = useState({ status: false, id: "" });

  const handleOpenModal = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsModalOpen({ status: true, id: id });
  };

  const handleCloseModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsModalOpen({ status: false, id: "" });
  };

  useEffect(() => {
    if (isPatientDeleted) {
      setShowSummary(true);
      setLoading(false);
      setRiskData(null);
      setClickedMedication(null);
      setActivePanel(null);
    }
  }, [isPatientDeleted, setShowSummary]);

  useEffect(() => {
    setRiskData(null);
    setClickedMedication(null);
    setActivePanel(null);
  }, [patientInfo]);

  const handleClickSummary = () => {
    setShowSummary(!showSummary);
  };
  const handleSourcesClick = async (medicationObj: MedicationWithSource) => {
    const { name: medication, source } = medicationObj;

    if (clickedMedication === medication && activePanel === "sources") {
      setClickedMedication(null);
      setActivePanel(null);
      setRiskData(null);
      return;
    }

    setClickedMedication(medication);
    setActivePanel("sources");
    setLoading(true);

    try {
      const data = await fetchRiskDataWithSources(medication, source);
      setRiskData(data as RiskData);
    } catch (error) {
      console.error("Error fetching risk data: ", error);
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBenefitsRisksClick = async (
    medicationObj: MedicationWithSource
  ) => {
    const { name: medication, source } = medicationObj;

    if (clickedMedication === medication && activePanel === "benefits-risks") {
      setClickedMedication(null);
      setActivePanel(null);
      setRiskData(null);
      return;
    }

    setClickedMedication(medication);
    setActivePanel("benefits-risks");
    setLoading(true);

    try {
      const data = await fetchRiskDataWithSources(medication, source);
      setRiskData(data as RiskData);
    } catch (error) {
      console.error("Error fetching risk data: ", error);
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientEdit = () => {
    setIsEditing(true);
    setEnterNewPatient(true);
    handleClickSummary();
    console.log({ editingPatient: patientInfo });
  };

  const handlePatientPrint = (e: any) => {
    e.preventDefault();
    window.print();
  };

  const [isMobileDropDownOpen, setIsMobileDropDownOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleMobileDropDownMenu = () => {
    setIsMobileDropDownOpen(!isMobileDropDownOpen);
  };

  const MobileMenuItem = ({
    item,
    onClick,
  }: {
    item: string;
    onClick: (e: React.MouseEvent) => void;
  }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.(e);
      setIsMobileDropDownOpen(false);
    };
    return (
      <div
        className="flex pt-1 py-1 px-3 text-base font-semibold"
        onClick={handleClick}
      >
        {item}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileDropDownOpen(false);
      }
    };
    if (isMobileDropDownOpen) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, [isMobileDropDownOpen]);
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
              tier="first"
              medications={patientInfo.PossibleMedications.first ?? []}
              clickedMedication={clickedMedication}
              riskData={riskData}
              loading={loading}
              onSourcesClick={handleSourcesClick}
              onBenefitsRisksClick={handleBenefitsRisksClick}
              activePanel={activePanel}
            />
            <div className="mt-6">
              <MedicationTier
                title="Tier 2: Second-line Options"
                tier="second"
                medications={patientInfo.PossibleMedications.second ?? []}
                clickedMedication={clickedMedication}
                riskData={riskData}
                loading={loading}
                onSourcesClick={handleSourcesClick}
                onBenefitsRisksClick={handleBenefitsRisksClick}
                activePanel={activePanel}
              />
            </div>
            <div className="mt-6">
              <MedicationTier
                title="Tier 3: Third-line Options"
                tier="third"
                medications={patientInfo.PossibleMedications.third ?? []}
                clickedMedication={clickedMedication}
                riskData={riskData}
                loading={loading}
                onSourcesClick={handleSourcesClick}
                onBenefitsRisksClick={handleBenefitsRisksClick}
                activePanel={activePanel}
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
          <>
            <div className="justify-between lg:w-[860px]">
              {!showSummary && (
                <div
                  className="font_body rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8 lg:w-[860px] cursor-pointer"
                  onClick={handleClickSummary}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-600 cursor-pointer header_logo font-satoshi hover:text-blue-600">
                      Patient Summary
                    </h2>
                    <div className="items-center cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
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
                <div className="p-2 px-3 bg-white border rounded-md font_body ring-1 hover:ring-slate-300 md:p-4 md:px-8">
                  <div>
                    <div className="relative flex items-center justify-between text-xl">
                      <h2 className="font-bold text-gray-600 cursor-pointer header_logo font-satoshi hover:text-blue-600">
                        Summary
                      </h2>
                      {isMobileDropDownOpen ? (
                        <div className="flex justify-center items-center">
                          <div
                            ref={mobileMenuRef}
                            className="absolute z-10 py-1.5 flex bg-white flex-col
                                                    gap-2 border border-blue-300 -translate-x-[73px] translate-y-[84px]
                                                    shadow-md rounded-[3px] w-36 no-print"
                          >
                            <MobileMenuItem
                              item="Edit"
                              onClick={handlePatientEdit}
                            />
                            <MobileMenuItem
                              item="Print"
                              onClick={handlePatientPrint}
                            />
                            <MobileMenuItem
                              item="Report Issue"
                              onClick={(event) => {
                                if (patientInfo.ID) {
                                  handleOpenModal(patientInfo.ID, event);
                                }
                              }}
                            />
                          </div>
                          <div className="flex justify-center items-center gap-3">
                            <div
                              className="p-1.5 sm:hidden flex justify-center items-center h-7 w-7 bg-blue-100 rounded-[3px]"
                              onClick={handleMobileDropDownMenu}
                            >
                              <EllipsisVertical />
                            </div>
                            <div
                              className="sm:hidden text-2xl text-black bg-transparent -mt-[2px]"
                              onClick={handleClickSummary}
                            >
                              &times;
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-3">
                          <div
                            className="p-1.5 sm:hidden flex justify-center items-center h-7 w-7"
                            onClick={handleMobileDropDownMenu}
                          >
                            <EllipsisVertical />
                          </div>
                          <div
                            className="sm:hidden text-2xl text-black bg-transparent -mt-[2px]"
                            onClick={handleClickSummary}
                          >
                            &times;
                          </div>
                        </div>
                      )}
                      <aside className="hidden sm:flex gap-1.5">
                        <button
                          onClick={handlePatientPrint}
                          className="p-3 text-sm text-gray-800 rounded-md hover:bg-gray-100 no-print"
                        >
                          <div className=" flex items-center gap-x-1">
                            <FaPrint />
                            <span>Print</span>
                          </div>
                        </button>
                        <button
                          onClick={handlePatientEdit}
                          className="p-3 text-sm text-gray-800 rounded-md hover:bg-gray-100 no-print"
                        >
                          <div className=" flex items-center gap-x-1">
                            <FaPencilAlt />
                            <span>Edit</span>
                          </div>
                        </button>
                        <button
                          className="p-3 text-sm text-gray-800 rounded-md hover:text-red-500 hover:bg-gray-100 no-print"
                          onClick={(event) => {
                            if (patientInfo.ID) {
                              handleOpenModal(patientInfo.ID, event);
                            }
                          }}
                        >
                          <div className=" flex items-center gap-x-1">
                            <FaRegThumbsDown />
                            <span> Report Issue </span>
                          </div>
                        </button>
                        <button
                          onClick={handleClickSummary}
                          className="p-3 text-sm text-gray-800 rounded-md hover:bg-gray-100 no-print"
                        >
                          <div className=" flex items-center gap-x-1">
                            <FaMinus />
                            <span>Hide</span>
                          </div>
                        </button>
                      </aside>
                    </div>
                  </div>
                  <div className="mt-2 border-b border-gray-900/10">
                    <h3 className="text-base leading-7 text-gray-900">
                      <label className="font-semibold">Patient ID:</label>{" "}
                      {patientInfo.ID}
                    </h3>
                    <p className="max-w-2xl mt-1 text-sm leading-6 text-gray-500">
                      Patient details and application
                    </p>
                  </div>
                  <div className="mt-3">
                    <dl>
                      <div className="flex-row justify-between py-6 border-b border-gray-900/10 md:flex">
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
                        <dt className="flex mt-3 text-sm font-medium leading-6 text-gray-900">
                          Risk Assessment:
                        </dt>
                        <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                          <ul
                            role="list"
                            className="border border-gray-200 divide-y divide-gray-100 rounded-md"
                          >
                            {/* {patientInfo.Psychotic === "Yes" && (
                              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                Currently psychotic
                              </li>
                            )} */}
                            {patientInfo.Suicide === "Yes" && (
                              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                <Tooltip text="Lithium is the only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder, so it will be shown at the top of the suggested medications list.">
                                  Patient has a history of suicide attempts
                                  <span className="ml-1 material-symbols-outlined">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            )}
                            {patientInfo.Kidney === "Yes" && (
                              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                <Tooltip text="Lithium can affect kidney function, so it will not be included in the suggested medication list for patients with a risk or history of kidney disease.">
                                  Patient has a history or risk of kidney
                                  disease
                                  <span className="ml-1 material-symbols-outlined">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            )}
                            {patientInfo.Liver === "Yes" && (
                              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                <Tooltip text="Depakote is processed through the liver, so it will not be included in the suggested medication list for patients with a risk or history of liver disease.">
                                  Patient has a history or risk of liver disease
                                  <span className="ml-1 material-symbols-outlined">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            )}
                            {patientInfo.blood_pressure === "Yes" && (
                              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                <Tooltip text="Second-generation antipsychotics can cause low blood pressure upon standing, putting the patient at risk of passing out and hitting their head, so they will not be included in suggested medication list for patients with a risk or history of low blood pressure.">
                                  Patient has a history or risk of low blood
                                  pressure, or concern for falls
                                  <span className="ml-1 material-symbols-outlined">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            )}
                            {patientInfo.weight_gain === "Yes" && (
                              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                <Tooltip text="Seroquel, Risperdal, Abilify, and Zyprexa are known for causing weight gain, so they will not be included in the suggested medications list for patients with concerns about weight gain.">
                                  PatienthHas weight gain concerns
                                  <span className="ml-1 material-symbols-outlined">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            )}

                            {patientInfo.risk_pregnancy === "Yes" && (
                              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                <Tooltip text="Depakote is known for causing birth defects and will not be included in the suggested medications list for patients interested in becoming pregnant.">
                                  Patient wants to conceive in next 2 years
                                  <span className="ml-1 material-symbols-outlined">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            )}
                            {patientInfo.any_pregnancy === "Yes" && (
                              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                <Tooltip text="Depakote is known for causing birth defects and will not be included in the suggested medications list for patients interested in becoming pregnant.">
                                  Patient has a possibility of becoming pregnant
                                  <span className="ml-1 material-symbols-outlined">
                                    info
                                  </span>
                                </Tooltip>
                              </li>
                            )}
                          </ul>
                        </dd>
                      </div>
                      <div className="flex flex-col justify-between py-6 border-b border-gray-900/10 sm:px-0 md:flex-row">
                        <br />
                        <div className="flex w-full">
                          <label
                            htmlFor="current-state"
                            className="flex block w-1/3 text-sm font-medium leading-6 text-gray-900"
                          >
                            Prior medications
                            <Tooltip text="Any bipolar medications entered here will not appear in the list of suggested medications, as they have already been tried without success.">
                              <span className="ml-1 material-symbols-outlined">
                                info
                              </span>
                            </Tooltip>
                          </label>
                          <dt className="text-sm leading-6 text-gray-700">
                            {patientInfo.PriorMedications?.split(",").join(
                              ", "
                            )}
                          </dt>
                        </div>
                      </div>
                      {renderMedicationsSection()}
                    </dl>
                  </div>
                </div>
              )}
            </div>
            <Modal isOpen={isModalOpen.status} onClose={handleCloseModal}>
              <FeedbackForm id={isModalOpen.id} />
            </Modal>
          </>
        )}
      </div>
    </section>
  );
};

export default PatientSummary;
