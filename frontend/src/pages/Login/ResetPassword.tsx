import { useFormik } from "formik";
import { useNavigate, Link } from "react-router-dom";
import { reset_password, AppDispatch } from "../../services/actions/auth";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../services/actions/types";
import { useEffect, useState } from "react";
import axios from "axios";
import { AUTH_ENDPOINTS } from "../../api/endpoints";
import Layout from "../Layout/Layout";

interface ResetPasswordProps {
  isAuthenticated: boolean | null;
}

function ResetPassword(props: ResetPasswordProps) {
  const { isAuthenticated } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [requestSent, setRequestSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");

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
      setSubmittedEmail(values.email);
      setRequestSent(true);
    },
  });

  const handleResend = async () => {
    try {
      await axios.post(AUTH_ENDPOINTS.RESET_PASSWORD, { email: submittedEmail });
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  if (requestSent) {
    return (
      <Layout>
        <section className="mx-auto mt-24 w-[20rem] md:mt-48 md:w-[32rem] text-center">
          <div className="mb-4 rounded-md bg-white px-3 pb-12 pt-6 shadow-md ring-1 md:px-12">
            <h2 className="blue_gradient mb-4 font-satoshi text-3xl font-bold text-gray-600">
              Check your email
            </h2>
            <p className="text-gray-600 mb-6">
              If an account exists for <strong>{submittedEmail}</strong>, you'll receive a password reset link shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btnBlue w-full text-lg text-center block">
                Back to log in
              </Link>
              <button onClick={handleResend} className="text-sm text-blue-600 hover:underline" type="button">
                {resendStatus === "sent"
                  ? "Email resent!"
                  : resendStatus === "error"
                  ? "Failed to resend. Try again."
                  : "Resend email"}
              </button>
            </div>
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
            Reset password
          </h2>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-lg font-bold text-gray-700"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              onChange={handleChange}
              value={values.email}
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-3 leading-tight text-gray-700 shadow focus:outline-none"
            />
          </div>
          <button className="btnBlue w-full text-lg" type="submit">
            Send reset link
          </button>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Back to log in
            </Link>
          </div>
        </form>
      </section>
    </Layout>
  );
}

const mapStateToProps = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

const ConnectedResetPassword = connect(mapStateToProps)(ResetPassword);
export default ConnectedResetPassword;
