import { PatientInfo } from "./PatientTypes";
import { FaUser, FaTrash, FaBug } from "react-icons/fa";
import { useState } from "react";
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
          <br />
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
              className="font_body mb-3 flex cursor-pointer rounded-md border bg-white p-3 px-3 py-2.5 pl-5 ring-1 hover:ring-slate-300 md:p-4 md:px-8 lg:w-[860px] no-print"
            >
              <div className="copy_btn">
                <FaUser />
              </div>
              <div className=" flex  w-1/3 flex-row justify-start  px-2">
                <dt className="mr-5 text-sm  font-medium leading-6 text-gray-900">
                  ID:
                </dt>
                <dt className="text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {item.ID}
                </dt>
              </div>
              <div className="flex w-1/3  flex-row px-2  sm:px-0">
                <dt className="mr-5 hidden text-sm font-medium leading-6 text-gray-900 md:block">
                  Current State:
                </dt>
                <dd className="text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {item.Diagnosis}
                </dd>
              </div>
              <div className="flex w-1/3 flex-row justify-end space-x-2">
                <button
                    className="delete text-sm border p-2 rounded-lg text-gray-600 hover:text-red-500 hover:bg-gray-100 hover:border-red-500 no-print"
                    onClick={(event) => {
                      if (item.ID) {
                        handleDeletePatient(item.ID, event);
                      }
                    }}>
                  <FaTrash className="inline-block align-text-bottom" /> Remove
                </button>
                <button
                    className="text-sm border p-2 rounded-lg text-red-500 hover:text-red-500 hover:bg-gray-100 hover:border-red-500 no-print"
                    onClick={(event) => {
                      if (item.ID) {
                        handleOpenModal(item.ID, event);
                      }
                    }}
                  >
                    <FaBug className="inline-block align-text-bottom" /> Report Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Modal isOpen={isModalOpen.status} onClose={handleCloseModal} >
        <FeedbackForm id={isModalOpen.id} />
      </Modal>
    </>
  );
};

export default PatientHistory;
