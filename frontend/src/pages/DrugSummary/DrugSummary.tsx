import DrugSummaryForm from "./DrugSummaryForm";
import Layout_V2_Main from "../Layout/Layout_V2_Main";
import { GlobalProvider } from "../../../src/contexts/GlobalContext";

const DocContextualChat: React.FC = () => {
  return (
    <GlobalProvider>
      <Layout_V2_Main>
        <DrugSummaryForm />
      </Layout_V2_Main>
    </GlobalProvider>
  );
};

export default DocContextualChat;
