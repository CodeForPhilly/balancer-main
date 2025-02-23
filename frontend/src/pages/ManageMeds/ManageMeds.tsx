import { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import Welcome from "../../components/Welcome/Welcome";
import ErrorMessage from "../../components/ErrorMessage";
import { api } from "../../api/apiClient";

function ManageMedications() {
  interface MedData {
    id: string;
    name: string;
    benefits: string;
    risks: string;
  }

  const [medications, setMedications] = useState<MedData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newMedName, setNewMedName] = useState("");
  const [newMedBenefits, setNewMedBenefits] = useState("");
  const [newMedRisks, setNewMedRisks] = useState("");
  const [showAddMed, setShowAddMed] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Fetch Medications
  const fetchMedications = async () => {
    try {
      const url = `${baseUrl}/v1/api/get_full_list_med`;
      const { data } = await api.get(url);
      data.sort((a: MedData, b: MedData) => a.name.localeCompare(b.name));
      setMedications(data);
    } catch (e: unknown) {
      setErrors((prev) => [...prev, e instanceof Error ? e.message : "An unknown error occurred"]);
    }
  };

  // Handle Delete Medication
  const handleDelete = async (name: string) => {
    try {
      await api.delete(`${baseUrl}/v1/api/delete_med`, { data: { name } });
      setMedications((prev) => prev.filter((med) => med.name !== name));
      setConfirmDelete(null);
    } catch (e: unknown) {
      setErrors((prev) => [...prev, e instanceof Error ? e.message : "An error occurred while deleting"]);
    }
  };

  // Handle Add Medication
  const handleAddMedication = async () => {
    if (!newMedName.trim() || !newMedBenefits.trim() || !newMedRisks.trim()) {
      setErrors((prev) => [...prev, "All fields (Name, Benefits, Risks) are required"]);
      return;
    }

    try {
      await api.post(`${baseUrl}/v1/api/add_medication`, {
        name: newMedName,
        benefits: newMedBenefits,
        risks: newMedRisks,
      });

      setNewMedName("");
      setNewMedBenefits("");
      setNewMedRisks("");
      setShowAddMed(false);
      fetchMedications(); // Refresh the list after adding
    } catch (e: unknown) {
      setErrors((prev) => [...prev, e instanceof Error ? e.message : "An error occurred while adding medication"]);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <Layout>
      <div className="mx-auto mt-24 w-full max-w-6xl">
        <Welcome subHeader="Medications" descriptionText="Check out the benefits and risks of medications." />

        <div className="font_body mx-auto mt-4 w-[90%] rounded-md border bg-white p-2 px-3 ring-1 hover:ring-slate-300 md:w-[75%] md:p-4 md:px-8">
          
          {/* Add Medication Section */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">New Medication...?</h2>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              onClick={() => setShowAddMed(true)}
            >
              Add Medication
            </button>
          </div>

          {showAddMed && (
            <div className="mb-4 space-y-2">
              <input
                type="text"
                className="w-full px-3 py-1 border rounded-md"
                placeholder="Enter medication name"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
              />
              <input
                type="text"
                className="w-full px-3 py-1 border rounded-md"
                placeholder="Enter benefits"
                value={newMedBenefits}
                onChange={(e) => setNewMedBenefits(e.target.value)}
              />
              <input
                type="text"
                className="w-full px-3 py-1 border rounded-md"
                placeholder="Enter risks"
                value={newMedRisks}
                onChange={(e) => setNewMedRisks(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleAddMedication}
                >
                  Submit
                </button>
                <button
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  onClick={() => setShowAddMed(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Medications List */}
          <div className="mb-6 space-y-4">
            {medications.length === 0 ? (
              <p className="text-gray-500">No medications available.</p>
            ) : (
              medications.map((med) => (
                <div key={med.id} className="w-full flex justify-between items-center border-b pb-2 mb-2">
                  <span className="text-lg font-bold leading-6 text-gray-900">{med.name}</span>
                  <div>
                    {confirmDelete === med.name ? (
                      // Show only "Confirm Delete" and "Cancel" when confirming deletion
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600"
                          onClick={() => setConfirmDelete(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-red-700 text-white text-sm font-medium rounded-md hover:bg-red-800"
                          onClick={() => handleDelete(med.name)}
                        >
                          Confirm Delete
                        </button>
                      </div>
                    ) : (
                      // Show only "Delete" when not in confirmation mode
                      <button
                        className="ml-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(med.name);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-32">
          <ErrorMessage errors={errors} />
        </div>
      )}
    </Layout>
  );
}

export default ManageMedications;
