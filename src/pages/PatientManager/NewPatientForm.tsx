import { FormEvent, ChangeEvent, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import { loader } from "../../assets";
import { v4 as uuidv4 } from "uuid";
import { PatientInfo } from "./PatientTypes";
import axios from "axios";

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
    console.log(data);
    const generatedGuid = uuidv4();

    setPatientInfo({ ...patientInfo, ID: generatedGuid });
    if (data) {
      const description = data.message.choices[0].message.content;

      const newDescription = {
        ...patientInfo,
        Description: description,
        ID: generatedGuid,
      };
      console.log(data);
      const updatedAllPatientInfo = [newDescription, ...allPatientInfo];
      setPatientInfo(newDescription);

      console.log("Logged new description");
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

  return (
    <section>
      {/* {search} */}
      <div>
        <br />
        <div>
          {" "}
          <h2 className="font-satoshi font-bold text-gray-600 text-xl">
            Enter New <span className="blue_gradient">Patient</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* <img
            src={linkIcon}
            alt="link-icon"
            className="absolute left-0 my-2 ml-3 w-5"
          /> */}
          <div>
            <label htmlFor="name" className="block font-latoBold text-sm pb-2">
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
              htmlFor="ageInput"
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
              <option value="Bipolar I depression">Bipolar I depression</option>
              <option value="Bipolar II hypomania">Bipolar II hypomania</option>
              <option value="Bipolar II depression">
                Bipolar II depression
              </option>
              <option value="Bipolar mixed episodes">
                Bipolar mixed episodes
              </option>
              <option value="Cyclothymic disorder">Cyclothymic disorder</option>
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
              htmlFor="ageInput"
              className="block font-latoBold text-sm pb-2"
            >
              Current Medications:
            </label>
            <input
              id="ageInput"
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
              className="black_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
            >
              <p>Submit</p>
            </button>
          </div>
        </form>
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
