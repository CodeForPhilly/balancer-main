import { useEffect, useState } from "react";
import { publicApi } from "../../api/apiClient";

export interface MedData {
  name: string;
  benefits: string;
  risks: string;
}

export function useMedications() {
  const [medications, setMedications] = useState<MedData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const url = `/api/v1/api/get_full_list_med`;

        const { data } = await publicApi.get(url);

        data.sort((a: MedData, b: MedData) => {
          const nameA = a.name.toUpperCase();
          const nameB = b.name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          return 0;
        });

        setMedications(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErrors((prev) => [...prev, e.message]);
        } else {
          setErrors((prev) => [...prev, "An unknown error occurred"]);
        }
      }
    };

    fetchMedications();
  }, []);

  console.log(medications);

  return { medications, errors };
}
