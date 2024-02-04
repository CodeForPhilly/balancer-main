import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { login, AppDispatch } from "../../services/actions/auth";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../services/actions/types";
import { useEffect } from "react";

interface LoginFormProps {
  isAuthenticated: boolean;
}

function LoginForm(props: LoginFormProps) {
  const { isAuthenticated } = props;
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const { handleChange, handleSubmit, values } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      dispatch(login(values.email, values.password));
    },
  });

  return (
    <>
      <section className="mx-auto mt-36 w-full max-w-xs">
        <h2 className="blue_gradient mb-6 font-satoshi text-xl font-bold text-gray-600">
          Login
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              onChange={handleChange}
              value={values.email}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={handleChange}
              value={values.password}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link to="/resetpassword" className="font-bold hover:text-blue-600">
              Forgot Password?
            </Link>
            <button className="black_btn" type="submit">
              Sign In
            </button>
          </div>
        </form>
      </section>
      <p>
        Don't have an account?{" "}
        <Link to="/register" className="font-bold hover:text-blue-600">
          {" "}
          Register here
        </Link>
        .
      </p>
    </>
  );
}

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

// Assign the connected component to a named constant
const ConnectedLoginForm = connect(mapStateToProps)(LoginForm);

// Export the named constant
export default ConnectedLoginForm;
