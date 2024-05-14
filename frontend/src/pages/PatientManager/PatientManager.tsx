import { useState } from 'react';
import { Link } from 'react-router-dom';
import NewPatientForm from './NewPatientForm.tsx';
import PatientHistory from './PatientHistory.tsx';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PatientSummary from './PatientSummary.tsx';
import { PatientInfo } from './PatientTypes.ts';
import { copy } from '../../assets/index.js';
import Welcome from '../../components/Welcome/Welcome.tsx';

const PatientManager = () => {
    const [isPatientDeleted, setIsPatientDeleted] = useState<boolean>(false);

    const [patientInfo, setPatientInfo] = useState<PatientInfo>({
        ID: '',
        Diagnosis: '',
        OtherDiagnosis: '',
        Description: '',
        CurrentMedications: '',
        PriorMedications: '',
        Depression: '',
        Hypomania: '',
        Mania: '',
        Psychotic: '',
        Suicide: '',
        Kidney: '',
        Liver: '',
        blood_pressure: '',
        weight_gain: '',
        Reproductive: '',
        risk_pregnancy: '',
        PossibleMedications: {
            first: '',
            second: '',
            third: '',
        },
    });

    const handlePatientDeleted = (deletedId: string) => {
        if (patientInfo.ID === deletedId) {
            setPatientInfo({
                ID: '',
                Diagnosis: '',
                OtherDiagnosis: '',
                Description: '',
                CurrentMedications: '',
                PriorMedications: '',
                Depression: '',
                Hypomania: '',
                Mania: '',
                Psychotic: '',
                Suicide: '',
                Kidney: '',
                Liver: '',
                blood_pressure: '',
                weight_gain: '',
                Reproductive: '',
                risk_pregnancy: '',
            });

            setIsPatientDeleted(true);
        }
    };

    const [allPatientInfo, setAllPatientInfo] = useState<PatientInfo[]>([]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    // TODO: add error and loading state guards

  const descriptionEl = (<div className="md:mt-10">
    Use our tool to get medication suggestions for bipolar disorder based on patient characteristics.
    {' '}
    <Link
      to="/data-sources"
      className="mr-5 underline hover:border-blue-600 hover:text-blue-600 hover:no-underline"
    >
      Read about where we get our data.
    </Link>
  </div>);

    return (
        <div className="mt-24 flex w-full max-w-6xl flex-col items-center  md:mt-28">
            <Welcome
                subHeader="Designed to assist prescribers"
                descriptionEl={descriptionEl}
            />
            <div className="mt-0 flex w-[90%] flex-col md:mt-4 md:w-[75%] ">
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
