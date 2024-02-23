import { useState } from "react";
import NewPatientForm from "./NewPatientForm.tsx";
import PatientHistory from "./PatientHistory.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PatientSummary from "./PatientSummary.tsx";
import { PatientInfo } from "./PatientTypes.ts";
import { copy } from "../../assets/index.js";
import Welcome from "../../components/Welcome/Welcome.tsx";

const PatientManager = () => {
  const [isPatientDeleted, setIsPatientDeleted] = useState<boolean>(false);

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    ID: "",
    Diagnosis: "",
    OtherDiagnosis: "",
    Description: "",
    CurrentMedications: "",
    PriorMedications: "",
    Depression: "",
    Hypomania: "",
    Mania: "",
    Psychotic: "",
    Suicide: "",
    Kidney: "",
    Liver: "",
    blood_pressure: "",
    weight_gain: "",
    Reproductive: "",
    risk_pregnancy: "",
    PossibleMedications: {
      first: "",
      second: "",
      third: "",
    },
  });

  const handlePatientDeleted = (deletedId: string) => {
    if (patientInfo.ID === deletedId) {
      setPatientInfo({
        ID: "",
        Diagnosis: "",
        OtherDiagnosis: "",
        Description: "",
        CurrentMedications: "",
        PriorMedications: "",
        Depression: "",
        Hypomania: "",
        Mania: "",
        Psychotic: "",
        Suicide: "",
        Kidney: "",
        Liver: "",
        blood_pressure: "",
        weight_gain: "",
        Reproductive: "",
        risk_pregnancy: "",
      });

      setIsPatientDeleted(true);
    }
  };

  const [allPatientInfo, setAllPatientInfo] = useState<PatientInfo[]>([]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore

  // TODO: add error and loading state guards

  return (
    <div className="mt-24 flex w-full max-w-6xl flex-col items-center  md:mt-28">
      <Welcome
        subHeader="Designed to assist prescribers"
        descriptionText="Balancer is a free and open-source tool for helping prescribers narrow
        down suitable bipolar medications based on patient characteristics."
      />
      <div className="mt-0 flex w-[90%] flex-col md:mt-12 md:w-[75%] ">
        <PatientSummary
          patientInfo={patientInfo}
          isPatientDeleted={isPatientDeleted}
          setPatientInfo={setPatientInfo}
        />
        <NewPatientForm
          patientInfo={patientInfo}
          setPatientInfo={setPatientInfo}
          allPatientInfo={allPatientInfo}
          setAllPatientInfo={setAllPatientInfo}
        />
        <PatientHistory
          allPatientInfo={allPatientInfo}
          setAllPatientInfo={setAllPatientInfo}
          setPatientInfo={setPatientInfo}
          copy={copy}
          onPatientDeleted={handlePatientDeleted}
        />
      </div>
    </div>
  );
};

export default PatientManager;
