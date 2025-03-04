import { useState } from "react";
import { Link } from "react-router-dom";
import NewPatientForm from "./NewPatientForm.tsx";
import PatientHistory from "./PatientHistory.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PatientSummary from "./PatientSummary.tsx";
import { Diagnosis, PatientInfo } from "./PatientTypes.ts";
import { copy } from "../../assets/index.js";
import Welcome from "../../components/Welcome/Welcome.tsx";

const PatientManager = () => {
  const [isPatientDeleted, setIsPatientDeleted] = useState<boolean>(false);

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    ID: "",
    Diagnosis: Diagnosis.Manic,
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
    any_pregnancy: ""
  });

  const handlePatientDeleted = (deletedId: string) => {
    if (patientInfo.ID === deletedId) {
      setPatientInfo({
        ID: "",
        Diagnosis: Diagnosis.Manic,
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
        any_pregnancy: ""
      });

      setIsPatientDeleted(true);
    }
  };

  const [allPatientInfo, setAllPatientInfo] = useState<PatientInfo[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [enterNewPatient, setEnterNewPatient] = useState(true);
  const [showSummary, setShowSummary] = useState(true);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore

  // TODO: add error and loading state guards

  const descriptionEl = (
    <div className="md:mt-10">
      Use our tool to get medication suggestions for bipolar disorder based on
      patient characteristics.{" "}
      <Link
        to="/data-sources"
        className="mr-5 underline hover:border-blue-600 hover:text-blue-600 hover:no-underline"
      >
        Read about where we get our data.
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mt-24 md:mt-28">
      <Welcome
        subHeader="Designed to assist prescribers"
        descriptionEl={descriptionEl}
      />
      <div className="mt-0 flex w-[90%] flex-col md:mt-4 md:w-[75%] ">
        <PatientSummary
          showSummary={showSummary}
          setShowSummary={setShowSummary}
          setEnterNewPatient={setEnterNewPatient}
          setIsEditing={setIsEditing}
          patientInfo={patientInfo}
          isPatientDeleted={isPatientDeleted}
          setPatientInfo={setPatientInfo}
        />
        <NewPatientForm
          enterNewPatient={enterNewPatient}
          setEnterNewPatient={setEnterNewPatient}
          setIsEditing={setIsEditing}
          isEditing={isEditing}
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
