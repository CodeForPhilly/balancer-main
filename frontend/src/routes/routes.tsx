import App from "../App";
import RouteError from "../pages/404/404.tsx";
import LoginForm from "../pages/Login/Login.tsx";
import ResetPassword from "../pages/Login/ResetPassword.tsx";
import ResetPasswordConfirm from "../pages/Login/ResetPasswordConfirm.tsx";
import DrugSummary from "../pages/DrugSummary/DrugSummary.tsx";
import RegistrationForm from "../pages/Register/Register.tsx";
import About from "../pages/About/About.tsx";
import Feedback from "../pages/Feedback/Feedback.tsx";
import Help from "../pages/Help/Help.tsx";

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
    path: "login",
    element: <LoginForm />,
  },
  {
    path: "resetPassword",
    element: <ResetPassword />,
  },
  {
    path: "password/reset/confirm/:uid/:token",
    element: <ResetPasswordConfirm />,
  },
  {
    path: "about",
    element: <About />,
  },
  {
    path: "help",
    element: <Help />,
  },
  {
    path: "feedback",
    element: <Feedback />,
  },
];

export default routes;
