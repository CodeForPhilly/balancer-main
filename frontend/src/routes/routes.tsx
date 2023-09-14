import App from "../App";
import RouteError from "../pages/404/404.tsx";
// import LoginForm from "../pages/Login/Login.tsx";
import DrugSummary from "../pages/DrugSummary/DrugSummary.tsx";
import RegistrationForm from "../pages/Register/Register.tsx";
import About from "../pages/About/About.tsx";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <RouteError />,
  },
  {
    path: "drugSummary",
    element: <DrugSummary />,
  },
  {
    path: "register",
    element: <RegistrationForm />,
  },
  {
    path: "about",
    element: <About />,
  },
];

export default routes;
