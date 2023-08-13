import App from "../App";
import RouteError from "../pages/404/404.tsx";
import LoginForm from "../pages/Login/Login.tsx";
import RegistrationForm from "../pages/Register/Register.tsx";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <RouteError />,
  },
  {
    path: "login",
    element: <LoginForm />,
  },
  {
    path: "register",
    element: <RegistrationForm />,
  },
];

export default routes;
