import { FormEvent, ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PatientInfo, Diagnosis } from "./PatientTypes";
import { useMedications } from "../ListMeds/useMedications";
import ChipsInput from "../../components/ChipsInput/ChipsInput";
import Tooltip from "../../components/Tooltip";
import { api } from "../../api/apiClient";
// import ErrorMessage from "../../components/ErrorMessage";

// create new interface for refactor and to work with backend
interface PatientInfoInterface {
  id?: string;
  state?: string;
  otherDiagnosis?: string;
  description?: string;
  depression?: boolean;
  hypomania?: boolean;
  mania?: boolean;
  currentMedications?: string;
  priorMedications?: string;
  possibleMedications?: {
    first?: string;
    second?: string;
    third?: string;
  };
  psychotic: boolean;
  suicideHistory: boolean;
  kidneyHistory: boolean;
  liverHistory: boolean;
  bloodPressureHistory: boolean;
  weightGainConcern: boolean;
  reproductive: boolean;
  riskPregnancy: boolean;
}

// TODO: refactor with Formik

export interface NewPatientFormProps {
  enterNewPatient: boolean;
  setEnterNewPatient: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  allPatientInfo: PatientInfo[];
  setAllPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo[]>>;
}

const NewPatientForm = ({
  isEditing,
  setIsEditing,
  setPatientInfo,
  allPatientInfo,
  setAllPatientInfo,
  patientInfo,
  enterNewPatient,
  setEnterNewPatient,
}: NewPatientFormProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const [errors, setErrors] = useState<string[]>([]);

  const nullPatient = {
    ID: "",
    Diagnosis: Diagnosis.Manic,
    OtherDiagnosis: "",
    Description: "",
    CurrentMedications: "",
    PriorMedications: "",
    Mania: "False",
    Depression: "False",
    Hypomania: "False",
    Psychotic: "No",
    Suicide: "No",
    Kidney: "No",
    Liver: "No",
    weight_gain: "No",
    blood_pressure: "No",
    Reproductive: "No",
    risk_pregnancy: "No",
    any_pregnancy: "No",
  };

  const defaultPatientInfo: PatientInfo = isEditing
    ? { ...patientInfo }
    : nullPatient;

  const [newPatientInfo, setNewPatientInfo] =
    useState<PatientInfo>(defaultPatientInfo);

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  useEffect(() => {
    const patientInfoFromLocalStorage = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      localStorage.getItem("patientInfos")
    );

    if (patientInfoFromLocalStorage) {
      setAllPatientInfo(patientInfoFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // send payload to backend using the new interface
    const payload: PatientInfoInterface = {
      id: newPatientInfo.ID,
      state: newPatientInfo.Diagnosis,
      otherDiagnosis: newPatientInfo.OtherDiagnosis,
      description: newPatientInfo.Description,
      depression: newPatientInfo.Depression == "True",
      hypomania: newPatientInfo.Hypomania == "True",
      mania: newPatientInfo.Hypomania == "True",
      currentMedications: newPatientInfo.CurrentMedications,
      priorMedications: newPatientInfo.PriorMedications,
      psychotic: newPatientInfo.Psychotic == "Yes",
      suicideHistory: newPatientInfo.Suicide == "Yes",
      kidneyHistory: newPatientInfo.Kidney == "Yes",
      liverHistory: newPatientInfo.Liver == "Yes",
      bloodPressureHistory: newPatientInfo.blood_pressure == "Yes",
      weightGainConcern: newPatientInfo.weight_gain == "Yes",
      reproductive: newPatientInfo.Reproductive == "Yes",
      riskPregnancy: newPatientInfo.risk_pregnancy == "Yes",
    };

    setIsLoading(true); // Start loading

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseUrl}/v1/api/get_med_recommend`;

      const { data } = await api.post(url, payload);

      const categorizedMedications = {
        first: data.first ?? [],
        second: data.second ?? [],
        third: data.third ?? [],
      };

      let patientID = newPatientInfo.ID;

      // Ensure ID is never blank
      if (!patientID) {
        const generatedGuid = uuidv4();
        patientID = generatedGuid.substring(0, 5);
      }

      const updatedPatientInfo = {
        ...newPatientInfo,
        ID: patientID, // Assign or preserve ID
        PossibleMedications: categorizedMedications,
      };

      let updatedAllPatientInfo = [...allPatientInfo];

      // Check if patient exists and update, otherwise add as new
      const existingPatientIndex = updatedAllPatientInfo.findIndex(
        (patient) => patient.ID === patientID
      );

      if (existingPatientIndex !== -1) {
        updatedAllPatientInfo[existingPatientIndex] = updatedPatientInfo;
      } else {
        updatedAllPatientInfo = [updatedPatientInfo, ...allPatientInfo];
      }

      // Update state and localStorage
      setPatientInfo(updatedPatientInfo);
      setAllPatientInfo(updatedAllPatientInfo);
      localStorage.setItem(
        "patientInfos",
        JSON.stringify(updatedAllPatientInfo)
      );
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setIsEditing(false);
      setEnterNewPatient(false);
      setIsLoading(false);
      handleClickNewPatient();
      window.scrollTo({ top: 0 });
    }
  };

  const handleDiagnosisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as keyof typeof Diagnosis;

    setNewPatientInfo({
      ...newPatientInfo,
      Diagnosis: Diagnosis[selectedValue],
      OtherDiagnosis: "", // Reset the OtherDiagnosis value
    });
  };

  const handleClickSummary = () => {
    setNewPatientInfo((prevPatientInfo) => ({
      ...prevPatientInfo,
      ID: "",
      Diagnosis: Diagnosis.Manic,
      OtherDiagnosis: "",
      Description: "",
      CurrentMedications: "",
      PriorMedications: "",
      Mania: "False",
      Depression: "False",
      Hypomania: "False",
      Psychotic: "No",
      Suicide: "No",
      Kidney: "No",
      Liver: "No",
      weight_gain: "No",
      blood_pressure: "No",
      Reproductive: "No",
      risk_pregnancy: "No",
    }));

    setEnterNewPatient(!enterNewPatient);
    setIsEditing(false);
  };

  const handleClickNewPatient = () => {
    setNewPatientInfo((prevPatientInfo) => ({
      ...prevPatientInfo,
      ID: "",
      Diagnosis: Diagnosis.Manic,
      OtherDiagnosis: "",
      Description: "",
      CurrentMedications: "",
      PriorMedications: "",
      Mania: "False",
      Depression: "False",
      Hypomania: "False",
      Psychotic: "No",
      Suicide: "No",
      Kidney: "No",
      Liver: "No",
      weight_gain: "No",
      blood_pressure: "No",
      Reproductive: "No",
      risk_pregnancy: "No",
    }));
  };

  // const handleCheckboxChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   checkboxName: string
  // ) => {
  //   const isChecked = e.target.checked;
  //   setNewPatientInfo((prevInfo) => ({
  //     ...prevInfo,
  //     [checkboxName]: isChecked ? "True" : "False", // Update for both checked and unchecked
  //   }));
  // };

  const handleRadioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    radioName: string
  ) => {
    const selectedValue = e.target.value;
    setNewPatientInfo((prevInfo) => ({
      ...prevInfo,
      [radioName]: selectedValue,
    }));
  };

  useEffect(() => {
    if (isEditing) {
      setNewPatientInfo(patientInfo);
    }
  }, [isEditing, patientInfo]);

  const { medications } = useMedications();

  return (
    <section className="lg:flex lg:items-center lg:justify-center">
      {/* {search} */}
      <div className=" md:mx-0 md:p-0">
        <br />
        {!enterNewPatient && (
          <div className="font_body rounded-md  border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8 lg:w-[860px] no-print">
            <div
              className="flex items-center justify-between"
              onClick={handleClickSummary}
            >
              <h2 className="text-xl font-bold text-gray-600 cursor-pointer header_logo font-satoshi hover:text-blue-600 ">
                Click To Enter New Patient
              </h2>

              <div
                onClick={handleClickSummary}
                className="items-center cursor-pointer "
              >
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
        {enterNewPatient && (
          <div className="p-2 px-3 bg-white border rounded-md font_body ring-1 hover:ring-slate-300 md:p-4 md:px-8">
            <div className="flex items-center justify-between">
              <div
                onClick={handleClickSummary}
                className="items-center cursor-pointer "
              >
                <h2 className="text-xl font-bold text-gray-600 cursor-pointer header_logo font-satoshi hover:text-blue-600 ">
                  {isEditing
                    ? `Edit Patient ${patientInfo.ID} Details`
                    : "Enter Patient Details"}
                  {/* <span className="blue_gradient">Details</span> */}
                </h2>
              </div>
              <button
                className="text-2xl text-black bg-transparent rounded hover:text-gray-600 focus:border-none focus:outline-none"
                aria-label="Close"
                onClick={handleClickSummary}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-2 ">
              {/* <ErrorMessage errors={errors} /> */}
              <div className="flex flex-row justify-between py-6 border-b border-gray-900/10 md:items-center ">
                <div className="mr-5 md:mr-0 md:w-[300px]">
                  <label
                    htmlFor="current-state"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Current state
                  </label>
                </div>
                <div className="mr-6 md:mr-0 md:w-[500px] md:pl-16">
                  <select
                    value={newPatientInfo.Diagnosis}
                    onChange={handleDiagnosisChange}
                    required
                    autoComplete="current-state"
                    className={isLoading ? " url_input_loading" : "dropdown"}
                  >
                    {Object.values(Diagnosis).map((diagnosis) => (
                      <option key={diagnosis} value={diagnosis}>
                        {diagnosis}
                      </option>
                    ))}
                    {/* <option value="Mixed">Mixed</option> */}
                  </select>
                </div>
                {/* {errorMessage && (
                  <div className="text-red-500">{errorMessage}</div>
                )} */}
              </div>

              {/* <div className="flex justify-between px-0 py-6 border-b border-gray-900/10 md:grid md:grid-cols-3 md:gap-4">
                <div>
                  <legend className="text-sm font-semibold leading-6 text-gray-900">
                    Bipolar history
                  </legend>
                </div>
                <div className="pr-10 md:pl-24 md:pr-0">
                  <div className="flex  gap-x-3">
                    <div className="flex items-center h-6 ">
                      <input
                        id="Mania"
                        name="Mania"
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                        onChange={(e) => handleCheckboxChange(e, "Mania")}
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label
                        htmlFor="Mania"
                        className="font-medium text-gray-900"
                      >
                        Mania
                      </label>
                    </div>
                  </div>
                  <div className="flex  gap-x-3">
                    <div className="flex items-center h-6">
                      <input
                        id="Depression"
                        name="Depression"
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                        onChange={(e) => handleCheckboxChange(e, "Depression")}
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label
                        htmlFor="Depression"
                        className="font-medium text-gray-900"
                      >
                        Depression
                      </label>
                    </div>
                  </div>
                  <div className="flex  gap-x-3">
                    <div className="flex items-center h-6">
                      <input
                        id="Hypomania"
                        name="Hypomania"
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                        onChange={(e) => handleCheckboxChange(e, "Hypomania")}
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label
                        htmlFor="Hypomania"
                        className="font-medium text-gray-900"
                      >
                        Hypomania
                      </label>
                    </div>
                  </div>
                  <div className="flex  gap-x-3">
                    <div className="flex items-center h-6">
                      <input
                        id="Mixed"
                        name="Mixed"
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                        onChange={(e) => handleCheckboxChange(e, "Mixed")}
                      />
                    </div>
                    <div className="text-sm leading-6">
                      <label
                        htmlFor="Mixed"
                        className="font-medium text-gray-900"
                      >
                        Mixed
                      </label>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="py-6 border-b border-gray-900/10 ">
                <p className="text-sm leading-6 text-gray-600 ">
                  Select patient characteristics
                </p>
                <fieldset className="justify-between mt-6 md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900 ">
                    Currently psychotic
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center pr-16 gap-x-3">
                      <input
                        id="psychotic"
                        name="psychotic"
                        type="radio"
                        value="Yes"
                        checked={newPatientInfo.Psychotic === "Yes"}
                        onChange={(e) => handleRadioChange(e, "Psychotic")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="push-everything"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Yes
                      </label>

                      <input
                        id="psychotic"
                        name="psychotic"
                        type="radio"
                        value="No"
                        checked={newPatientInfo.Psychotic === "No"}
                        onChange={(e) => handleRadioChange(e, "Psychotic")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="push-email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        No
                      </label>
                    </div>
                  </dd>
                </fieldset>
                <fieldset className="justify-between mt-6 md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    History of suicide attempt(s)
                    <Tooltip text="Lithium is the only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder, so it will be shown at the top of the suggested medications list.">
                      <span className="ml-1 material-symbols-outlined">
                        info
                      </span>
                    </Tooltip>
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center pr-16 gap-x-3">
                      <input
                        id="suicide"
                        name="suicide"
                        type="radio"
                        checked={newPatientInfo.Suicide === "Yes"}
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "Suicide")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="push-everything"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Yes
                      </label>

                      <input
                        id="suicide"
                        name="suicide"
                        type="radio"
                        checked={newPatientInfo.Suicide === "No"}
                        onChange={(e) => handleRadioChange(e, "Suicide")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="push-email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        No
                      </label>
                    </div>
                  </dd>
                </fieldset>
                <fieldset className="justify-between mt-6 md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    History or risk of kidney disease
                    <Tooltip text="Lithium can affect kidney function, so it will not be included in the suggested medication list for patients with a risk or history of kidney disease.">
                      <span className="ml-1 material-symbols-outlined">
                        info
                      </span>
                    </Tooltip>
                  </dt>
                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center pr-16 gap-x-3">
                      <input
                        id="Kidney"
                        name="Kidney"
                        type="radio"
                        value="Yes"
                        checked={newPatientInfo.Kidney === "Yes"}
                        onChange={(e) => handleRadioChange(e, "Kidney")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="push-everything"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Yes
                      </label>

                      <input
                        id="Kidney"
                        name="Kidney"
                        type="radio"
                        value="No"
                        checked={newPatientInfo.Kidney === "No"}
                        onChange={(e) => handleRadioChange(e, "Kidney")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="push-email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        No
                      </label>
                    </div>
                  </dd>
                </fieldset>
                <fieldset className="justify-between mt-6 md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    History or risk of liver disease
                    <Tooltip text="Depakote is processed through the liver, so it will not be included in the suggested medication list for patients with a risk or history of liver disease.">
                      <span className="ml-1 material-symbols-outlined">
                        info
                      </span>
                    </Tooltip>
                  </dt>
                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center pr-16 gap-x-3">
                      <input
                        id="Liver"
                        name="Liver"
                        type="radio"
                        value="Yes"
                        checked={newPatientInfo.Liver === "Yes"}
                        onChange={(e) => handleRadioChange(e, "Liver")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="push-everything"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Yes
                      </label>

                      <input
                        id="Liver"
                        name="Liver"
                        type="radio"
                        value="No"
                        checked={newPatientInfo.Liver === "No"}
                        onChange={(e) => handleRadioChange(e, "Liver")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="push-email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        No
                      </label>
                    </div>
                  </dd>
                </fieldset>

                <fieldset className="justify-between mt-6 md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    <Tooltip text="Second-generation antipsychotics can cause low blood pressure upon standing, putting the patient at risk of passing out and hitting their head, so they will not be included in suggested medication list for patients with a risk or history of low blood pressure.">
                      History or risk of low blood pressure, or concern for
                      falls
                      <span className="ml-1 material-symbols-outlined">
                        info
                      </span>
                    </Tooltip>
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center pr-16 gap-x-3">
                      <input
                        id="blood_pressure"
                        name="blood_pressure"
                        type="radio"
                        value="Yes"
                        checked={newPatientInfo.blood_pressure === "Yes"}
                        onChange={(e) => handleRadioChange(e, "blood_pressure")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="blood_pressure"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Yes
                      </label>

                      <input
                        id="blood_pressure"
                        name="blood_pressure"
                        type="radio"
                        value="No"
                        checked={newPatientInfo.blood_pressure === "No"}
                        onChange={(e) => handleRadioChange(e, "blood_pressure")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="blood_pressure"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        No
                      </label>
                    </div>
                  </dd>
                </fieldset>
                <fieldset className="justify-between mt-6 md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    Has weight gain concerns
                    <Tooltip text="Seroquel, Risperdal, Abilify, and Zyprexa are known for causing weight gain, so they will not be included in the suggested medications list for patients with concerns about weight gain.">
                      <span className="ml-1 material-symbols-outlined">
                        info
                      </span>
                    </Tooltip>
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center pr-16 gap-x-3">
                      <input
                        id="weight_gain"
                        name="weight_gain"
                        type="radio"
                        checked={newPatientInfo.weight_gain === "Yes"}
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "weight_gain")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="weight_gain"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Yes
                      </label>

                      <input
                        id="weight_gain"
                        name="weight_gain"
                        type="radio"
                        value="No"
                        checked={newPatientInfo.weight_gain === "No"}
                        onChange={(e) => handleRadioChange(e, "weight_gain")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="weight_gain"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        No
                      </label>
                    </div>
                  </dd>
                </fieldset>
                <fieldset className="justify-between mt-6 md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    Wants to conceive in next 2 years
                    <Tooltip text="Depakote is known for causing birth defects and will not be included in the suggested medications list for patients interested in becoming pregnant.">
                      <span className="ml-1 material-symbols-outlined">
                        info
                      </span>
                    </Tooltip>
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center pr-16 gap-x-3">
                      <input
                        id="risk_pregnancy-yes"
                        name="risk_pregnancy"
                        type="radio"
                        value="Yes"
                        checked={newPatientInfo.risk_pregnancy === "Yes"}
                        onChange={(e) => handleRadioChange(e, "risk_pregnancy")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="risk_pregnancy-yes"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Yes
                      </label>

                      <input
                        id="risk_pregnancy-no"
                        name="risk_pregnancy"
                        type="radio"
                        value="No"
                        checked={newPatientInfo.risk_pregnancy === "No"}
                        onChange={(e) => handleRadioChange(e, "risk_pregnancy")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="risk_pregnancy-no"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        No
                      </label>
                    </div>
                  </dd>
                </fieldset>
                <fieldset className="justify-between mt-6 md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    Any possibility of becoming pregnant
                    <Tooltip text="Depakote is known for causing birth defects and will not be included in the suggested medications list for patients interested in becoming pregnant.">
                      <span className="ml-1 material-symbols-outlined">
                        info
                      </span>
                    </Tooltip>
                  </dt>
                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center pr-16 gap-x-3">
                      <input
                        id="any_pregnancy-yes"
                        name="any_pregnancy"
                        type="radio"
                        value="Yes"
                        checked={newPatientInfo.any_pregnancy === "Yes"}
                        onChange={(e) => handleRadioChange(e, "any_pregnancy")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="any_pregnancy-yes"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Yes
                      </label>
                      <input
                        id="any_pregnancy-no"
                        name="any_pregnancy"
                        type="radio"
                        checked={newPatientInfo.any_pregnancy === "No"}
                        value="No"
                        onChange={(e) => handleRadioChange(e, "any_pregnancy")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="any_pregnancy-no"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        No
                      </label>
                    </div>
                  </dd>
                </fieldset>
              </div>

              {/* <div className="items-center mt-5 md:flex">
                <div className="w-[300px]">
                  <label
                    htmlFor="current-state"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Current medications
                  </label>
                </div>
                <div className="md:w-[500px]  md:pl-16">
                  <input
                    id="currentMedications"
                    type="ani_input"
                    value={newPatientInfo.CurrentMedications}
                    onChange={(e) =>
                      setNewPatientInfo({
                        ...newPatientInfo,
                        CurrentMedications: String(e.target.value),
                      })
                    }
                    placeholder="Separate medications with commas"
                    className={
                      isLoading
                        ? "input_loading peer w-1/2"
                        : "input  mt-2 w-full"
                    }
                  />
                </div>
              </div> */}
              <div className="md:flex md:justify-between md:px-4 md:py-6">
                <div className="w-[300px]">
                  <label
                    htmlFor="current-state"
                    className="flex block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Prior medications to exclude
                    <Tooltip text="Any bipolar medications entered here will not appear in the list of suggested medications, as they have already been tried without success.">
                      <span className="ml-1 material-symbols-outlined">
                        info
                      </span>
                    </Tooltip>
                  </label>
                </div>
                <div className="md:w-2/3">
                  <ChipsInput
                    suggestions={medications.map((med) => med.name)}
                    value={
                      (newPatientInfo.PriorMedications &&
                        newPatientInfo.PriorMedications?.split(",")) ||
                      []
                    }
                    placeholder=""
                    label=""
                    onChange={(chips) =>
                      setNewPatientInfo({
                        ...newPatientInfo,
                        PriorMedications: chips.join(","),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end mt-7">
                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    className="mr-5 btnGray"
                    onClick={handleClickNewPatient}
                  >
                    Clear Form
                  </button>
                </div>
                <button
                  type="submit"
                  className={`btnBlue  ${
                    isPressed &&
                    "transition-transform focus:outline-none focus:ring focus:ring-blue-200"
                  }${
                    isLoading
                      ? "bg-white-600 transition-transform focus:outline-none focus:ring focus:ring-blue-500"
                      : ""
                  }`}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  disabled={isLoading} // Disable the button while loading
                >
                  {isLoading ? ( // Render loading icon if loading
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 mr-2 bg-white rounded-full animate-ping"></div>
                      <p>Loading...</p>
                    </div>
                  ) : (
                    <p>{isEditing ? "Edit" : "Submit"}</p>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        <br />
      </div>
    </section>
  );
};

export default NewPatientForm;
