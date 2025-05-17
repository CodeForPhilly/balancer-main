import "./App.css";
import {DarkModeProvider} from "./contexts/DarkModeContext";
import Layout from "./pages/Layout/Layout";
import PatientManager from "./pages/PatientManager/PatientManager";
import {PatientProvider} from "./contexts/PatientContext.tsx";

const App = () => {
    return (
        <DarkModeProvider>
            <PatientProvider>
                <Layout>
                    <PatientManager/>
                </Layout>
            </PatientProvider>
        </DarkModeProvider>
    );
};

export default App;
