import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";
import HourglassSpinner from "../../components/HourglassSpinner/HourglassSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { MedData } from "./MedTypes";
import { useState, useEffect } from "react";

function ListMeds () {

  const [medications, setMedications] = useState<MedData[]>([])
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    
    fetch(`${baseUrl}/V1/medications/`)
      .then(res => {
        if (!res.ok) {
          throw new Error ('Could not get medications list')
        } else {
          return res.json()
        }})
      .then(data => {
        data.sort((a, b) => {
          const nameA = a.name.toUpperCase()
          const nameB = b.name.toUpperCase()
          if (nameA < nameB) {
            return -1
          }
          if (nameA > nameB) {
            return 1
          }
        
          return 0
        })

        setMedications(data)
      })
      .catch(e => setErrors((prev) => [...prev, e.message]))
  }, [])

  const medsList = medications.map((med) => {
    
    const benefitsList = med.benefits.split(', ').map((benefit, index) => {
      return (
            <li className="text-sm" key={index}>
              {benefit}
            </li>
      )
    })
    
    const risksList = med.risks.split(', ').map((risk, index) => {
      return (
            <li className="text-sm" key={index}>
              {risk}
            </li>
      )
    })

    return(
      <details>
        <summary className="hover:cursor-pointer w-fit font-semibold leading-6 text-gray-900">{med.name}</summary>
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
  
  if (errors.length > 0) {
    return (
      <Layout>
        <div className= "mt-32">
          <ErrorMessage errors={errors}/>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mt-24 mx-auto w-full max-w-6xl">
        <Welcome subHeader="Medications" descriptionText="Check out the benefits and risks of medications."/>
        {medications.length > 0 ?
        <div className="mx-auto mt-0 w-[90%] md:mt-4 md:w-[75%] font_body rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 mt-4 md:mt-0 md:p-4 md:px-8">
          <div className="space-y-4 mb-6">
            {medsList}
          </div>
        </div>
        : <div className="mt-6 flex justify-center items-center"><HourglassSpinner/></div>}
      </div>
    </Layout>
  )
}

export default ListMeds