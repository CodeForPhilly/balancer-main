import { FormEvent, ChangeEvent, useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import { loader } from "../../assets";
import { v4 as uuidv4 } from "uuid";
import { PatientInfo } from "./PatientTypes";
import axios from "axios";
import minLogo from "../../assets/min.svg";
import maxLogo from "../../assets/max.svg";

// TODO: refactor with Formik

export interface NewPatientFormProps {
  patientInfo: PatientInfo;
  setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;
  allPatientInfo: PatientInfo[];
  setAllPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo[]>>;
  getMedicationInfo: any;
}

const NewPatientForm = ({
  patientInfo,
  setPatientInfo,
  allPatientInfo,
  setAllPatientInfo,
}: NewPatientFormProps) => {
  const [isPressed, setIsPressed] = useState(false);

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

    const payload = {
      diagnosis: patientInfo.Diagnosis,
    };
    // const { data } = await getMedicationInfo("");
    const { data } = await axios.post(
      "http://localhost:3001/diagnosis",
      payload
    );

    const generatedGuid = uuidv4();
    const firstFiveCharacters = generatedGuid.substring(0, 5);
    console.log(firstFiveCharacters);

    setPatientInfo({ ...patientInfo, ID: firstFiveCharacters });
    if (data) {
      const description = data.message.choices[0].message.content;

      const newDescription = {
        ...patientInfo,
        Description: description,
        ID: firstFiveCharacters,
      };

      const updatedAllPatientInfo = [newDescription, ...allPatientInfo];
      setPatientInfo(newDescription);

      // console.log("Logged new description");
      setAllPatientInfo(updatedAllPatientInfo);

      localStorage.setItem(
        "patientInfos",
        JSON.stringify(updatedAllPatientInfo)
      );
    } else {
      console.log("No description came back");
    }
  };

  const handleDiagnosisChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === "Other") {
      setPatientInfo({
        ...patientInfo,
        Diagnosis: selectedValue,
      });
    } else {
      setPatientInfo({
        ...patientInfo,
        Diagnosis: selectedValue,
        OtherDiagnosis: "", // Reset the OtherDiagnosis value
      });
    }
  };

  const handleClickSummary = () => {
    setEnterNewPatient(!enterNewPatient);
  };

  return (
    <section>
      {/* {search} */}
      <div>
        <br />
        <div className="flex justify-between">
          {enterNewPatient ? (
            <div>
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Enter New <span className="blue_gradient">Patient</span>
              </h2>
            </div>
          ) : (
            <div onClick={handleClickSummary}>
              <h2 className="font-satoshi font-bold text-gray-600 text-xl hover:border-blue-600 hover:border-b-2">
                Click To Enter New
                <span className="blue_gradient"> Patient</span>
              </h2>
            </div>
          )}
          <div onClick={handleClickSummary}>
            {enterNewPatient ? (
              <img
                src={minLogo}
                alt="logo"
                className="md:w-7 md:h-7 hover:border-blue-600 hover:border-b-2"
              />
            ) : (
              <img
                src={maxLogo}
                alt="logo"
                className="md:w-7 md:h-7 hover:border-blue-600 hover:border-b-2"
              />
            )}
          </div>
        </div>
        {enterNewPatient && (
          <form onSubmit={handleSubmit}>
            {/* <img
            src={linkIcon}
            alt="link-icon"
            className="absolute left-0 my-2 ml-3 w-5"
          /> */}
            <div>
              <label
                htmlFor="name"
                className="block font-latoBold text-sm pb-2"
              >
                Patient ID:{" "}
              </label>
              <input
                type="text"
                placeholder="Patient ID will be created on submit"
                value={patientInfo.ID}
                readOnly
                className="url_input peer w-1/2"
              />
            </div>
            <div className=" mt-5">
              <label
                htmlFor="diagnosis"
                className="block font-latoBold text-sm pb-2"
              >
                Diagnosis:
              </label>
              <select
                value={patientInfo.Diagnosis}
                onChange={handleDiagnosisChange}
                required
                className="url_input peer"
              >
                <option value="Other">Select a diagnosis</option>
                <option value="Bipolar I mania">Bipolar I mania</option>
                <option value="Bipolar I depression">
                  Bipolar I depression
                </option>
                <option value="Bipolar II hypomania">
                  Bipolar II hypomania
                </option>
                <option value="Bipolar II depression">
                  Bipolar II depression
                </option>
                <option value="Bipolar mixed episodes">
                  Bipolar mixed episodes
                </option>
                <option value="Cyclothymic disorder">
                  Cyclothymic disorder
                </option>
              </select>
              {patientInfo.Diagnosis === "Other" && (
                <input
                  type="text"
                  placeholder="Please specify"
                  value={patientInfo.OtherDiagnosis}
                  onChange={(e) =>
                    setPatientInfo({
                      ...patientInfo,
                      OtherDiagnosis: e.target.value,
                    })
                  }
                  required
                  className="url_input peer"
                />
              )}
            </div>
            <div className="items-center mt-5">
              <label
                htmlFor="currentMedications"
                className="block font-latoBold text-sm pb-2"
              >
                Current Medications:
              </label>
              <input
                id="currentMedications"
                type="string"
                value={patientInfo.CurrentMedications}
                onChange={(e) =>
                  setPatientInfo({
                    ...patientInfo,
                    CurrentMedications: String(e.target.value),
                  })
                }
                required
                className="url_input peer"
              />
            </div>

            <div className="flex justify-center mt-5">
              <button
                type="submit"
                className={`black_btn peer-focus:border-gray-700 peer-focus:text-gray-700 ${
                  isPressed
                    ? ""
                    : "transition-transform hover:scale-105 focus:outline-none focus:ring focus:ring-blue-500"
                }`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                <p>Submit</p>
              </button>
            </div>
          </form>
        )}
        <br />
      </div>

      {/* {patientInfo.ID && (
        <div>
          <p>ID: {patientInfo.ID}</p>
          <p>Diagnosis: {patientInfo.Diagnosis}</p>
          <p>Description: {patientInfo.Description}</p>
        </div>
      )} */}
    </section>
  );
};

export default NewPatientForm;
