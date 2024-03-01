import Layout from "../Layout/Layout";

interface HowToProps {
  title: string;
  paragraph: string[];
  instructions: string[];
}

const howToData: HowToProps = {
  title: "How To Use the Balancer App",
  paragraph: [
    "Balancer's Medication Suggestion Tool feature provides medication decision support by " +
      "offering tailored medication recommendations and comprehensive risk-benefit assessments " +
      "based on a patient's diagnosis and individual characteristics. ",
    "How to use the Balancer App: ",
  ],
  instructions: [
    "Navigate to the Medication Suggestion Tool.",
    "Select the patient's current state.",
    "Answer 'yes' or 'no' to the questions related to patient " +
    "characteristics.",
    "Reproductive status: check off any relevant reproductive status " +
    "information.",
    "Current medications: enter all of the patient's current medications. " +
    "You can separate medications with commas. It doesn't matter if you " +
    "use the generic or brand name of the medication; " +
    "Balancer will understand.",
    "Prior medications to exclude: type out a list of any medications you " +
    "want Balancer to exclude from the recommended medications list."
  ],
};

function createList(list: string[]) {
  return (
    <ol>
      {list.map((text, index) => {
        if (index !== 5) {
          return (
            <li
              className="py-1 font-satoshi text-sm text-gray-700"
              key={index}
            >
              {`${index + 1}. ${text}`}
            </li>
          );
        } else { // Custom sublist
          return (
            <li
              className="py-1 font-satoshi text-sm text-gray-700"
              key={index}
            >
              {`${index + 1}. ${text}`}
              <ol
                className="ml-4">
                <li
                  className="py-1 font-satoshi text-sm text-gray-700"
                  key="1"
                >{"a. For example, if a patient has already tried a particular medication " +
                "without success, enter the name of that medication and Balancer will " +
                "be sure not to suggest it in the results page."}
                </li>
                <li
                  className="py-1 font-satoshi text-sm text-gray-700"
                  key="2"
                >{"b. You can separate medications with commas. " +
                "Again, it doesn't matter if you use the generic or " +
                "brand name of the medication; Balancer will understand."}
                </li>
              </ol>
            </li>
          );
        }
      })}
    </ol>
  )
}

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
            {createList(howToData.instructions)}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default HowTo;
