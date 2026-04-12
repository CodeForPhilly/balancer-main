import { useFormik } from "formik";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  reset_password_confirm,
  AppDispatch,
} from "../../services/actions/auth";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../services/actions/types";
import { useEffect, useState } from "react";
import Layout from "../Layout/Layout";

interface ResetPasswordConfirmProps {
  isAuthenticated: boolean | null;
}

const ResetPasswordConfirm: React.FC<ResetPasswordConfirmProps> = ({
  isAuthenticated,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { uid, token } = useParams<{ uid: string; token: string }>();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const { handleChange, handleSubmit, values } = useFormik({
    initialValues: {
      new_password: "",
      re_new_password: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(
          reset_password_confirm(
            uid!,
            token!,
            values.new_password,
            values.re_new_password
          )
        );
        setSuccess(true);
      } catch {
        setError("This reset link is invalid or has expired. Please request a new one.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (success) {
    return (
      <Layout>
        <section className="mx-auto mt-24 w-[20rem] md:mt-48 md:w-[32rem] text-center">
          <div className="mb-4 rounded-md bg-white px-3 pb-12 pt-6 shadow-md ring-1 md:px-12">
            <h2 className="blue_gradient mb-4 font-satoshi text-3xl font-bold text-gray-600">
              Password updated
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been reset. You can now log in with your new password.
            </p>
            <Link to="/login" className="btnBlue w-full text-lg text-center block">
              Log in now
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto mt-24 w-[20rem] md:mt-48 md:w-[32rem]">
        <form
          onSubmit={handleSubmit}
          className="mb-4 rounded-md bg-white px-3 pb-12 pt-6 shadow-md ring-1 md:px-12"
        >
          <h2 className="blue_gradient mb-6 font-satoshi text-3xl font-bold text-gray-600 text-center">
            Set new password
          </h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="new_password"
              className="mb-2 block text-lg font-bold text-gray-700"
            >
              New password
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              onChange={handleChange}
              value={values.new_password}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="re_new_password"
              className="mb-2 block text-lg font-bold text-gray-700"
            >
              Confirm new password
            </label>
            <input
              id="re_new_password"
              name="re_new_password"
              type="password"
              onChange={handleChange}
              value={values.re_new_password}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <button className="btnBlue w-full text-lg" type="submit">
            Set new password
          </button>
        </form>
      </section>
    </Layout>
  );
};

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

const ConnectedResetPasswordConfirm = connect(mapStateToProps)(ResetPasswordConfirm);
export default ConnectedResetPasswordConfirm;
