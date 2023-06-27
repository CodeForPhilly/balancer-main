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
    <div className="mt-16 w-full max-w-xl">
      <div className="flex flex-col w-full gap-2">
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
