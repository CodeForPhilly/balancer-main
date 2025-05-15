import {useState, useEffect} from "react";
import axios from "axios";
import {PatientInfo} from "./PatientTypes";
import Tooltip from "../../components/Tooltip";
import TypingAnimation from "../../components/Header/components/TypingAnimation.tsx";
import {FaPencilAlt, FaPrint, FaMinus, FaRegThumbsDown} from "react-icons/fa";
import FeedbackForm from "../Feedback/FeedbackForm";
import Modal from "../../components/Modal/Modal";

interface PatientSummaryProps {
    showSummary: boolean;
    setShowSummary: (state: boolean) => void;
    setEnterNewPatient: (isEnteringNewPatient: boolean) => void;
    setIsEditing: (isEditing: boolean) => void;
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
            <li
                className={`flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 hover:bg-indigo-100
          ${isClicked ? "bg-indigo-100" : ""} cursor-pointer`}
                onClick={onClick}
            >
                <div className="flex items-center flex-1 w-0">
                    <div className="flex flex-1 min-w-0 gap-2 ml-4">
                        <span className="font-medium truncate">{medication}</span>
                        {loading && isClicked && (
                            <div className="flex items-start max-w-sm mt-0 ml-3 text-white">
                                <TypingAnimation/>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 ml-4">
          <span className="font-medium text-indigo-600 hover:text-indigo-500">
            Benefits and risks
          </span>
                </div>
            </li>

            {isClicked && riskData && (
                <div className="px-6 py-4 bg-gray-50">
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
        <dt className="flex ml-2 text-sm font-medium leading-6 text-gray-900">
            {title}:
        </dt>
        <ul className="border border-gray-200 divide-y divide-gray-100 rounded-md">
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

    const [isModalOpen, setIsModalOpen] = useState({status: false, id: ""});

    const handleOpenModal = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setIsModalOpen({status: true, id: id});
    };

    const handleCloseModal = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsModalOpen({status: false, id: ""});
    };

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

    const handlePatientEdit = () => {
        setIsEditing(true);
        setEnterNewPatient(true);
        handleClickSummary();
        console.log({editingPatient: patientInfo});
    };

    const handlePatientPrint = (e: any) => {
        e.preventDefault();
        window.print();
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
                <br/>
                {patientInfo.ID && (
                    <>
                        <div className="justify-between lg:w-[860px]">
                            {!showSummary && (
                                <div className="font_body rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8 lg:w-[860px]">
                                    <div
                                        onClick={handleClickSummary}
                                        className="flex items-center justify-between"
                                    >
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
                                        <div className="flex items-center justify-between text-xl">
                                            <h2 className="font-bold text-gray-600 cursor-pointer header_logo font-satoshi hover:text-blue-600">
                                                Summary
                                            </h2>
                                            <aside className="flex w-1/3 flex-row justify-end gap-1.5 sm:w-auto">
                                                <button
                                                    onClick={handlePatientPrint}
                                                    className="p-3 text-sm text-gray-800 rounded-md hover:bg-gray-100 no-print">

                                                    <div className=" flex items-center gap-x-1">
                                                        <FaPrint/>
                                                        <span>Print</span>
                                                    </div>

                                                </button>
                                                <button
                                                    onClick={handlePatientEdit}
                                                    className="p-3 text-sm text-gray-800 rounded-md hover:bg-gray-100 no-print"
                                                >
                                                    <div className=" flex items-center gap-x-1">
                                                        <FaPencilAlt/>
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
                                                        <FaRegThumbsDown/>
                                                        <span> Report Issue </span>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={handleClickSummary}
                                                    className="p-3 text-sm text-gray-800 rounded-md hover:bg-gray-100 no-print">
                                                    <div className=" flex items-center gap-x-1">
                                                        <FaMinus/>
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
                                                        {/* Risk Assessment Items */}
                                                        {patientInfo.Psychotic === "Yes" && (
                                                            <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-4 border-b border-gray-900/10 hover:bg-indigo-100">
                                                                Currently psychotic
                                                            </li>
                                                        )}
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
                                                        {/* Add other risk assessment items similarly */}
                                                    </ul>
                                                </dd>
                                            </div>
                                            <div className="flex flex-col justify-between py-6 border-b border-gray-900/10 sm:px-0 md:flex-row">
                                                <br/>
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
                            <FeedbackForm id={isModalOpen.id}/>
                        </Modal>
                    </>
                )}
            </div>
        </section>
    );
};

export default PatientSummary;
