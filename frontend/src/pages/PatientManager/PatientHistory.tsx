import { PatientInfo } from "./PatientTypes";
import accountLogo from "../../assets/account.svg";

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
    <div className="mb-10 flex flex-col gap-2 p-3 md:p-0">
      <br />
      {allPatientInfo.length > 0 && (
        <h2 className="header_logo cursor-pointer font-satoshi text-xl font-bold text-gray-600  hover:text-blue-600 ">
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
          className="link_card "
        >
          <div className="copy_btn">
            <img src={accountLogo} alt="accountLogo_icon" className="h-3 w-3" />
          </div>
          <div className=" flex  w-1/3 flex-row justify-start  px-2">
            <dt className="mr-5 text-sm  font-medium leading-6 text-gray-900">
              ID:
            </dt>
            <dt className="text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {item.ID}
            </dt>
          </div>
          <div className="flex w-2/3  flex-row px-2  sm:px-0">
            <dt className="mr-5 hidden text-sm font-medium leading-6 text-gray-900 md:block">
              Current State:
            </dt>
            <dd className="text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {item.Diagnosis}
            </dd>
          </div>
          <div
            className="delete flex h-6 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-red-500"
            onClick={(event) => {
              if (item.ID) {
                handleDeletePatient(item.ID, event);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M15.293 4.293a1 1 0 011.414 1.414L11.414 12l5.293 5.293a1 1 0 01-1.414 1.414L10 13.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 12 3.293 6.707a1 1 0 111.414-1.414L10 10.586l5.293-5.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientHistory;
