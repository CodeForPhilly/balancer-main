import "./App.css";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import Layout from "./pages/Layout/Layout";
import PatientManager from "./pages/PatientManager/PatientManager";

const App = () => {
  return (
    <DarkModeProvider>
      <Layout>
        <PatientManager />
      </Layout>
    </DarkModeProvider>
  );
};

export default App;
