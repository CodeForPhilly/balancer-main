import { PatientInfo } from "./PatientTypes";
// import { loader } from "../../assets";

interface PatientSummaryProps {
  patientInfo: PatientInfo;
  getMedicationInfo: any;
  loader: any;
}

const PatientSummary = ({
  patientInfo,
  getMedicationInfo,
  loader,
}: PatientSummaryProps) => {
  return (
    <div className="my-1 max-w-full flex items-center">
      {getMedicationInfo.isFetching ? (
        <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
      ) : getMedicationInfo.error ? (
        <p className="font-inter font-bold text-black text-center">
          Well, that wasn't supposed to happen...
          <br />
          <span className="font-satoshi font-normal text-gray-700">
            {getMedicationInfo.error?.data?.error}
          </span>
        </p>
      ) : (
        patientInfo.Description && (
          <div className="flex flex-col gap-3 whitespace-normal break-words">
            <h2 className="font-satoshi font-bold text-gray-600 text-xl">
              Patient <span className="blue_gradient">Summary</span>
            </h2>
            <div className="summary_box" style={{ width: "670px" }}>
              <p className="font-inter font-medium text-sm text-gray-700">
                <label
                  htmlFor="patientID"
                  className="block font-latoBold text-sm pb-2"
                >
                  {" "}
                  <b>Patient ID: </b> {patientInfo.ID}
                </label>
                <label
                  htmlFor="diagnosis"
                  className="block font-latoBold text-sm pb-2"
                >
                  <b>Diagnosis: </b> {patientInfo.Diagnosis}{" "}
                  {patientInfo.OtherDiagnosis}
                </label>
                <label
                  htmlFor="ageInput"
                  className="block font-latoBold text-sm pb-2"
                >
                  {" "}
                  <b>Current Medications: </b>
                  {patientInfo.CurrentMedications}
                </label>
                <label
                  htmlFor="currentMedications"
                  className="block font-latoBold text-sm pb-2"
                >
                  <b>Possible Medications: </b>
                  <br />
                  <br />
                  <p className="font-inter font-medium text-sm text-gray-700 whitespace-pre-wrap">
                    <pre
                      style={{
                        maxWidth: "100%",
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: patientInfo.Description,
                      }}
                    ></pre>
                    {/* {patientInfo.Description} */}
                  </p>
                </label>
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PatientSummary;
