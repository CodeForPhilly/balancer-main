import { useState } from "react";
import NewPatientForm from "./NewPatientForm.tsx";
import PatientHistory from "./PatientHistory.tsx";
import { useLazyGetMedicationInfoQuery } from "../../services/medicationsApi.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { copy, loader } from "../../assets/index.js";
import PatientSummary from "./PatientSummary.tsx";
import { PatientInfo } from "./PatientTypes.ts";

const PatientManager = () => {
  const [patientInfo, setPatientInfo] = useState({
    ID: "",
    Diagnosis: "",
    OtherDiagnosis: "",
    Description: "",
    Age: 18,
  });

  const [allPatientInfo, setAllPatientInfo] = useState<PatientInfo[]>([]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [getMedicationInfo, { error, isFetching }] =
    useLazyGetMedicationInfoQuery();

  // TODO: add error and loading state guards

  return (
    <div className="mt-16 w-full max-w-2xl">
      <h1 className="head_text">
        {/* AI-powered Bipolar Medication: <br className="max-md:hidden" /> */}
        <span className="orange_gradient">Balancer</span>
      </h1>
      <h2 className="desc">Designed to assist prescribers</h2>
      <h2 className="desc1">
        Balancer is an AI-powered tool for selecting bipolar medication for
        patients. We are open-source and available for free use.
      </h2>
      <div className="mt-16 flex flex-col w-full gap-2">
        <PatientSummary
          patientInfo={patientInfo}
          getMedicationInfo={getMedicationInfo}
          loader={loader}
        />
        <NewPatientForm
          patientInfo={patientInfo}
          setPatientInfo={setPatientInfo}
          allPatientInfo={allPatientInfo}
          setAllPatientInfo={setAllPatientInfo}
          getMedicationInfo={getMedicationInfo}
        />
        <PatientHistory
          allPatientInfo={allPatientInfo}
          setPatientInfo={setPatientInfo}
          copy={copy}
        />
      </div>
    </div>
  );
};

export default PatientManager;
