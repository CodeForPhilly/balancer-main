import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";
import { MedData, medicationsInfo } from "./MedTypes";
import { useState } from "react";

function ListMeds () {

  const [medications, setMedications] = useState<MedData[]>(medicationsInfo)

  const medsList = medications.map((med) => {
    
    const benefitsList = med.benefits.split(', ').map(benefit => {
      return (
            <li className="text-sm">
              {benefit}
            </li>
      )
    })
    
    const risksList = med.risks.split(', ').map(risk => {
      return (
            <li className="text-sm">
              {risk}
            </li>
      )
    })

    return(
      <details>
        <summary className="hover:cursor-pointer w-fit font-semibold leading-6 text-gray-900">{med.title}</summary>
        <div className="flex ml-6 mb-5">
          <div className="flex-1">
            <h3 className="mb-4 mt-4 text-sm font-medium text-indigo-600">
              Benefits:
            </h3>
            <ul className="px-4 space-y-3 list-disc">
              {benefitsList}
            </ul>  
          </div>
          <div className="flex-1">
            <h3 className="mb-4 mt-4 text-sm font-medium text-indigo-600">
              Risks:
            </h3>
            <ul className="px-4 space-y-3 list-disc">
              {risksList}
            </ul>
          </div>
        </div>
      </details>
    )
  })
  
  return (
    <Layout>
      <div className="mt-24 mx-auto w-full max-w-6xl">
        <Welcome subHeader="Medications" descriptionText="Check out the benefits and risks of medications."/>
        <div className="mx-auto mt-0 w-[90%] md:mt-4 md:w-[75%] font_body rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 mt-4 md:mt-0 md:p-4 md:px-8">
          <div className="space-y-4 mb-6">
            {medsList}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ListMeds