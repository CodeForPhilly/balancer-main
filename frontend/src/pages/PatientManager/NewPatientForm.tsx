import { FormEvent, ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PatientInfo, Diagnosis } from "./PatientTypes";
import Tooltip from "../../components/Tooltip";
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
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  allPatientInfo: PatientInfo[];
  setAllPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo[]>>;
}

const NewPatientForm = ({
  setPatientInfo,
  allPatientInfo,
  setAllPatientInfo,
}: NewPatientFormProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const [errors, setErrors] = useState<string[]>([]);

  const [newPatientInfo, setNewPatientInfo] = useState<PatientInfo>({
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
  });

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };
  const [enterNewPatient, setEnterNewPatient] = useState(true);

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
    console.log(newPatientInfo);

    setIsLoading(true); // Start loading

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseUrl}`;
      console.log(payload);

      const { data } = await axios.post(url + `/chatgpt/list_meds`, payload);

      const categorizedMedications = {
        first: data.first ?? [],
        second: data.second ?? [],
        third: data.third ?? [],
      };

      // console.log(categorizedMedications.first);
      // console.log(categorizedMedications.second);

      setPatientInfo((prev) => ({
        ...prev,
        PossibleMedications: categorizedMedications,
      }));

      const generatedGuid = uuidv4();
      const firstFiveCharacters = generatedGuid.substring(0, 5);

      setPatientInfo({ ...newPatientInfo, ID: firstFiveCharacters });

      if (data) {
        const newDescription = {
          ...newPatientInfo,
          ID: firstFiveCharacters,
          PossibleMedications: categorizedMedications,
        };

        const updatedAllPatientInfo = [newDescription, ...allPatientInfo];
        setPatientInfo(newDescription);
        setAllPatientInfo(updatedAllPatientInfo);

        localStorage.setItem(
          "patientInfos",
          JSON.stringify(updatedAllPatientInfo)
        );
      } else {
        console.log("No description came back");
      }
    } catch (error) {
      console.log("Error5 occurred:", error);
    } finally {
      setEnterNewPatient(false);
      setIsLoading(false); // Stop loading
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

  return (
    <section className="lg:flex lg:items-center lg:justify-center">
      {/* {search} */}
      <div className=" md:mx-0 md:p-0">
        <br />
        {!enterNewPatient && (
          <div className="font_body rounded-md  border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8 lg:w-[860px]">
            <div
              className="flex items-center justify-between"
              onClick={handleClickSummary}
            >
              <h2 className="header_logo cursor-pointer font-satoshi text-xl font-bold text-gray-600  hover:text-blue-600  ">
                Click To Enter New Patient
              </h2>

              <div
                onClick={handleClickSummary}
                className=" cursor-pointer items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
          <div className="font_body rounded-md  border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:p-4 md:px-8">
            <div className="flex items-center justify-between">
              <div
                onClick={handleClickSummary}
                className=" cursor-pointer items-center"
              >
                <h2 className="header_logo cursor-pointer font-satoshi text-xl font-bold text-gray-600  hover:text-blue-600 ">
                  Enter Patient Details
                  {/* <span className="blue_gradient">Details</span> */}
                </h2>
              </div>
              <button
                className="rounded bg-transparent text-2xl text-black hover:text-gray-600 focus:border-none focus:outline-none"
                aria-label="Close"
                onClick={handleClickSummary}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-2 ">
              {/* <ErrorMessage errors={errors} /> */}
              <div className="flex flex-row justify-between border-b border-gray-900/10 py-6 md:items-center  ">
                <div className="mr-5 md:mr-0 md:w-[300px]">
                  <label
                    htmlFor="current-state"
                    className="block text-sm font-semibold leading-6  text-gray-900"
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

              {/* <div className="flex justify-between border-b border-gray-900/10 px-0  py-6 md:grid md:grid-cols-3 md:gap-4">
                <div>
                  <legend className="text-sm font-semibold leading-6 text-gray-900">
                    Bipolar history
                  </legend>
                </div>
                <div className="pr-10 md:pl-24 md:pr-0">
                  <div className=" flex gap-x-3">
                    <div className="flex h-6 items-center ">
                      <input
                        id="Mania"
                        name="Mania"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                  <div className=" flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="Depression"
                        name="Depression"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                  <div className=" flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="Hypomania"
                        name="Hypomania"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                  <div className=" flex gap-x-3">
                    <div className="flex h-6 items-center">
                      <input
                        id="Mixed"
                        name="Mixed"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
              <div className="border-b border-gray-900/10 py-6 ">
                <p className=" text-sm leading-6 text-gray-600">
                  Select patient characteristics
                </p>
                <fieldset className="mt-6 justify-between md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className=" flex text-sm font-semibold leading-6 text-gray-900">
                    Currently psychotic
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center gap-x-3 pr-16">
                      <input
                        id="psychotic"
                        name="psychotic"
                        type="radio"
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "Psychotic")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        onChange={(e) => handleRadioChange(e, "Psychotic")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                <fieldset className="mt-6 justify-between md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    History of suicide attempt(s)
                    <Tooltip text="Lithium is the only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder, so it will be shown at the top of the suggested medications list.">
                      <span className="material-symbols-outlined  ml-1">
                        info
                      </span>
                    </Tooltip>
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center gap-x-3 pr-16">
                      <input
                        id="suicide"
                        name="suicide"
                        type="radio"
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "Suicide")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        value="No"
                        onChange={(e) => handleRadioChange(e, "Suicide")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                <fieldset className="mt-6 justify-between md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    History or risk of kidney disease
                    <Tooltip text="Lithium can affect kidney function, so it will not be included in the suggested medication list for patients with a risk or history of kidney disease.">
                      <span className="material-symbols-outlined  ml-1">
                        info
                      </span>
                    </Tooltip>
                  </dt>
                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center gap-x-3 pr-16">
                      <input
                        id="Kidney"
                        name="Kidney"
                        type="radio"
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "Kidney")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        onChange={(e) => handleRadioChange(e, "Kidney")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                <fieldset className="mt-6 justify-between md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    History or risk of liver disease
                    <Tooltip text="Depakote is processed through the liver, so it will not be included in the suggested medication list for patients with a risk or history of liver disease.">
                      <span className="material-symbols-outlined  ml-1">
                        info
                      </span>
                    </Tooltip>
                  </dt>
                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center gap-x-3 pr-16">
                      <input
                        id="Liver"
                        name="Liver"
                        type="radio"
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "Liver")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        onChange={(e) => handleRadioChange(e, "Liver")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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

                <fieldset className="mt-6 justify-between md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    <Tooltip text="Second-generation antipsychotics can cause low blood pressure upon standing, putting the patient at risk of passing out and hitting their head, so they will not be included in suggested medication list for patients with a risk or history of low blood pressure.">
                      History or risk of low blood pressure, or concern for
                      falls
                      <span className="material-symbols-outlined  ml-1">
                        info
                      </span>
                    </Tooltip>
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center gap-x-3 pr-16">
                      <input
                        id="blood_pressure"
                        name="blood_pressure"
                        type="radio"
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "blood_pressure")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        onChange={(e) => handleRadioChange(e, "blood_pressure")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                <fieldset className="mt-6 justify-between md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    Has weight gain concerns
                    <Tooltip text="Seroquel, Risperdal, Abilify, and Zyprexa are known for causing weight gain, so they will not be included in the suggested medications list for patients with concerns about weight gain.">
                      <span className="material-symbols-outlined  ml-1">
                        info
                      </span>
                    </Tooltip>
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center gap-x-3 pr-16">
                      <input
                        id="weight_gain"
                        name="weight_gain"
                        type="radio"
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "weight_gain")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        onChange={(e) => handleRadioChange(e, "weight_gain")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                <fieldset className="mt-6 justify-between md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    Wants to conceive in next 2 years
                    <Tooltip text="Depakote is known for causing birth defects and will not be included in the suggested medications list for patients interested in becoming pregnant.">
                      <span className="material-symbols-outlined  ml-1">
                        info
                      </span>
                    </Tooltip>
                  </dt>

                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center gap-x-3 pr-16">
                      <input
                        id="risk_pregnancy-yes"
                        name="risk_pregnancy"
                        type="radio"
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "risk_pregnancy")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        onChange={(e) => handleRadioChange(e, "risk_pregnancy")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                <fieldset className="mt-6 justify-between md:mt-0 md:grid md:grid-cols-3 md:gap-4 md:px-4 md:py-6">
                  <dt className="flex text-sm font-semibold leading-6 text-gray-900">
                    Any possibility of becoming pregnant
                    <Tooltip text="Depakote is known for causing birth defects and will not be included in the suggested medications list for patients interested in becoming pregnant.">
                      <span className="material-symbols-outlined ml-1">
                        info
                      </span>
                    </Tooltip>
                  </dt>
                  <dd className="text-sm text-gray-900 md:col-span-2 md:mt-0 md:pl-24">
                    <div className="flex items-center gap-x-3 pr-16">
                      <input
                        id="any_pregnancy-yes"
                        name="any_pregnancy"
                        type="radio"
                        value="Yes"
                        onChange={(e) => handleRadioChange(e, "any_pregnancy")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
                        value="No"
                        onChange={(e) => handleRadioChange(e, "any_pregnancy")}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
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

              {/* <div className="mt-5 items-center  md:flex">
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
              <div className="mt-5 items-center  md:flex ">
                <div className=" w-[300px]">
                  <label
                    htmlFor="current-state"
                    className="block flex text-sm font-semibold leading-6 text-gray-900"
                  >
                    Prior medications to exclude
                    <Tooltip text="Any bipolar medications entered here will not appear in the list of suggested medications, as they have already been tried without success.">
                      <span className="material-symbols-outlined  ml-1">
                        info
                      </span>
                    </Tooltip>
                  </label>
                </div>
                <div className="md:w-[500px]  md:pl-16">
                  <input
                    id="priorMedications"
                    type="ani_input"
                    value={newPatientInfo.PriorMedications}
                    onChange={(e) =>
                      setNewPatientInfo({
                        ...newPatientInfo,
                        PriorMedications: String(e.target.value),
                      })
                    }
                    placeholder="Separate medications with commas"
                    className={
                      isLoading
                        ? "input_loading peer w-1/2"
                        : "input mt-2 w-full"
                    }
                  />
                </div>
              </div>

              <div className="mt-7 flex justify-end">
                <div className="flex w-full justify-end">
                  <button
                    type="button"
                    className="btnGray mr-5"
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
                    <div className="flex items-center  justify-center">
                      <div className="mr-2 h-4 w-4 animate-ping rounded-full bg-white"></div>
                      <p>Loading...</p>
                    </div>
                  ) : (
                    <p>Submit</p>
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
