import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { reset_password, AppDispatch } from "../../services/actions/auth";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../services/actions/types";
import { useEffect } from "react";
import Layout from "../Layout/Layout";

interface ResetPasswordProps {
  isAuthenticated: boolean;
}

function ResetPassword(props: ResetPasswordProps) {
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
    },
    onSubmit: (values) => {
      dispatch(reset_password(values.email));
    },
  });

  return (
    <>
      <Layout>
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

            <div className="flex items-center justify-between">
              <a
                className="inline-block align-baseline text-sm font-bold hover:text-blue-600"
                href="register"
              >
                Forgot Password?
              </a>
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
      </Layout>
    </>
  );
}

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

// Assign the connected component to a named constant
const ConnectedResetPassword = connect(mapStateToProps)(ResetPassword);

// Export the named constant
export default ConnectedResetPassword;
