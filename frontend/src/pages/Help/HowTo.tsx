import Layout from "../Layout/Layout";

interface HowToProps {
  title: string;
  paragraph: string[];
  instructions: string[];
}

const howToData: HowToProps = {
  title: "How To Use the Balancer App",
  paragraph: [
    "Balancer's Medication Suggester feature provides medication decision support by " +
      "offering tailored medication recommendations and comprehensive risk-benefit assessments " +
      "based on a patient's diagnosis and individual characteristics. ",
    "Here is how to use it: ",
  ],
  instructions: [
    "1. Navigate to the Medication Suggester.",
    "2. Select the patient's current state.",
    "3. Answer 'yes' or 'no' to the questions related to patient characteristics.",
    "4. Check off any relevant reproductive status information.",
    "5. Type out a list of the patient's current medications. ",
    "6. You can separate medications with commas. It doesn't matter if you use the generic or " +
    "brand name of the medication; Balancer will understand.",
    "7. Type out a list of any medications you want Balancer to exclude from the recommended " +
      "medications list. (For example, if a patient has already tried a particular medication " +
      "without success, enter the name of that medication and Balancer will be sure not to " +
      "suggest it in the results page.) You can separate medications with commas. Again, " +
      "it doesn't matter if you use the generic or brand name of the medication; Balancer will " +
      "understand.",
  ],
};

function HowTo() {
  return (
    <Layout>
      <div className="mt-20 flex w-full max-w-6xl flex-col items-center justify-center px-8">
        <h3 className="mt-10 flex items-center justify-center py-4 text-xl">
          {howToData.title}
        </h3>
        <div className="flex flex-col rounded-xl border-2 border-blue-100 bg-neutral-50 px-4 py-4 shadow-md">
          <div className="flex flex-col px-2 py-2">
            <p className="font-satoshi text-sm text-gray-700">
              {howToData.paragraph[0]}
            </p>
            <p className="py-2 font-satoshi text-sm text-gray-600">
              {howToData.paragraph[1]}
            </p>
          </div>
          <div className="flex px-6">
            <ol>
              {howToData.instructions.map((text, index) => {
                return (
                  <li
                    className="py-1 font-satoshi text-sm text-gray-700"
                    key={index}
                  >
                    {text}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HowTo;
