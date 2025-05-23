import "./App.css";
import {DarkModeProvider} from "./contexts/DarkModeContext";
import Layout from "./pages/Layout/Layout";
import PatientManager from "./pages/PatientManager/PatientManager";
import {GlobalProvider} from "./contexts/GlobalContext.tsx";

const App = () => {
    return (
        <DarkModeProvider>
            <GlobalProvider>
                <Layout>
                    <PatientManager/>
                </Layout>
            </GlobalProvider>
        </DarkModeProvider>
    );
};

export default App;
