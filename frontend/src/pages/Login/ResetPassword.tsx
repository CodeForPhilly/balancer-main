import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { reset_password, AppDispatch } from "../../services/actions/auth";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../services/actions/types";
import { useEffect, useState } from "react";
import Layout from "../Layout/Layout";

interface ResetPasswordProps {
  isAuthenticated: boolean;
}

function ResetPassword(props: ResetPasswordProps) {
  const { isAuthenticated } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [requestSent, setRequestSent] = useState(false);

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
      setRequestSent(true);
    },
  });

  if (requestSent) {
    navigate("/");
  }
  return (
    <>
      <Layout>
        <section className="mx-auto mt-36 w-full max-w-xs">
          <h2 className="blue_gradient mb-6 font-satoshi text-xl font-bold text-gray-600">
            Reset Password
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
              <button className="black_btn" type="submit">
                Reset Password
              </button>
            </div>
          </form>
        </section>
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
