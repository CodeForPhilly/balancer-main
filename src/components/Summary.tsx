import NewPatientForm from "./form_components/NewPatientForm.tsx";
import PatientHistory from "./form_components/PatientHistory.tsx";
import {useState} from "react";
import {useLazyGetMedicationInfoQuery} from "../services/medicationsApi.tsx";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {copy, loader} from "../assets";
import PatientSummary from "./form_components/PatientSummary.tsx";

const Summary = () => {

    interface PatientInfo {
        ID: string;
        Diagnosis: string;
        OtherDiagnosis: string;
        Description: string;
        Age: number;
    }

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
    const [getMedicationInfo, {error, isFetching}] =
        useLazyGetMedicationInfoQuery();

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

export default Summary;