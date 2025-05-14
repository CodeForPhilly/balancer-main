import {PatientInfo} from "./PatientTypes";
import {FaUser, FaTrash, FaBug} from "react-icons/fa";
import {useState} from "react";
import FeedbackForm from "../Feedback/FeedbackForm"
import Modal from "../../components/Modal/Modal";

export interface PatientHistoryProps {
    allPatientInfo: PatientInfo[];
    setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
    setAllPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo[]>>;
    copy: any;
    onPatientDeleted: (patientId: string) => void; // New prop
}

const PatientHistory = ({
                            allPatientInfo,
                            setPatientInfo,
                            setAllPatientInfo,

                            onPatientDeleted,
                        }: PatientHistoryProps) => {

    const [isModalOpen, setIsModalOpen] = useState({status: false, id: ''});

    const handleOpenModal = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setIsModalOpen({status: true, id: id});
    };

    const handleCloseModal = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsModalOpen({status: false, id: ''});
    };

    const handleDeletePatient = (
        patientIDToDelete: string,
        event: React.MouseEvent
    ) => {
        event.stopPropagation();

        const updatedPatientInfo = allPatientInfo.filter(
            (patient) => patient.ID !== patientIDToDelete
        );

        localStorage.setItem("patientInfos", JSON.stringify(updatedPatientInfo));
        setAllPatientInfo(updatedPatientInfo);

        onPatientDeleted(patientIDToDelete);
    };

    return (
        <>
            <section className="lg:flex lg:items-center lg:justify-center">
                <div className=" md:mx-0 md:p-0 ">
                    <br/>
                    {allPatientInfo.length > 0 && (
                        <h2 className="header_logo cursor-pointer font-satoshi text-xl font-bold text-gray-600  hover:text-blue-600 no-print">
                            List of Patients
                            {/* <span className="blue_gradient">Patients</span> */}
                        </h2>
                    )}
                    {allPatientInfo.reverse().map((item, index) => (
                        <div
                            key={`link-${index}`}
                            onClick={() => {
                                setPatientInfo(item);
                                window.scrollTo(0, 0); // This line makes the page scroll to the top
                            }}
                            className="font_body mb-3 flex justify-between cursor-pointer rounded-md border bg-white p-3 px-3 py-2.5 pl-5 ring-1 hover:ring-slate-300 md:p-2 md:px-6 lg:w-[860px] no-print items-center"
                        >
                            <div className="flex items-center gap-x-4 md:gap-x-0 -ml-1">
                                <div className="copy_btn">
                                    <FaUser/>
                                </div>
                                <div className="flex flex-col sm:ml-1 md:-ml-4">
                                    <div className="flex">
                                        <dt className="mr-2 sm:mr-4 text-sm font-extrabold leading-6 text-gray-900">
                                            ID:
                                        </dt>
                                        <dt className="text-sm leading-6 text-gray-700">
                                            {item.ID}
                                        </dt>
                                    </div>
                                    <div className="flex">
                                        <dt className="mr-2 sm:mr-4 text-sm font-extrabold leading-6 text-gray-900">
                                            Current State:
                                        </dt>
                                        <dd className="text-sm leading-6 text-gray-700">
                                            {item.Diagnosis}
                                        </dd>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-x-1 sm:gap-x-4 -mr-1 sm:mr-1 md:-mr-2">
                                <button
                                    className="delete py-1 text-sm font-bold rounded-md text-gray-600 hover:text-red-500 hover:bg-gray-100  no-print"
                                    onClick={(event) => {
                                        if (item.ID) {
                                            handleDeletePatient(item.ID, event);
                                        }
                                    }}>
                                    <div className="p-2 flex items-center gap-x-1">
                                        <FaTrash/>
                                        <span className="hidden sm:inline-block">Remove</span>
                                    </div>
                                </button>
                                <button
                                    className="py-1 text-sm font-bold rounded-md text-red-500 hover:text-red-500 hover:bg-gray-100  no-print"
                                    onClick={(event) => {
                                        if (item.ID) {
                                            handleOpenModal(item.ID, event);
                                        }
                                    }}
                                >
                                    <div className="p-2 flex items-center gap-x-1">
                                        <FaBug/>
                                        <span className="hidden sm:inline-block">Report Issue </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <Modal isOpen={isModalOpen.status} onClose={handleCloseModal}>
                <FeedbackForm id={isModalOpen.id}/>
            </Modal>
        </>
    );
};

export default PatientHistory;
