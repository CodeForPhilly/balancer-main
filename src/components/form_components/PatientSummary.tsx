
interface PatientInfo {
    ID: string;
    Diagnosis: string;
    OtherDiagnosis: string;
    Description: string;
    Age: number;
}

interface PatientSummaryData {
    patientInfo: PatientInfo;
    getMedicationInfo: any;
    loader: any;
}

const PatientSummary = ({patientInfo, getMedicationInfo, loader}: PatientSummaryData) => {

    return (
        <div className="my-1 max-w-full flex justify-center items-center">
            {getMedicationInfo.isFetching ? (
                <img
                    src={loader}
                    alt="loader"
                    className="w-20 h-20 object-contain"
                />
            ) : getMedicationInfo.error ? (
                <p className="font-inter font-bold text-black text-center">
                    Well, that wasn't supposed to happen...
                    <br/>
                    <span className="font-satoshi font-normal text-gray-700">
                {getMedicationInfo.error?.data?.error}
              </span>
                </p>
            ) : (
                patientInfo.Description && (
                    <div className="flex flex-col gap-3">
                        <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                            Patient <span className="blue_gradient">Summary</span>
                        </h2>
                        <div className="summary_box">
                            <p className="font-inter font-medium text-sm text-gray-700">
                                <label
                                    htmlFor="ageInput"
                                    className="block font-latoBold text-sm pb-2"
                                >
                                    {" "}
                                    <b>Patient ID: </b> {patientInfo.ID}
                                </label>
                                <label
                                    htmlFor="ageInput"
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
                                    <b>Age: </b>
                                    {patientInfo.Age}
                                </label>
                                <label
                                    htmlFor="ageInput"
                                    className="block font-latoBold text-sm pb-2"
                                >
                                    <b>{patientInfo.Description}</b>
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